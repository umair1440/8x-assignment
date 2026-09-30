import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    isMobileMenuOpen: false,
  },
  reducers: {
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen
    },
    openMobileMenu: (state) => {
      state.isMobileMenuOpen = true
    },
    closeMobileMenu: (state) => {
      state.isMobileMenuOpen = false
    },
  },
})

export const { toggleMobileMenu, openMobileMenu, closeMobileMenu } = uiSlice.actions
export default uiSlice.reducer
