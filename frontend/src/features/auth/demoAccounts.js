const ACCOUNTS_STORAGE_KEY = 'elite_demo_accounts'

function readAccounts() {
  try {
    const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_STORAGE_KEY) ?? '[]')
    return Array.isArray(accounts) ? accounts : []
  } catch {
    return []
  }
}

function writeAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts))
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

async function hashPassword(password) {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Secure password hashing is unavailable in this browser.')
  }

  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function toPublicUser({ passwordHash, ...user }) {
  return user
}

export async function registerDemoAccount({ name, email, password }) {
  const accounts = readAccounts()
  const normalizedEmail = email.trim().toLowerCase()

  if (accounts.some((account) => account.email.toLowerCase() === normalizedEmail)) {
    throw new Error('An account with this email already exists. Please sign in instead.')
  }

  const account = {
    id: createId(),
    name: name.trim(),
    email: normalizedEmail,
    phone: '',
    provider: 'Email',
    joinedAt: new Date().toISOString(),
    passwordHash: await hashPassword(password),
  }

  writeAccounts([...accounts, account])
  return toPublicUser(account)
}

export async function loginDemoAccount({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase()
  const account = readAccounts().find((candidate) => candidate.email.toLowerCase() === normalizedEmail)

  if (!account || account.passwordHash !== await hashPassword(password)) {
    throw new Error('Email or password is incorrect. Try again or create an account.')
  }

  return toPublicUser(account)
}

export function getGoogleDemoUser() {
  const email = 'google.demo@elite-commerce.test'
  const accounts = readAccounts()
  let account = accounts.find((candidate) => candidate.email === email)

  if (!account) {
    account = {
      id: createId(),
      name: 'Google Demo User',
      email,
      phone: '',
      provider: 'Google (demo)',
      joinedAt: new Date().toISOString(),
    }
    writeAccounts([...accounts, account])
  }

  return toPublicUser(account)
}

export function updateDemoAccount(user) {
  const accounts = readAccounts()
  const updatedAccounts = accounts.map((account) => (
    account.id === user.id ? { ...account, name: user.name, phone: user.phone ?? '' } : account
  ))
  writeAccounts(updatedAccounts)
}

export async function changeDemoPassword({ userId, currentPassword, newPassword }) {
  const accounts = readAccounts()
  const accountIndex = accounts.findIndex((account) => account.id === userId)
  const account = accounts[accountIndex]

  if (!account || account.provider !== 'Email') {
    throw new Error('Password changes are only available for email demo accounts.')
  }

  if (account.passwordHash !== await hashPassword(currentPassword)) {
    throw new Error('Your current password is incorrect.')
  }

  accounts[accountIndex] = { ...account, passwordHash: await hashPassword(newPassword) }
  writeAccounts(accounts)
}