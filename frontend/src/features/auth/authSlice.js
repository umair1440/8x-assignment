import { createSlice } from '@reduxjs/toolkit'

const STORAGE_KEY = 'auth_state'

const readStoredAuth = () => {
  if (typeof window === 'undefined') {
    return { user: null, token: null, isAuthenticated: false }
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { user: null, token: null, isAuthenticated: false }
    }

    const parsed = JSON.parse(raw)
    return {
      user: parsed.user ?? null,
      token: parsed.token ?? null,
      isAuthenticated: Boolean(parsed.token),
    }
  } catch (error) {
    console.warn('Unable to read auth state from localStorage', error)
    return { user: null, token: null, isAuthenticated: false }
  }
}

const persistAuth = (state) => {
  if (typeof window === 'undefined') return

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      user: state.user,
      token: state.token,
      isAuthenticated: state.isAuthenticated,
    }),
  )
}

const initialState = readStoredAuth()

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user = null, token = null } = action.payload ?? {}
      state.user = user
      state.token = token
      state.isAuthenticated = Boolean(token)
      persistAuth(state)
    },
    setUser: (state, action) => {
      state.user = action.payload ?? null
      persistAuth(state)
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      persistAuth(state)
    },
  },
})

export const { setCredentials, setUser, logout } = authSlice.actions
export default authSlice.reducer
