import formatPrice from '../../lib/formatPrice'

export default function PriceTag({ amount, currency = 'USD', className = '' }) {
  return <span className={className}>{formatPrice(amount, currency)}</span>
}
