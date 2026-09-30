function getStorageKey(collection, userId) {
  return `elite_${collection}_${userId}`
}

export function readAccountCollection(collection, userId) {
  if (!userId) return []

  try {
    const values = JSON.parse(localStorage.getItem(getStorageKey(collection, userId)) ?? '[]')
    return Array.isArray(values) ? values : []
  } catch {
    return []
  }
}

export function writeAccountCollection(collection, userId, values) {
  if (!userId) return
  localStorage.setItem(getStorageKey(collection, userId), JSON.stringify(values))
}

export function createLocalId() {
  return globalThis.crypto?.randomUUID?.() ?? `local-${Date.now()}-${Math.random().toString(36).slice(2)}`
}