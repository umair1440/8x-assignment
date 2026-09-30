import { createSlice } from '@reduxjs/toolkit'

const STORAGE_KEY = 'elite_seller_session'

function readSession() {
  if (typeof window === 'undefined') return { seller: null, isAuthenticated: false }
  try {
    const seller = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    return { seller, isAuthenticated: Boolean(seller?.id) }
  } catch {
    return { seller: null, isAuthenticated: false }
  }
}

const sellerAuthSlice = createSlice({
  name: 'sellerAuth',
  initialState: readSession(),
  reducers: {
    setSellerSession: (state, action) => {
      state.seller = action.payload
      state.isAuthenticated = Boolean(action.payload?.id)
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(state.seller))
    },
    updateSellerProfile: (state, action) => {
      state.seller = { ...state.seller, ...action.payload }
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(state.seller))
    },
    clearSellerSession: (state) => {
      state.seller = null
      state.isAuthenticated = false
      if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY)
    },
  },
})

export const { setSellerSession, updateSellerProfile, clearSellerSession } = sellerAuthSlice.actions
export default sellerAuthSlice.reducer