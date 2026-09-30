const SELLERS_STORAGE_KEY = 'elite_seller_accounts'

function readAccounts() {
  try {
    const accounts = JSON.parse(localStorage.getItem(SELLERS_STORAGE_KEY) ?? '[]')
    return Array.isArray(accounts) ? accounts : []
  } catch {
    return []
  }
}

function writeAccounts(accounts) {
  localStorage.setItem(SELLERS_STORAGE_KEY, JSON.stringify(accounts))
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `seller-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

async function hashPassword(password) {
  if (!globalThis.crypto?.subtle) throw new Error('Secure password hashing is unavailable in this browser.')
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function toPublicSeller({ passwordHash, ...seller }) {
  return seller
}

export async function registerSeller({ name, storeName, email, password }) {
  const accounts = readAccounts()
  const normalizedEmail = email.trim().toLowerCase()
  if (accounts.some((seller) => seller.email === normalizedEmail)) {
    throw new Error('A seller account with this email already exists.')
  }

  const seller = {
    id: createId(),
    name: name.trim(),
    storeName: storeName.trim(),
    email: normalizedEmail,
    createdAt: new Date().toISOString(),
    passwordHash: await hashPassword(password),
  }
  writeAccounts([...accounts, seller])
  return toPublicSeller(seller)
}

export async function loginSeller({ email, password }) {
  const seller = readAccounts().find((account) => account.email === email.trim().toLowerCase())
  if (!seller || seller.passwordHash !== await hashPassword(password)) {
    throw new Error('Email or password is incorrect.')
  }
  return toPublicSeller(seller)
}

export function updateSellerAccount(seller) {
  const updatedAccounts = readAccounts().map((account) => (
    account.id === seller.id
      ? { ...account, name: seller.name, storeName: seller.storeName, phone: seller.phone ?? '', description: seller.description ?? '' }
      : account
  ))
  writeAccounts(updatedAccounts)
}