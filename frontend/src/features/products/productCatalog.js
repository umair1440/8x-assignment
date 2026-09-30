export const demoProducts = [
  { id: 'jbl-charge-5', name: 'JBL Charge 5', price: '$180.00', category: 'Audio', accent: 'from-[#0f172a] via-[#1d4ed8] to-[#38bdf8]', discount: '-20%', rating: 4.8 },
  { id: 'black-headset', name: 'Black Headset', price: '$220.00', category: 'Audio', accent: 'from-[#111827] via-[#374151] to-[#d1d5db]', discount: '-15%', rating: 4.6 },
  { id: 'gaming-speaker', name: 'Gaming Speaker', price: '$135.00', category: 'Gaming', accent: 'from-[#172554] via-[#1d4ed8] to-[#60a5fa]', discount: '-25%', rating: 4.4 },
  { id: 'retro-audio', name: 'Retro Audio', price: '$169.00', category: 'Audio', accent: 'from-[#0f766e] via-[#14b8a6] to-[#99f6e4]', discount: '-10%', rating: 4.2, inStock: false },
  { id: 'pro-watch', name: 'Pro Watch', price: '$280.00', category: 'Accessories', accent: 'from-[#111827] via-[#4b5563] to-[#d1d5db]', discount: '-20%', rating: 4.7 },
  { id: 'audio-max', name: 'Audio Max', price: '$120.00', category: 'Audio', accent: 'from-[#f6d365] to-[#fda085]', discount: '-25%', rating: 4.3 },
  { id: 'urban-watch', name: 'Urban Watch', price: '$145.00', category: 'Accessories', accent: 'from-[#84fab0] to-[#8fd3f4]', discount: '-15%', rating: 4.5 },
  { id: 'audio-pro', name: 'Audio Pro', price: '$121.00', category: 'Audio', accent: 'from-[#f093fb] to-[#f5576c]', discount: '-20%', rating: 4.1 },
  { id: 'travel-speaker', name: 'Travel Speaker', price: '$185.00', category: 'Audio', accent: 'from-[#a1c4fd] to-[#c2e9fb]', discount: '-10%', rating: 4.6 },
  { id: 'jbl-mini', name: 'JBL Mini', price: '$124.00', category: 'Audio', accent: 'from-[#1e3a8a] to-[#60a5fa]', discount: '-15%', rating: 4.5 },
  { id: 'air-buds', name: 'Air Buds', price: '$98.00', category: 'Audio', accent: 'from-[#111827] to-[#9ca3af]', discount: '-20%', rating: 4.8, inStock: false },
  { id: 'desk-lamp', name: 'Desk Lamp', price: '$60.00', category: 'Home', accent: 'from-[#f59e0b] to-[#fef3c7]', discount: '-10%', rating: 4.0 },
  { id: 'lightweight-jacket', name: 'Lightweight Jacket', price: '$24.99', category: 'Fashion', accent: 'from-[#d8d0c8] to-[#eee9e3]', discount: '-25%', rating: 4.9, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=700&q=80' },
]

export function getProductPriceValue(price) {
  return Number.parseFloat(String(price).replace(/[^\d.]/g, '')) || 0
}

export function toStorefrontProduct(product) {
  const priceValue = getProductPriceValue(product.price)
  return {
    ...product,
    price: `$${priceValue.toFixed(2)}`,
    inStock: product.inStock ?? Number(product.stock ?? 1) > 0,
    rating: Number(product.rating) || 0,
  }
}