import { Star } from 'lucide-react'
import { formatReviewCount } from '../../features/products/useProductRating'

export default function StarRating({ value = 0, max = 5, reviewCount, interactive = false, userRating = 0, onChange, size = 'sm' }) {
  const iconSize = size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5" role={interactive ? 'group' : undefined} aria-label={interactive ? 'Rate this product' : `${Number(value).toFixed(1)} out of ${max} stars`}>
        {Array.from({ length: max }, (_, index) => {
          const className = `${iconSize} ${index < Math.round(value) ? 'fill-[#f27a18] text-[#f27a18]' : 'text-[#d6ddd7]'}`
          return interactive ? (
            <button key={index} type="button" onClick={() => onChange?.(index + 1)} aria-label={`Rate ${index + 1} out of ${max} stars`} aria-pressed={userRating === index + 1} className="rounded-sm transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a7f52]">
              <Star className={className} strokeWidth={1.7} />
            </button>
          ) : <Star key={index} className={className} strokeWidth={1.7} />
        })}
      </div>
      {reviewCount !== undefined && <span className="text-xs text-[#748078]">{reviewCount > 0 ? `(${formatReviewCount(reviewCount)})` : '(No reviews)'}</span>}
    </div>
  )
}
