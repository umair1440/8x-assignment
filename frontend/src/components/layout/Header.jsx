import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Heart, Search, ShoppingCart, UserRound } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../features/auth/authSlice'
import Button from '../ui/Button'

function SearchForm({ className = '' }) {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const activeQuery = searchParams.get('q') ?? ''
    const [query, setQuery] = useState('')

    useEffect(() => setQuery(activeQuery), [activeQuery])

    const handleSubmit = (event) => {
        event.preventDefault()
        const trimmedQuery = query.trim()
        navigate(trimmedQuery ? `/search?q=${encodeURIComponent(trimmedQuery)}` : '/search')
    }

    return (
        <form
            onSubmit={handleSubmit}
            role="search"
            className={`flex h-10 w-full items-center gap-3 rounded-full border border-[#dce6de] bg-[#f0f3f0] px-3 transition focus-within:border-[#8cbea0] focus-within:bg-white sm:h-11 sm:max-w-[700px] sm:px-4 ${className}`}
        >
            <Search className="h-[18px] w-[18px] shrink-0 text-[#1d7d4d]" strokeWidth={2} />
            <input
                type="search"
                aria-label="Search products"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products"
                className="w-full min-w-0 border-0 bg-transparent text-sm text-slate-700 placeholder:text-[#78847b] focus:outline-none"
            />
            <button type="submit" aria-label="Search" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#9ce1b8] text-[#1d7d4d] transition hover:bg-[#8bd7aa]">
                <Search className="h-4 w-4" strokeWidth={2.3} />
            </button>
        </form>
    )
}

export default function Header() {
    const dispatch = useDispatch()
    const { isAuthenticated, user } = useSelector((state) => state.auth)
    const cartCount = useSelector((state) => state.cart.items.reduce((count, item) => count + item.quantity, 0))
    const wishlistCount = useSelector((state) => state.wishlist.items.length)

    return (
        <header className="border-b border-[#dfeee1] bg-[#f8faf8]">
            <div className="mx-auto grid max-w-[1280px] grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 px-4 py-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-x-4 sm:px-6 lg:px-8">
                    <Link to="/" className="col-start-1 row-start-1 flex shrink-0 items-center gap-2.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border-[2px] border-[#1d7d4d] bg-[#f3faf4] text-lg font-black text-[#1d7d4d]">
                            E
                        </div>
                        <div className="leading-none">
                            <div className="text-[1.7rem] font-black tracking-[-0.07em] text-[#1d7d4d]">ELITE</div>
                            <div className="mt-1 text-[0.52rem] font-semibold tracking-[0.48em] text-[#1d7d4d]/80">COMMERCE</div>
                        </div>
                    </Link>

                <SearchForm className="col-span-2 row-start-2 sm:col-span-1 sm:col-start-2 sm:row-start-1" />

                <div className="col-start-2 row-start-1 flex shrink-0 items-center justify-self-end gap-1 sm:col-start-3 sm:gap-2">
                    <Link to="/wishlist" aria-label={`Wishlist, ${wishlistCount} saved items`} className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#1d7d4d] transition hover:bg-[#ebf5ed]">
                        <Heart className="h-[21px] w-[21px]" strokeWidth={1.9} />
                        {wishlistCount > 0 && <span className="absolute right-0 top-0 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#0b7d52] px-1 text-[0.6rem] font-bold text-white">{wishlistCount}</span>}
                    </Link>

                    <Link to="/cart" aria-label={`Shopping cart, ${cartCount} items`} className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#1d7d4d] transition hover:bg-[#ebf5ed]">
                        <ShoppingCart className="h-[21px] w-[21px]" strokeWidth={1.9} />
                        {cartCount > 0 && <span className="absolute right-0 top-0 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#0b7d52] px-1 text-[0.6rem] font-bold text-white">{cartCount}</span>}
                    </Link>

                    {isAuthenticated ? (
                        <div className="flex items-center gap-1.5">
                            <Link to="/account" aria-label={`Account for ${user?.name || 'user'}`} className="flex h-10 items-center gap-2 rounded-full px-2.5 text-sm font-semibold text-[#1d7d4d] transition hover:bg-[#ebf5ed]">
                                <UserRound className="h-[18px] w-[18px]" />
                                <span className="hidden max-w-28 truncate md:inline">{user?.name || 'Account'}</span>
                            </Link>
                            <Button variant="secondary" size="sm" onClick={() => dispatch(logout())}>Logout</Button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="inline-flex h-10 items-center justify-center rounded-full border border-[#1d7d4d] px-4 text-sm font-semibold text-[#1d7d4d] transition hover:bg-[#ebf5ed] sm:px-5"
                        >
                            Sign in
                        </Link>
                    )}
                </div>
            </div>
        </header>
    )
}
