import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function SellerRoute() {
  const isAuthenticated = useSelector((state) => state.sellerAuth.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/seller/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}