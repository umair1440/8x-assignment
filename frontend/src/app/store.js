import { configureStore } from '@reduxjs/toolkit'
import { baseApi } from '../services/baseApi'
import authReducer from '../features/auth/authSlice'
import cartReducer from '../features/cart/cartSlice'
import wishlistReducer from '../features/wishlist/wishlistSlice'
import sellerAuthReducer from '../features/seller/sellerAuthSlice'
import adminDataReducer from '../features/admin/adminDataSlice'
import uiReducer from '../features/ui/uiSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    sellerAuth: sellerAuthReducer,
    adminData: adminDataReducer,
    ui: uiReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
})

export default store
