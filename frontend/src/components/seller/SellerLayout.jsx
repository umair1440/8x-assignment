import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Boxes, LayoutDashboard, LogOut, Package, PackagePlus, Store, UserRound } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { clearSellerSession } from '../../features/seller/sellerAuthSlice'

const navigation = [
  { label: 'Dashboard', to: '/seller', icon: LayoutDashboard, end: true },
  { label: 'Products', to: '/seller/products', icon: Package },
  { label: 'Add product', to: '/seller/products/new', icon: PackagePlus },
  { label: 'Orders', to: '/seller/orders', icon: Boxes },
  { label: 'Store profile', to: '/seller/store', icon: UserRound },
]

export default function SellerLayout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const seller = useSelector((state) => state.sellerAuth.seller)

  const handleSignOut = () => {
    dispatch(clearSellerSession())
    toast.success('Seller signed out')
    navigate('/seller/login', { replace: true })
  }

  return (
    <div className="min-h-[100svh] bg-[#f4f7f4] text-[#203128]">
      <header className="border-b border-[#dfe8e1] bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/seller" className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#176a43] text-white"><Store className="h-5 w-5" /></span><span><span className="block text-sm font-bold tracking-wide">ELITE SELLER</span><span className="block text-xs text-[#768279]">Seller workspace</span></span></Link>
          <div className="flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-sm font-semibold">{seller?.storeName}</p><p className="text-xs text-[#7b877f]">{seller?.email}</p></div><button type="button" onClick={handleSignOut} className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#dfe8e1] px-3 text-sm font-medium text-[#526057] transition hover:bg-[#f4f7f4]"><LogOut className="h-4 w-4" /><span className="hidden sm:inline">Sign out</span></button></div>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8 lg:py-8">
        <aside className="h-fit rounded-xl border border-[#e1e9e2] bg-white p-3">
          <p className="px-3 pb-2 pt-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[#87938a]">Store management</p>
          <nav aria-label="Seller navigation" className="grid grid-cols-2 gap-1 lg:grid-cols-1">
            {navigation.map(({ label, to, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex h-10 items-center gap-2.5 rounded-lg px-3 text-sm font-medium transition ${isActive ? 'bg-[#edf6ef] font-semibold text-[#176a43]' : 'text-[#526057] hover:bg-[#f6f8f6]'}`}>
                <Icon className="h-4 w-4" /> {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="min-w-0"><Outlet /></main>
      </div>
    </div>
  )
}