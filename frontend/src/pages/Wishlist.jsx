import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import ProductCard from '../components/product/ProductCard'
import { clearWishlist } from '../features/wishlist/wishlistSlice'

export default function Wishlist() {
  const dispatch = useDispatch()
  const items = useSelector((state) => state.wishlist.items)

  return (
    <section className="mx-auto max-w-[1280px] py-3 sm:py-8">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1a7f52]">Saved for later</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1d2f2a]">My wishlist <span className="text-lg font-medium text-[#7b8780]">({items.length})</span></h1>
        </div>
        {items.length > 0 && (
          <button type="button" onClick={() => dispatch(clearWishlist())} className="text-sm font-semibold text-[#7b8780] transition hover:text-red-600">
            Clear wishlist
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-[#dfeee1] bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eff8f1] text-[#1a7f52]">
            <Heart className="h-8 w-8" strokeWidth={1.6} />
          </div>
          <h2 className="mt-5 text-xl font-bold text-[#1d2f2a]">Your wishlist is empty</h2>
          <p className="mt-2 text-sm text-[#748078]">Save products you like and find them here later.</p>
          <Link to="/" className="mt-6 inline-flex rounded-full bg-[#1a7f52] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#126b44]">
            Explore products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-5">
          {items.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </section>
  )
}
