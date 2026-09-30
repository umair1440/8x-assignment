import { Link } from 'react-router-dom'
import { Boxes, ChevronRight } from 'lucide-react'
import { useSelector } from 'react-redux'
import { readSellerOrders } from '../../features/seller/sellerCatalog'

export default function SellerOrders() {
  const seller = useSelector((state) => state.sellerAuth.seller)
  const orders = readSellerOrders(seller.id).sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))

  return (
    <div className="space-y-6"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#398456]">Fulfillment</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-[#203128]">Orders</h1><p className="mt-2 text-sm text-[#748078]">Orders containing products from {seller.storeName}.</p></div>{orders.length === 0 ? <div className="rounded-xl border border-dashed border-[#cddbd0] bg-white px-5 py-12 text-center"><Boxes className="mx-auto h-7 w-7 text-[#699878]" /><p className="mt-3 text-sm font-semibold text-[#435147]">No seller orders yet</p><p className="mt-1 text-xs text-[#87938a]">Orders for your products will appear here.</p></div> : <div className="space-y-3">{orders.map((order) => <Link key={order.id} to={`/seller/orders/${order.id}`} className="block rounded-xl border border-[#e1e9e2] bg-white p-4 shadow-sm transition hover:border-[#b7d2bc] sm:p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-bold text-[#29392f]">Order {order.number}</p><p className="mt-1 text-xs text-[#87938a]">{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(order.createdAt))} · {order.items.reduce((count, item) => count + item.quantity, 0)} items</p></div><div className="flex items-center gap-3"><span className="rounded-full bg-[#eff6f0] px-3 py-1 text-xs font-semibold text-[#39734c]">{order.status}</span><span className="text-sm font-bold text-[#29392f]">${order.items.reduce((total, item) => total + item.unitPrice * item.quantity, 0).toFixed(2)}</span><ChevronRight className="h-4 w-4 text-[#87938a]" /></div></div></Link>)}</div>}</div>
  )
}