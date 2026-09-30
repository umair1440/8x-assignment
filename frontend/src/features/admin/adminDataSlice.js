import { createSlice } from '@reduxjs/toolkit'
import { demoProducts, getProductPriceValue } from '../products/productCatalog'

const STORAGE_KEY = 'elite_admin_data'
const USER_STORAGE_KEY = 'elite_demo_accounts'
const STATUSES = ['Placed', 'Shipped', 'Delivered', 'Cancelled']
const buyerNames = [
  'Avery Morgan', 'Jordan Lee', 'Taylor Brooks', 'Riley Carter', 'Casey Bennett',
  'Morgan Ellis', 'Jamie Parker', 'Drew Collins', 'Quinn Foster', 'Cameron Reed',
  'Skyler Hayes', 'Alex Rivera', 'Peyton Ross', 'Reese Cooper', 'Rowan Bailey',
  'Emerson Ward', 'Dakota Price', 'Finley James', 'Kendall Gray', 'Harper Bell',
  'Logan Murphy', 'Sage Howard', 'Ari Sullivan', 'Elliot Hughes', 'Blake Turner',
]

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
}

function makeSeedUsers() {
  const now = Date.now()
  return buyerNames.map((name, index) => ({
    id: `demo-user-${String(index + 1).padStart(2, '0')}`,
    name,
    email: `customer${String(index + 1).padStart(2, '0')}@elite.test`,
    phone: `+1 415 555 ${String(1000 + index).slice(-4)}`,
    joinedAt: new Date(now - ((index + 5) * 86400000 * 9)).toISOString(),
    source: 'demo',
  }))
}

function makeSeedProducts() {
  return demoProducts.map((product, index) => ({
    ...product,
    price: getProductPriceValue(product.price),
    stock: product.inStock === false ? 0 : 8 + ((index * 7) % 43),
    status: 'Active',
    source: 'demo',
    createdAt: new Date(Date.now() - ((index + 3) * 86400000 * 2)).toISOString(),
  }))
}

function makeSeedOrders(users, products) {
  return Array.from({ length: 60 }, (_, orderIndex) => {
    const user = users[(orderIndex * 7 + 3) % users.length]
    const lineCount = (orderIndex % 3) + 1
    const items = Array.from({ length: lineCount }, (_, itemIndex) => {
      const product = products[(orderIndex * 5 + itemIndex * 3) % products.length]
      const quantity = ((orderIndex + itemIndex) % 3) + 1
      return {
        id: `${product.id}-${orderIndex}-${itemIndex}`,
        productId: product.id,
        name: product.name,
        image: product.image,
        category: product.category,
        unitPrice: product.price,
        quantity,
        sellerId: null,
      }
    })
    const subtotal = items.reduce((total, item) => total + item.unitPrice * item.quantity, 0)
    const shipping = subtotal >= 75 ? 0 : 6.99
    const daysAgo = (orderIndex * 11) % 180
    const createdAt = new Date(Date.now() - (daysAgo * 86400000)).toISOString()

    return {
      id: `demo-order-${String(orderIndex + 1).padStart(4, '0')}`,
      number: `EL-${String(10401 + orderIndex)}`,
      userId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      createdAt,
      status: STATUSES[(orderIndex * 3 + 1) % STATUSES.length],
      items,
      address: {
        recipient: user.name,
        line1: `${120 + orderIndex} Market Street`,
        city: ['San Francisco', 'Portland', 'Austin', 'Denver', 'Seattle'][orderIndex % 5],
        region: ['CA', 'OR', 'TX', 'CO', 'WA'][orderIndex % 5],
        postalCode: String(94100 + orderIndex),
        country: 'United States',
      },
      paymentMethod: { brand: ['Visa', 'Mastercard', 'Amex'][orderIndex % 3], last4: String(1000 + orderIndex) },
      subtotal,
      shipping,
      total: subtotal + shipping,
      source: 'demo',
    }
  })
}

function readLocalArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function readBuyerAccounts() {
  return readLocalArray(USER_STORAGE_KEY).map(({ passwordHash, ...user }) => user)
}

function readLocalOrders() {
  const orders = []
  Object.keys(localStorage).filter((key) => key.startsWith('elite_orders_')).forEach((key) => {
    const userId = key.slice('elite_orders_'.length)
    readLocalArray(key).forEach((order) => orders.push({ ...order, userId, source: 'local' }))
  })
  return orders
}

function makeInitialState() {
  const seedUsers = makeSeedUsers()
  const products = makeSeedProducts()
  const generated = { users: seedUsers, orders: makeSeedOrders(seedUsers, products), products }
  let saved = null
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
  } catch {
    saved = null
  }

  const state = {
    users: saved?.users?.length ? saved.users : generated.users,
    products: saved?.products?.length ? saved.products : generated.products,
    orders: saved?.orders?.length ? saved.orders : generated.orders,
  }
  const savedOrderById = new Map(state.orders.map((order) => [String(order.id), order]))

  readLocalOrders().forEach((order) => {
    const existing = savedOrderById.get(String(order.id))
    savedOrderById.set(String(order.id), existing ? { ...existing, ...order, source: 'local', userId: order.userId } : order)
  })
  state.orders = [...savedOrderById.values()]

  const usersByEmail = new Map(state.users.map((user) => [user.email.toLowerCase(), user]))
  readBuyerAccounts().forEach((user) => {
    if (!user.email) return
    usersByEmail.set(user.email.toLowerCase(), {
      ...usersByEmail.get(user.email.toLowerCase()),
      ...user,
      source: 'local',
    })
  })
  state.users = [...usersByEmail.values()].map((user) => {
    const userOrders = state.orders.filter((order) => order.userId === user.id || order.customerEmail?.toLowerCase() === user.email.toLowerCase())
    return {
      ...user,
      orderCount: userOrders.length,
      totalSpent: userOrders.filter((order) => order.status !== 'Cancelled').reduce((total, order) => total + (Number(order.total) || 0), 0),
    }
  })

  return state
}

function persist(state) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ users: state.users, orders: state.orders, products: state.products }))
  }
}

function refreshUserTotals(state) {
  state.users.forEach((user) => {
    const userOrders = state.orders.filter((order) => order.userId === user.id || order.customerEmail?.toLowerCase() === user.email?.toLowerCase())
    user.orderCount = userOrders.length
    user.totalSpent = userOrders.filter((order) => order.status !== 'Cancelled').reduce((total, order) => total + (Number(order.total) || 0), 0)
  })
}

const adminDataSlice = createSlice({
  name: 'adminData',
  initialState: makeInitialState(),
  reducers: {
    updateOrderStatus: (state, action) => {
      const { id, status } = action.payload
      if (!STATUSES.includes(status)) return
      const order = state.orders.find((item) => String(item.id) === String(id))
      if (!order) return
      order.status = status
      if (order.source === 'local' && order.userId) {
        const orderKey = `elite_orders_${order.userId}`
        const buyerOrders = readLocalArray(orderKey).map((buyerOrder) => String(buyerOrder.id) === String(id) ? { ...buyerOrder, status } : buyerOrder)
        localStorage.setItem(orderKey, JSON.stringify(buyerOrders))
      }
      refreshUserTotals(state)
      persist(state)
    },
    mergeLocalUser: (state, action) => {
      const user = action.payload
      if (!user?.email || user.isAdmin) return
      const index = state.users.findIndex((item) => item.email.toLowerCase() === user.email.toLowerCase())
      const mergedUser = { ...(index >= 0 ? state.users[index] : {}), ...user, source: 'local' }
      if (index >= 0) state.users[index] = mergedUser
      else state.users.unshift(mergedUser)
      refreshUserTotals(state)
      persist(state)
    },
    mergeLocalOrder: (state, action) => {
      const order = { ...action.payload, source: 'local' }
      const index = state.orders.findIndex((item) => String(item.id) === String(order.id))
      if (index >= 0) state.orders[index] = { ...state.orders[index], ...order }
      else state.orders.unshift(order)
      refreshUserTotals(state)
      persist(state)
    },
    addAdminProduct: (state, action) => {
      state.products.unshift(action.payload)
      persist(state)
    },
    updateAdminProduct: (state, action) => {
      const index = state.products.findIndex((product) => String(product.id) === String(action.payload.id))
      if (index < 0) return
      state.products[index] = { ...state.products[index], ...action.payload, updatedAt: new Date().toISOString() }
      persist(state)
    },
    deleteAdminProduct: (state, action) => {
      state.products = state.products.filter((product) => String(product.id) !== String(action.payload))
      persist(state)
    },
  },
})

export const { updateOrderStatus, mergeLocalUser, mergeLocalOrder, addAdminProduct, updateAdminProduct, deleteAdminProduct } = adminDataSlice.actions
export default adminDataSlice.reducer