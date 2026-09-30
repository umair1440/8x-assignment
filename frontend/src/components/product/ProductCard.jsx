import { useNavigate } from 'react-router-dom'
import { Eye, Heart, ShoppingCart } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { addCartItem } from '../../features/cart/cartSlice'
import { toggleWishlistItem } from '../../features/wishlist/wishlistSlice'
import StarRating from '../ui/StarRating'
import { useProductRating } from '../../features/products/useProductRating'

function getProductSlug(name = 'product') {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
}

function getOriginalPrice(price, discount) {
  const currentPrice = Number.parseFloat(String(price).replace(/[^\d.]/g, ''))
  const discountRate = Number.parseFloat(String(discount).replace(/[^\d.]/g, '')) / 100

  if (!Number.isFinite(currentPrice) || !Number.isFinite(discountRate) || discountRate <= 0 || discountRate >= 1) {
    return undefined
  }

  const currency = String(price).match(/^[^\d]*/)?.[0] ?? ''
  return `${currency}${(currentPrice / (1 - discountRate)).toFixed(2)}`
}

export default function ProductCard({ product, onAddToCart }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const wishlistItems = useSelector((state) => state.wishlist.items)
  const {
    name = 'Product',
    category = 'Electronics',
    price = '$0.00',
    originalPrice,
    discount,
    image,
    accent = 'from-[#dfeee1] to-[#b9d9c0]',
  } = product ?? {}
  const productSlug = getProductSlug(name)
  const productId = product?.id ?? product?.slug ?? productSlug
  const isWishlisted = wishlistItems.some((item) => item.id === productId)
  const compareAtPrice = originalPrice ?? getOriginalPrice(price, discount)
  const rating = useProductRating({ ...product, name, id: productId })

  const handleWishlistToggle = () => {
    dispatch(toggleWishlistItem(product))
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
  }

  return (
    <article className="rounded-[22px] bg-[#f3f3f3] p-2.5 shadow-[0_4px_14px_rgba(20,30,24,0.06)]">
      <div className="relative aspect-[0.84] overflow-hidden rounded-[15px] bg-white">
        {image ? (
          <img src={image} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${accent}`}>
            <div className="flex h-[58%] w-[48%] items-center justify-center rounded-[28px] border border-white/50 bg-white/20 shadow-[0_18px_34px_rgba(15,23,42,0.15)] backdrop-blur-sm">
              <span className="text-4xl font-black text-white/80">{name.slice(0, 1)}</span>
            </div>
          </div>
        )}

        {discount && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-[#f04444] px-3 py-1.5 text-xs font-bold text-white">
            {discount}
          </span>
        )}

        <div className="absolute right-2.5 top-2.5 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleWishlistToggle}
            aria-label={isWishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
            aria-pressed={isWishlisted}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#ef4444] shadow-sm transition hover:scale-105"
          >
            <Heart className={`h-[18px] w-[18px] ${isWishlisted ? 'fill-current' : ''}`} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            onClick={() => navigate(`/product/${productSlug}`, { state: { product } })}
            aria-label={`View ${name}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#26332d] shadow-sm transition hover:scale-105"
          >
            <Eye className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      <div className="mt-2.5 rounded-[15px] bg-white px-3.5 pb-3.5 pt-3">
        <h3 className="line-clamp-2 min-h-10 text-[0.93rem] font-medium leading-5 text-[#171a18]">{name}</h3>
        <p className="mt-1 text-xs text-[#777]">{category}</p>
        <div className="mt-2">
          {rating.reviewCount > 0 ? <StarRating value={rating.average} reviewCount={rating.reviewCount} /> : <span className="text-xs text-[#748078]">New listing</span>}
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="whitespace-nowrap text-lg font-semibold text-[#08613d]">{price}</span>
            {compareAtPrice && <span className="whitespace-nowrap text-xs text-[#929292] line-through">{compareAtPrice}</span>}
          </div>
          <button
            type="button"
            onClick={() => {
              dispatch(addCartItem(product))
              onAddToCart?.(product)
              toast.success(`${name} added to cart`)
            }}
            aria-label={`Add ${name} to cart`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#4ed789] text-white shadow-[0_3px_9px_rgba(42,190,113,0.28)] transition hover:bg-[#32c976]"
          >
            <ShoppingCart className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
        </div>
      </div>
    </article>
  )
}
