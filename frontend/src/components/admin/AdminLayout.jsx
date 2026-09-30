import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ArrowLeft, LayoutDashboard, LogOut, Package, ShoppingBag, Users } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { logout } from '../../features/auth/authSlice'

const navigation = [
  { label: 'Overview', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingBag },
  { label: 'Products', to: '/admin/products', icon: Package },
  { label: 'Users', to: '/admin/users', icon: Users },
]

export default function AdminLayout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)

  const handleSignOut = () => {
    dispatch(logout())
    toast.success('Admin signed out')
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#f3f8f3] text-[#21362a]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="flex w-full shrink-0 flex-col border-b border-[#dce9de] bg-white lg:sticky lg:top-0 lg:h-screen lg:w-62.5 lg:border-b-0 lg:border-r">
          <Link to="/admin" className="flex items-center gap-3 border-b border-[#edf2ed] px-5 py-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#176a43] text-sm font-black text-white">E</span>
            <span><span className="block text-sm font-bold tracking-wide">ELITE ADMIN</span><span className="mt-0.5 block text-xs text-[#829087]">Store operations</span></span>
          </Link>
          <nav aria-label="Admin navigation" className="flex gap-1 overflow-x-auto p-3 lg:flex-col">
            {navigation.map(({ label, to, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex h-10 shrink-0 items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${isActive ? 'bg-[#eaf5ec] font-semibold text-[#176a43]' : 'text-[#58675d] hover:bg-[#f5f8f5]'}`}>
                <Icon className="h-4 w-4" strokeWidth={1.8} /> {label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto hidden border-t border-[#edf2ed] p-3 lg:block">
            <Link to="/" className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-[#58675d] transition hover:bg-[#f5f8f5]"><ArrowLeft className="h-4 w-4" /> Back to store</Link>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#dfe9e0] bg-white px-4 sm:px-6 lg:px-8">
            <span className="text-sm font-semibold text-[#445349]">Administration</span>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-[#68766d] sm:inline">{user?.name ?? user?.email}</span>
              <button type="button" onClick={handleSignOut} className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#dfe8e1] px-3 text-sm font-medium text-[#526057] transition hover:bg-[#f4f7f4]"><LogOut className="h-4 w-4" /><span className="hidden sm:inline">Sign out</span></button>
              <Link to="/" aria-label="Back to store" className="flex h-9 w-9 items-center justify-center rounded-lg text-[#176a43] hover:bg-[#edf6ef] lg:hidden"><ArrowLeft className="h-4 w-4" /></Link>
            </div>
          </header>
          <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8"><Outlet /></main>
        </div>
      </div>
    </div>
  )
}