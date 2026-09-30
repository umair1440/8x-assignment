import { createSlice } from '@reduxjs/toolkit'

const WISHLIST_STORAGE_KEY = 'saved_products'

function readStoredItems() {
  if (typeof window === 'undefined') return []

  try {
    const items = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) ?? '[]')
    return Array.isArray(items) ? items : []
  } catch {
    return []
  }
}

function persistItems(items) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items))
  }
}

function getProductId(product) {
  return product.id ?? product.slug ?? product.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
}

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: readStoredItems() },
  reducers: {
    toggleWishlistItem: (state, action) => {
      const product = action.payload
      const id = getProductId(product)
      const existingIndex = state.items.findIndex((item) => item.id === id)

      if (existingIndex >= 0) {
        state.items.splice(existingIndex, 1)
      } else {
        state.items.push({ ...product, id })
      }

      persistItems(state.items)
    },
    removeWishlistItem: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
      persistItems(state.items)
    },
    clearWishlist: (state) => {
      state.items = []
      persistItems(state.items)
    },
  },
})

export const { toggleWishlistItem, removeWishlistItem, clearWishlist } = wishlistSlice.actions
export default wishlistSlice.reducer