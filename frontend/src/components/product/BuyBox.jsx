import { useState } from 'react'
import { CalendarDays, Check, Heart, Minus, PackageCheck, Plus, Ruler } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { addCartItem } from '../../features/cart/cartSlice'
import { toggleWishlistItem } from '../../features/wishlist/wishlistSlice'
import StarRating from '../ui/StarRating'

const colors = [
  { name: 'Stone', value: '#aaa197' },
  { name: 'Charcoal', value: '#303437' },
  { name: 'Ochre', value: '#d5b15a' },
  { name: 'Olive', value: '#a9b53e' },
  { name: 'Rose', value: '#df8588' },
]

const sizes = ['S', 'M', 'L', 'X']
const sizeMeasurements = [
  { size: 'S', chest: '36 in', length: '26 in' },
  { size: 'M', chest: '40 in', length: '27 in' },
  { size: 'L', chest: '44 in', length: '28 in' },
  { size: 'X', chest: '48 in', length: '29 in' },
]

function getDeliveryRange() {
  const start = new Date()
  start.setDate(start.getDate() + 4)
  const end = new Date()
  end.setDate(end.getDate() + 8)
  const format = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit' })
  const startLabel = format.format(start)
  const endLabel = format.format(end)

  return start.getMonth() === end.getMonth()
    ? `${startLabel.split(' ')[0]} ${startLabel.split(' ')[1]}-${endLabel.split(' ')[1]}`
    : `${startLabel}-${endLabel}`
}

export default function BuyBox({ product, rating, onRateProduct }) {
  const dispatch = useDispatch()
  const wishlistItems = useSelector((state) => state.wishlist.items)
  const [selectedColor, setSelectedColor] = useState(colors[0])
  const [selectedSize, setSelectedSize] = useState('M')
  const [quantity, setQuantity] = useState(1)
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)
  const deliveryRange = getDeliveryRange()
  const favoriteProduct = { ...product, image: product.images?.[0] }
  const isFavorite = wishlistItems.some((item) => item.id === product.id)

  const toggleFavorite = () => {
    dispatch(toggleWishlistItem(favoriteProduct))
    toast.success(isFavorite ? 'Removed from wishlist' : 'Added to wishlist')
  }

  const handleAddToCart = () => {
    dispatch(addCartItem({
      ...product,
      id: `${product.id}-${selectedColor.name}-${selectedSize}`,
      image: product.images[0],
      color: selectedColor.name,
      size: selectedSize,
      quantity,
    }))
    toast.success(`${product.name} added to cart`)
  }

  return (
    <section className="pt-1 text-[#171817]">
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <StarRating value={rating.average} reviewCount={rating.reviewCount} size="lg" />
          <span className="text-sm font-semibold text-[#282b29]">{rating.reviewCount ? `${rating.average.toFixed(1)}/5` : 'New product'}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2.5">
          <StarRating value={rating.average} userRating={rating.userRating} interactive onChange={onRateProduct} />
          <span className="text-xs text-[#737873]">{rating.userRating ? 'Your rating saved' : 'Rate this product'}</span>
        </div>
      </div>

      <h1 className="mt-6 font-serif text-[2.25rem] font-bold leading-tight tracking-[-0.04em] text-[#121412] sm:text-[2.65rem]">
        {product.name}
      </h1>
      <p className="mt-3 font-serif text-[1.35rem] text-[#303330]">{product.price}</p>
      <p className="mt-4 max-w-xl text-sm leading-[1.65] text-[#777c78]">{product.description}</p>
      <div className="mt-7 flex flex-wrap items-center gap-y-3 text-sm text-[#404642]">
        <button
          type="button"
          onClick={toggleFavorite}
          aria-pressed={isFavorite}
          className="inline-flex items-center gap-2 pr-5 transition hover:text-[#0b7d52]"
        >
          <Heart className={`h-5 w-5 ${isFavorite ? 'fill-[#e25858] text-[#e25858]' : ''}`} />
          {isFavorite ? 'Added to Favourite' : 'Add to Favourite'}
        </button>
        <span className="hidden h-5 border-l border-[#e2e5e3] sm:block" />
        <button
          type="button"
          onClick={() => setIsSizeGuideOpen(true)}
          className="inline-flex items-center gap-2 px-5 transition hover:text-[#0b7d52]"
        >
          <Ruler className="h-5 w-5" /> Size Guide
        </button>
        <span className="hidden h-5 border-l border-[#e2e5e3] sm:block" />
        <span className="inline-flex items-center gap-2 pl-5">
          <span className="h-3 w-3 rounded-full bg-[#19d64b] ring-2 ring-[#e4f8e9]" />
          {product.stock} In Stock
        </span>
      </div>

      <div className="mt-8 rounded-[15px] bg-[#fafafa] px-5 py-6 sm:px-8">
        <div>
          <h2 className="font-serif text-base font-bold text-[#252825]">Select Color</h2>
          <div className="mt-3 flex items-center gap-2.5">
            {colors.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => setSelectedColor(color)}
                aria-label={`Select ${color.name} color`}
                aria-pressed={selectedColor.name === color.name}
                className={`relative h-8 w-8 rounded-full border border-black/5 transition ${selectedColor.name === color.name ? 'ring-2 ring-[#8b8f8c] ring-offset-2' : 'hover:scale-105'}`}
                style={{ backgroundColor: color.value }}
              >
                {selectedColor.name === color.name && <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" />}
              </button>
            ))}
          </div>
        </div>

        <div className="my-7 border-t border-[#e5e5e5]" />

        <div>
          <h2 className="font-serif text-base font-bold text-[#252825]">Select Size</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                aria-pressed={selectedSize === size}
                className={`min-w-[58px] rounded-full border px-4 py-1.5 text-sm transition ${selectedSize === size ? 'border-[#505651] bg-white font-semibold text-[#242824] shadow-sm' : 'border-[#e0e2e0] text-[#686e69] hover:border-[#9ba29c]'}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <div className="flex h-12 items-center rounded-full border border-[#e5e7e5] bg-white px-2">
          <button
            type="button"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            aria-label="Decrease quantity"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#737a74] hover:bg-[#f4f6f4]"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-sm font-semibold">{String(quantity).padStart(2, '0')}</span>
          <button
            type="button"
            onClick={() => setQuantity((current) => Math.min(product.stock, current + 1))}
            aria-label="Increase quantity"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#303632] hover:bg-[#f4f6f4]"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          className="min-w-[168px] rounded-full bg-black px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#222]"
        >
          Add to Cart
        </button>
      </div>

      <div className="mt-8 space-y-3 text-sm text-[#565e58]">
        <p className="flex items-center gap-3">
          <PackageCheck className="h-5 w-5 text-[#414844]" />
          <span>Estimated Delivery: <strong className="font-semibold text-[#4db86f]">Within 4 Days</strong></span>
        </p>
        <p className="flex items-center gap-3">
          <CalendarDays className="h-5 w-5 text-[#414844]" />
          <span>Delivery Date: <strong className="font-semibold text-[#4db86f]">{deliveryRange}</strong></span>
        </p>
      </div>

      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setIsSizeGuideOpen(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="size-guide-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 id="size-guide-title" className="font-serif text-xl font-bold">Jacket size guide</h2>
              <button type="button" onClick={() => setIsSizeGuideOpen(false)} className="rounded-full px-3 py-1 text-sm text-[#69716b] hover:bg-[#f2f5f2]">Close</button>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 border-b border-[#e7ebe8] pb-3 text-xs font-bold uppercase tracking-wide text-[#68716a]">
              <span>Size</span><span>Chest</span><span>Length</span>
            </div>
            {sizeMeasurements.map(({ size, chest, length }) => (
              <div key={size} className="grid grid-cols-3 gap-3 border-b border-[#edf0ed] py-3 text-sm text-[#343a35]">
                <span>{size}</span><span>{chest}</span><span>{length}</span>
              </div>
            ))}
          </section>
        </div>
      )}
    </section>
  )
}
