import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, CreditCard, Heart, LogOut, MapPin, Package, ShieldCheck, UserRound } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { logout } from '../../features/auth/authSlice'

const accountOptions = [
  { title: 'Login & security', description: 'Update your name, mobile number, or password.', to: '/account/security', icon: ShieldCheck },
  { title: 'Your addresses', description: 'Manage home, work, and other delivery addresses.', to: '/account/addresses', icon: MapPin },
  { title: 'Your payments', description: 'Add and manage your saved payment methods.', to: '/account/payments', icon: CreditCard },
  { title: 'Your orders', description: 'Review your previous orders and their details.', to: '/orders', icon: Package },
  { title: 'Your wishlist', description: 'Return to the products you saved for later.', to: '/wishlist', icon: Heart },
]

export default function Profile() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)

  const handleLogout = () => {
    dispatch(logout())
    toast.success('You have signed out')
    navigate('/login', { replace: true })
  }

  return (
    <section className="mx-auto max-w-280 py-3 sm:py-8">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1a7f52]">Your account</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1d2f2a]">Account overview</h1>
          <p className="mt-2 text-sm text-[#748078]">Manage your account, purchases, and saved details.</p>
        </div>
        <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-full border border-[#e5dada] px-4 py-2.5 text-sm font-semibold text-[#965151] transition hover:bg-[#fff6f6]">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      <div className="mb-7 flex items-center gap-4 rounded-2xl border border-[#dfeee1] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#e8f5eb] text-[#1a7f52]">
          <span className="text-xl font-bold">{user?.name?.trim()?.[0]?.toUpperCase() ?? <UserRound className="h-6 w-6" />}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-bold text-[#1d2f2a]">{user?.name || 'Your profile'}</h2>
          <p className="mt-1 truncate text-sm text-[#748078]">{user?.email}</p>
        </div>
        <span className="hidden items-center gap-2 rounded-full bg-[#f2f8f3] px-3 py-2 text-xs font-medium text-[#477254] sm:inline-flex">
          <ShieldCheck className="h-4 w-4" /> Demo account
        </span>
      </div>

      <nav aria-label="Account options" className="grid gap-4 sm:grid-cols-2">
        {accountOptions.map(({ title, description, to, icon: Icon }) => (
          <Link key={to} to={to} className="group flex min-h-32 items-center gap-4 rounded-2xl border border-[#dfeee1] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#acd7b7] hover:shadow-md sm:p-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#eff8f1] text-[#1a7f52] transition group-hover:bg-[#e2f3e6]">
              <Icon className="h-6 w-6" strokeWidth={1.8} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold text-[#1d2f2a]">{title}</span>
              <span className="mt-1 block text-sm leading-5 text-[#748078]">{description}</span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0 text-[#9aa59d] transition group-hover:translate-x-1 group-hover:text-[#1a7f52]" />
          </Link>
        ))}
      </nav>
    </section>
  )
}
