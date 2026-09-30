const fs = require('fs');
const path = require('path');

const historyFile = path.join(process.cwd(), 'copilot-conversations.md');

function getStdin() {
    return new Promise((resolve, reject) => {
        let data = '';
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', (chunk) => { data += chunk; });
        process.stdin.on('end', () => resolve(data));
        process.stdin.on('error', reject);
    });
}

function readLatestExchange(transcriptPath) {
    if (!transcriptPath || !fs.existsSync(transcriptPath)) return null;

    const events = fs.readFileSync(transcriptPath, 'utf8')
        .split(/\r?\n/)
        .filter(Boolean)
        .flatMap((line) => {
            try {
                return [JSON.parse(line)];
            } catch {
                return [];
            }
        });

    let latestUserIndex = -1;
    for (let index = 0; index < events.length; index += 1) {
        if (events[index].type === 'user.message') latestUserIndex = index;
    }
    if (latestUserIndex < 0) return null;

    const prompt = events[latestUserIndex].data?.content ?? null;
    const responses = events.slice(latestUserIndex + 1)
        .filter((event) =>
            event.type === 'assistant.message' &&
            typeof event.data?.content === 'string' &&
            event.data.content.trim()
        );

    const lastResponse = responses[responses.length - 1]?.data.content;
    return lastResponse ? { prompt, response: lastResponse } : null;
}

async function run() {
    const hookType = process.argv[2] || 'Unknown';

    try {
        const rawInput = await getStdin();
        const payload = rawInput.trim() ? JSON.parse(rawInput) : null;

        if (hookType === 'Stop') {
            const exchange = readLatestExchange(payload?.transcript_path);
            if (exchange) {
                const entry = [
                    `## ${new Date().toLocaleString()}`,
                    `Session: ${payload?.session_id ?? 'unknown'}`,
                    '',
                    '### Input',
                    exchange.prompt,
                    '',
                    '### Output',
                    exchange.response,
                    '',
                    '---',
                    '',
                ].join('\n');

                fs.appendFileSync(historyFile, entry, 'utf8');
            }
        }
    } catch (error) {
        process.stderr.write(`Copilot history hook failed: ${error.message}\n`);
    }

    process.stdout.write('{}');
}

run();