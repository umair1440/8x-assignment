import { ArrowUpRight, CreditCard, Heart, MapPin, Package, ShieldCheck, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'

const storeLinks = [
  { label: 'Home', to: '/' },
  { label: 'Explore products', to: '/search' },
  { label: 'Shopping cart', to: '/cart' },
]

const accountLinks = [
  { label: 'Account overview', to: '/account', icon: ShieldCheck },
  { label: 'Your orders', to: '/orders', icon: Package },
  { label: 'Your addresses', to: '/account/addresses', icon: MapPin },
  { label: 'Your payments', to: '/account/payments', icon: CreditCard },
  { label: 'Wishlist', to: '/wishlist', icon: Heart },
]

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#103d2e] text-white">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#95d9aa] via-[#d4edcf] to-[#64bc87]" />
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 pb-10 pt-12 sm:px-8 md:grid-cols-[1.25fr_0.75fr_1fr_1fr] lg:gap-14 lg:pt-16">
        <div>
          <Link to="/" className="inline-flex items-center gap-3" aria-label="Elite Commerce home">
            <span className="flex h-11 w-11 items-center justify-center rounded-[13px] border border-white/25 bg-white/10 text-xl font-black">E</span>
            <span>
              <span className="block text-[1.65rem] font-black leading-none tracking-[-0.06em]">ELITE</span>
              <span className="mt-1 block text-[0.55rem] font-semibold tracking-[0.42em] text-[#c8e7d0]">COMMERCE</span>
            </span>
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-6 text-white/70">
            Thoughtful finds for everyday living, all in one place.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-2 text-xs font-medium text-[#c8e7d0]">
            <ShoppingBag className="h-4 w-4" /> Browser-local demo store
          </div>
        </div>

        <nav aria-label="Store links">
          <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-white">Explore</h2>
          <ul className="mt-5 space-y-3">
            {storeLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-sm text-white/70 transition hover:text-white">{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Account links">
          <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-white">Your account</h2>
          <ul className="mt-5 space-y-3">
            {accountLinks.map(({ label, to, icon: Icon }) => (
              <li key={to}>
                <Link to={to} className="group inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white">
                  <Icon className="h-4 w-4 text-[#a8d6b4] transition group-hover:text-white" strokeWidth={1.8} />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-white">Your data</h2>
          <p className="mt-5 max-w-xs text-sm leading-6 text-white/70">
            Demo profile details, saved addresses, payment display details, and orders stay in this browser.
          </p>
          <Link to="/account/security" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#bce5c6] transition hover:text-white">
            Login & security <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-5 py-5 text-xs text-white/55 sm:px-8 md:flex-row md:items-center md:justify-between">
          <span>© 2026 Elite Commerce</span>
          <span>Demo experience · No real payments are processed</span>
        </div>
      </div>
    </footer>
  )
}
