import { Link, useParams } from 'react-router-dom'
import { Check, Package } from 'lucide-react'
import { useSelector } from 'react-redux'
import { readAccountCollection } from '../features/account/localAccountData'

export default function OrderConfirmation() {
  const { id } = useParams()
  const userId = useSelector((state) => state.auth.user?.id)
  const order = readAccountCollection('orders', userId).find((item) => item.id === id)

  return (
    <section className="mx-auto max-w-[760px] py-8 sm:py-14"><div className="rounded-2xl border border-[#dfeee1] bg-white px-6 py-12 text-center shadow-sm"><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e9f7ec] text-[#16834e]"><Check className="h-8 w-8" /></span><p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#1a7f52]">Order confirmed</p><h1 className="mt-2 text-3xl font-bold text-[#1d2f2a]">Thanks for your order</h1><p className="mt-3 text-sm text-[#748078]">{order ? `Your order ${order.number} is being prepared.` : 'Your demo order has been placed.'}</p>{order && <div className="mx-auto mt-7 max-w-sm rounded-xl bg-[#f6f9f6] p-4 text-sm text-[#59645d]"><div className="flex justify-between"><span>Items</span><span>{order.items.reduce((count, item) => count + item.quantity, 0)}</span></div><div className="mt-2 flex justify-between font-bold text-[#1d2f2a]"><span>Total</span><span>${order.total.toFixed(2)}</span></div></div>}<div className="mt-7 flex flex-wrap justify-center gap-3"><Link to="/orders" className="inline-flex items-center gap-2 rounded-full bg-[#1a7f52] px-5 py-3 text-sm font-semibold text-white"><Package className="h-4 w-4" /> View your orders</Link><Link to="/" className="rounded-full border border-[#dce2dd] px-5 py-3 text-sm font-semibold text-[#46534a]">Continue shopping</Link></div></div></section>
  )
}
