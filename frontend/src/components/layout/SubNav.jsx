import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AudioLines,
  BookOpen,
  Camera,
  ChevronDown,
  ChevronRight,
  Gamepad2,
  HeartPulse,
  House,
  Plug,
  Shirt,
  Smartphone,
  X,
} from 'lucide-react'

const links = [
  { label: 'New arrivals', to: '/search' },
  { label: 'Best sellers', to: '/search' },
  { label: 'Trending', to: '/search' },
  { label: 'Audio', to: '/search' },
  { label: 'Phones', to: '/search' },
  { label: 'Accessories', to: '/search' },
]

const categories = [
  { label: 'Electronics', icon: Plug },
  { label: 'Audio & Video', icon: AudioLines },
  { label: 'Smartphones', icon: Smartphone },
  { label: 'Home Appliances', icon: House },
  { label: 'Accessories', icon: Camera },
  { label: 'Gaming', icon: Gamepad2 },
  { label: 'Fashion', icon: Shirt },
  { label: 'Health & Beauty', icon: HeartPulse },
  { label: 'Books', icon: BookOpen },
]

export default function SubNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-[#dfeee1] bg-[#f3f7f4]">
      <nav aria-label="Store navigation" className="mx-auto flex h-[54px] max-w-[1280px] items-center gap-6 overflow-x-auto px-4 text-sm font-medium text-[#314239] sm:px-6 lg:gap-8 lg:px-8">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls="category-drawer"
          className="flex h-9 shrink-0 items-center gap-2 rounded-full bg-[#e3f1e6] px-3.5 font-semibold text-[#165c3c] transition hover:bg-[#d8ebdc]"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/80"><Plug className="h-3 w-3" /></span>
          <span>Categories</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {links.map((link) => (
          <Link
            key={link.label}
            to={link.to}
            className="whitespace-nowrap py-2 text-[#48574e] transition hover:text-[#0f7a4a]"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Close category panel"
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-[#14271e]/35 backdrop-blur-[1px]"
          />

          <aside id="category-drawer" aria-label="Product categories" className="fixed inset-y-0 left-0 z-50 w-[min(360px,88vw)] overflow-y-auto bg-[#fbfdfb] shadow-[20px_0_50px_rgba(12,42,27,0.18)]">
            <div className="flex items-center justify-between border-b border-[#e5ece6] px-5 py-4 sm:px-6">
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[#4a9162]">Explore the store</p>
                <h3 className="mt-1 text-lg font-bold text-[#1d2c24]">Shop by category</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close categories"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#69766d] transition hover:bg-[#edf4ee]"
              >
                <X className="h-[18px] w-[18px]" />
              </button>
            </div>

            <div className="space-y-1 p-3 sm:p-4">
              {categories.map(({ label, icon: Icon }) => (
                <Link
                  key={label}
                  to={`/search?category=${encodeURIComponent(label)}`}
                  onClick={() => setIsOpen(false)}
                  className="group flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium text-[#46554b] transition hover:bg-[#edf6ef] hover:text-[#0f7a4a]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef6f0] text-[#397b50] transition group-hover:bg-white"><Icon className="h-[17px] w-[17px]" strokeWidth={1.8} /></span>
                  <span className="flex-1">{label}</span>
                  <ChevronRight className="h-4 w-4 text-[#9da9a0] transition group-hover:translate-x-0.5 group-hover:text-[#397b50]" />
                </Link>
              ))}
            </div>
          </aside>
        </>
      )}
    </div>
  )
}
