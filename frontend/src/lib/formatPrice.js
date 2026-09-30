export const formatPrice = (amount, currency = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(Number(amount ?? 0))

export default formatPrice
