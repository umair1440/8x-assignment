const PRODUCTS_STORAGE_KEY = 'elite_seller_products'

function readAllProducts() {
  try {
    const products = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY) ?? '[]')
    return Array.isArray(products) ? products : []
  } catch {
    return []
  }
}

function writeAllProducts(products) {
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products))
}

export function readSellerProducts(sellerId) {
  return readAllProducts().filter((product) => product.sellerId === sellerId)
}

export function readAllSellerProducts() {
  return readAllProducts()
}

export function readSellerProduct(sellerId, productId) {
  return readSellerProducts(sellerId).find((product) => product.id === productId) ?? null
}

export function saveSellerProduct(product) {
  writeAllProducts([...readAllProducts(), product])
}

export function updateSellerProduct(sellerId, productId, updates) {
  const products = readAllProducts()
  const productIndex = products.findIndex((product) => product.sellerId === sellerId && product.id === productId)
  if (productIndex < 0) return false
  products[productIndex] = { ...products[productIndex], ...updates, id: productId, sellerId }
  writeAllProducts(products)
  return true
}

export function deleteSellerProduct(sellerId, productId) {
  writeAllProducts(readAllProducts().filter((product) => product.sellerId !== sellerId || product.id !== productId))
}

export function readSellerOrders(sellerId) {
  const orderStorageKeys = Object.keys(localStorage).filter((key) => key.startsWith('elite_orders_'))
  return orderStorageKeys.flatMap((key) => {
    try {
      const orders = JSON.parse(localStorage.getItem(key) ?? '[]')
      return Array.isArray(orders)
        ? orders.map((order) => ({ ...order, items: order.items.filter((item) => item.sellerId === sellerId) }))
          .filter((order) => order.items.length > 0)
        : []
    } catch {
      return []
    }
  })
}