import { useState } from 'react'

export default function ProductGallery({ images = [], productName = 'Product' }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const activeImage = images[activeImageIndex]

  return (
    <div className="space-y-4">
      <div className="aspect-[0.99] overflow-hidden rounded-[18px] bg-[#e1d9d2]">
        {activeImage && <img src={activeImage} alt={productName} className="h-full w-full object-cover object-center" />}
      </div>
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setActiveImageIndex(index)}
            aria-label={`Show ${productName} image ${index + 1}`}
            aria-pressed={activeImageIndex === index}
            className={`aspect-[1.12] overflow-hidden rounded-lg border-2 bg-white transition ${activeImageIndex === index ? 'border-[#aeb7b0]' : 'border-[#e6e7e6] hover:border-[#aeb7b0]'}`}
          >
            <img src={image} alt="" className={`h-full w-full object-cover ${index === 4 ? 'scale-110 grayscale' : ''}`} />
          </button>
        ))}
      </div>
    </div>
  )
}
