import { createSlice } from '@reduxjs/toolkit'

const GUEST_CART_TOKEN_KEY = 'guest_cart_token'
const CART_STORAGE_KEY = 'shopping_cart'

const readStoredItems = () => {
  if (typeof window === 'undefined') return []

  try {
    const storedItems = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? '[]')
    return Array.isArray(storedItems) ? storedItems : []
  } catch {
    return []
  }
}

const getGuestToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(GUEST_CART_TOKEN_KEY) ?? null
}

const persistItems = (items) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }
}

const getProductId = (product) => product.id ?? product.slug ?? product.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')

const getPriceValue = (price) => Number.parseFloat(String(price).replace(/[^\d.]/g, '')) || 0

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    guestToken: getGuestToken(),
    items: readStoredItems(),
  },
  reducers: {
    addCartItem: (state, action) => {
      const product = action.payload
      const id = getProductId(product)
      const quantity = Math.max(1, Number(product.quantity) || 1)
      const existingItem = state.items.find((item) => item.id === id)

      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        state.items.push({
          ...product,
          id,
          unitPrice: getPriceValue(product.price),
          quantity,
        })
      }

      persistItems(state.items)
    },
    setCartItemQuantity: (state, action) => {
      const { id, quantity } = action.payload
      const item = state.items.find((cartItem) => cartItem.id === id)

      if (item && quantity > 0) {
        item.quantity = quantity
        persistItems(state.items)
      }
    },
    removeCartItem: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
      persistItems(state.items)
    },
    clearCart: (state) => {
      state.items = []
      persistItems(state.items)
    },
    setGuestCartToken: (state, action) => {
      state.guestToken = action.payload ?? null
      if (typeof window !== 'undefined') {
        if (state.guestToken) {
          localStorage.setItem(GUEST_CART_TOKEN_KEY, state.guestToken)
        } else {
          localStorage.removeItem(GUEST_CART_TOKEN_KEY)
        }
      }
    },
    clearGuestCartToken: (state) => {
      state.guestToken = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem(GUEST_CART_TOKEN_KEY)
      }
    },
  },
})

export const {
  addCartItem,
  setCartItemQuantity,
  removeCartItem,
  clearCart,
  setGuestCartToken,
  clearGuestCartToken,
} = cartSlice.actions
export default cartSlice.reducer
