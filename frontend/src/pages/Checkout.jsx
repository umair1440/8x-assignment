import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, CreditCard, MapPin, PackageCheck } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { clearCart } from '../features/cart/cartSlice'
import { createLocalId, readAccountCollection, writeAccountCollection } from '../features/account/localAccountData'
import { mergeLocalOrder } from '../features/admin/adminDataSlice'

export default function Checkout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)
  const items = useSelector((state) => state.cart.items)
  const addresses = readAccountCollection('addresses', user.id)
  const paymentMethods = readAccountCollection('payment_methods', user.id)
  const [selectedAddressId, setSelectedAddressId] = useState(() => addresses.find((address) => address.isDefault)?.id ?? addresses[0]?.id ?? '')
  const [selectedPaymentId, setSelectedPaymentId] = useState(() => paymentMethods.find((method) => method.isDefault)?.id ?? paymentMethods[0]?.id ?? '')
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const subtotal = items.reduce((total, item) => total + item.unitPrice * item.quantity, 0)
  const shipping = subtotal === 0 || subtotal >= 75 ? 0 : 6.99

  if (items.length === 0) return <Navigate to="/cart" replace />

  const handlePlaceOrder = () => {
    const address = addresses.find((item) => item.id === selectedAddressId)
    const paymentMethod = paymentMethods.find((item) => item.id === selectedPaymentId)
    if (!address || !paymentMethod) return

    setIsPlacingOrder(true)
    const order = {
      id: createLocalId(),
      number: `EC-${Date.now().toString().slice(-8)}`,
      createdAt: new Date().toISOString(),
      status: 'Processing',
      items: items.map(({ id, name, image, category, color, size, unitPrice, quantity, sellerId, sellerName }) => ({ id, name, image, category, color, size, unitPrice, quantity, sellerId, sellerName })),
      address: { ...address },
      paymentMethod: { brand: paymentMethod.brand, last4: paymentMethod.last4 },
      subtotal,
      shipping,
      total: subtotal + shipping,
    }
    const previousOrders = readAccountCollection('orders', user.id)
    writeAccountCollection('orders', user.id, [order, ...previousOrders])
    dispatch(mergeLocalOrder({ ...order, userId: user.id, customerName: user.name, customerEmail: user.email }))
    dispatch(clearCart())
    toast.success('Your order has been placed')
    navigate(`/orders/${order.id}/confirmation`, { replace: true })
  }

  return (
    <section className="mx-auto max-w-280 py-3 sm:py-8">
      <Link to="/cart" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1a7f52]"><ArrowLeft className="h-4 w-4" /> Back to cart</Link>
      <div className="mb-7 mt-5"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1a7f52]">Secure checkout demo</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1d2f2a]">Review your order</h1></div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-[#dfeee1] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 font-bold text-[#1d2f2a]"><MapPin className="h-5 w-5 text-[#1a7f52]" /> Delivery address</h2><Link to="/account/addresses" className="text-sm font-semibold text-[#1a7f52]">Manage</Link></div>
            {addresses.length === 0 ? <p className="mt-4 text-sm text-[#748078]">Add a delivery address in <Link to="/account/addresses" className="font-semibold text-[#1a7f52]">your addresses</Link> to continue.</p> : <div className="mt-4 space-y-3">{addresses.map((address) => <label key={address.id} className="flex cursor-pointer gap-3 rounded-xl border border-[#e2e9e3] p-4 has-checked:border-[#1a7f52] has-checked:bg-[#f5faf6]"><input type="radio" name="checkout-address" checked={selectedAddressId === address.id} onChange={() => setSelectedAddressId(address.id)} className="mt-1 accent-[#1a7f52]" /><span className="text-sm leading-6 text-[#59645d]"><strong className="text-[#1d2f2a]">{address.label} · {address.recipient}</strong><br />{address.line1}{address.line2 && `, ${address.line2}`}<br />{address.city}, {address.region} {address.postalCode}, {address.country}<br />{address.phone}</span></label>)}</div>}
          </section>

          <section className="rounded-2xl border border-[#dfeee1] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 font-bold text-[#1d2f2a]"><CreditCard className="h-5 w-5 text-[#1a7f52]" /> Payment method</h2><Link to="/account/payments" className="text-sm font-semibold text-[#1a7f52]">Manage</Link></div>
            {paymentMethods.length === 0 ? <p className="mt-4 text-sm text-[#748078]">Add a demo payment method in <Link to="/account/payments" className="font-semibold text-[#1a7f52]">your payments</Link> to continue.</p> : <div className="mt-4 space-y-3">{paymentMethods.map((method) => <label key={method.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#e2e9e3] p-4 has-checked:border-[#1a7f52] has-checked:bg-[#f5faf6]"><input type="radio" name="checkout-payment" checked={selectedPaymentId === method.id} onChange={() => setSelectedPaymentId(method.id)} className="accent-[#1a7f52]" /><span className="text-sm text-[#59645d]"><strong className="text-[#1d2f2a]">{method.brand} ending in {method.last4}</strong><br />Expires {method.expiry}</span></label>)}</div>}
            <p className="mt-4 text-xs text-[#87918a]">This is a local demo checkout. No payment is processed.</p>
          </section>

          <section className="rounded-2xl border border-[#dfeee1] bg-white p-5 shadow-sm sm:p-6">
            <h2 className="flex items-center gap-2 font-bold text-[#1d2f2a]"><PackageCheck className="h-5 w-5 text-[#1a7f52]" /> Items ({items.reduce((count, item) => count + item.quantity, 0)})</h2>
            <div className="mt-4 divide-y divide-[#edf0ed]">{items.map((item) => <div key={item.id} className="flex items-center gap-4 py-3"><div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#eef5ef]">{item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : <div className={`flex h-full items-center justify-center bg-linear-to-br ${item.accent ?? item.tint ?? 'from-[#dfeee1] to-[#b9d9c0]'} font-bold text-white`}>{item.name[0]}</div>}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#1d2f2a]">{item.name}</p><p className="text-xs text-[#748078]">Qty {item.quantity}{item.color ? ` · ${item.color}` : ''}{item.size ? ` · Size ${item.size}` : ''}</p></div><span className="text-sm font-semibold text-[#1d2f2a]">${(item.unitPrice * item.quantity).toFixed(2)}</span></div>)}</div>
          </section>
        </div>

        <aside className="rounded-2xl border border-[#dfeee1] bg-white p-5 shadow-sm sm:p-6"><h2 className="font-bold text-[#1d2f2a]">Order summary</h2><div className="mt-5 space-y-3 text-sm text-[#68736c]"><div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div><div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div><div className="flex justify-between border-t border-[#e8ede9] pt-3 text-base font-bold text-[#1d2f2a]"><span>Total</span><span>${(subtotal + shipping).toFixed(2)}</span></div></div><button type="button" disabled={!addresses.length || !paymentMethods.length || isPlacingOrder} onClick={handlePlaceOrder} className="mt-6 w-full rounded-full bg-[#1a7f52] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#126b44] disabled:cursor-not-allowed disabled:bg-[#a8c4b0]">{isPlacingOrder ? 'Placing order…' : 'Place demo order'}</button><p className="mt-3 text-center text-xs text-[#87918a]">No real charge will be made.</p></aside>
      </div>
    </section>
  )
}
