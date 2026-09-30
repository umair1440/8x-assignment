import { Link } from 'react-router-dom'
import { ArrowLeft, Package } from 'lucide-react'
import { useSelector } from 'react-redux'
import { readAccountCollection } from '../features/account/localAccountData'

export default function Orders() {
  const userId = useSelector((state) => state.auth.user?.id)
  const orders = readAccountCollection('orders', userId)

  return (
    <section className="mx-auto max-w-[1040px] py-3 sm:py-8">
      <Link to="/account" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1a7f52]"><ArrowLeft className="h-4 w-4" /> Account overview</Link>
      <div className="mb-7 mt-5"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1a7f52]">Purchase history</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1d2f2a]">Your orders</h1></div>
      {orders.length === 0 ? <div className="rounded-2xl border border-[#dfeee1] bg-white px-6 py-14 text-center shadow-sm"><Package className="mx-auto h-8 w-8 text-[#1a7f52]" /><h2 className="mt-4 font-bold text-[#1d2f2a]">No orders yet</h2><p className="mt-2 text-sm text-[#748078]">Once you place a demo order, it will appear here.</p><Link to="/" className="mt-6 inline-flex rounded-full bg-[#1a7f52] px-5 py-3 text-sm font-semibold text-white">Explore products</Link></div> : (
        <div className="space-y-4">{orders.map((order) => <article key={order.id} className="overflow-hidden rounded-2xl border border-[#dfeee1] bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0ed] bg-[#f8faf8] px-5 py-4"><div className="flex flex-wrap gap-x-8 gap-y-2 text-xs text-[#748078]"><span>ORDER PLACED<strong className="mt-1 block text-sm font-semibold normal-case text-[#344039]">{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(order.createdAt))}</strong></span><span>ORDER NUMBER<strong className="mt-1 block text-sm font-semibold normal-case text-[#344039]">{order.number}</strong></span><span>TOTAL<strong className="mt-1 block text-sm font-semibold normal-case text-[#344039]">${order.total.toFixed(2)}</strong></span></div><Link to={`/orders/${order.id}`} className="text-sm font-semibold text-[#1a7f52] hover:underline">View order</Link></div><div className="divide-y divide-[#edf0ed] px-5">{order.items.slice(0, 2).map((item) => <div key={item.id} className="flex items-center gap-4 py-4"><div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#eef5ef]">{item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center bg-[#d9eadc] font-bold text-[#33704c]">{item.name[0]}</div>}</div><div><p className="font-semibold text-[#26342b]">{item.name}</p><p className="mt-1 text-xs text-[#748078]">Quantity: {item.quantity}{item.size ? ` · Size ${item.size}` : ''}</p></div></div>)}</div></article>)}</div>
      )}
    </section>
  )
}
