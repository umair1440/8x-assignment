import { useLocation, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import ProductGallery from '../components/product/ProductGallery'
import BuyBox from '../components/product/BuyBox'
import { useProductRating } from '../features/products/useProductRating'

const jacketImages = [
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80&sat=-30',
]

const product = {
  id: 'lightweight-jacket',
  name: 'Lightweight Jacket',
  category: 'Men / Outerwear',
  price: '$24.99',
  rating: '4.9',
  reviewCount: '2.5k',
  description: 'A versatile lightweight jacket designed for everyday comfort. Features a clean silhouette, premium construction, and easy layering for any season.',
  stock: 32,
  images: jacketImages,
}

export default function Product() {
  const { slug } = useParams()
  const location = useLocation()
  const navigatedProduct = location.state?.product
  const selectedProduct = navigatedProduct ? {
    ...navigatedProduct,
    id: navigatedProduct.id ?? slug,
    images: navigatedProduct.images ?? (navigatedProduct.image ? [navigatedProduct.image] : []),
    description: navigatedProduct.description ?? 'A carefully selected product for everyday use.',
    stock: navigatedProduct.stock ?? 12,
  } : product
  const rating = useProductRating(selectedProduct)

  const handleRateProduct = (value) => {
    rating.rateProduct(value)
    toast.success('Your rating has been saved')
  }

  return (
    <section className="mx-auto max-w-[1320px] py-2 lg:py-6">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12">
        <ProductGallery images={selectedProduct.images} productName={selectedProduct.name} />
        <BuyBox product={selectedProduct} rating={rating} onRateProduct={handleRateProduct} />
      </div>
    </section>
  )
}
