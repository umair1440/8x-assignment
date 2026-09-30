import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, PackageCheck } from 'lucide-react'
import { useSelector } from 'react-redux'
import { readSellerOrders } from '../../features/seller/sellerCatalog'

export default function SellerOrderDetail() {
  const { id } = useParams()
  const seller = useSelector((state) => state.sellerAuth.seller)
  const order = readSellerOrders(seller.id).find((item) => item.id === id)

  if (!order) return <div className="rounded-xl border border-[#e1e9e2] bg-white p-8 text-center"><h1 className="text-xl font-bold text-[#203128]">Order not found</h1><p className="mt-2 text-sm text-[#748078]">This order has no items belonging to your store.</p><Link to="/seller/orders" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#176a43]"><ArrowLeft className="h-4 w-4" /> Back to orders</Link></div>

  const sellerTotal = order.items.reduce((total, item) => total + item.unitPrice * item.quantity, 0)

  return <div className="space-y-6"><Link to="/seller/orders" className="inline-flex items-center gap-2 text-sm font-semibold text-[#176a43]"><ArrowLeft className="h-4 w-4" /> Orders</Link><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#398456]">Order details</p><h1 className="mt-1 text-2xl font-bold text-[#203128]">{order.number}</h1><p className="mt-2 text-sm text-[#748078]">Placed {new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(order.createdAt))}</p></div><div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]"><section className="rounded-xl border border-[#e1e9e2] bg-white p-5 shadow-sm"><h2 className="font-bold text-[#29392f]">Your items in this order</h2><div className="mt-3 divide-y divide-[#edf1ed]">{order.items.map((item) => <div key={item.id} className="flex items-center gap-3 py-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#edf6ef] font-bold text-[#398456]">{item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : item.name[0]}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#29392f]">{item.name}</p><p className="mt-1 text-xs text-[#87938a]">Qty {item.quantity}{item.size ? ` · Size ${item.size}` : ''}</p></div><span className="text-sm font-semibold text-[#29392f]">${(item.unitPrice * item.quantity).toFixed(2)}</span></div>)}</div></section><aside className="h-fit rounded-xl border border-[#e1e9e2] bg-white p-5 shadow-sm"><h2 className="flex items-center gap-2 font-bold text-[#29392f]"><PackageCheck className="h-4 w-4 text-[#398456]" /> Fulfillment</h2><p className="mt-4 rounded-lg bg-[#eff6f0] px-3 py-2 text-sm font-semibold text-[#39734c]">{order.status}</p><div className="mt-4 flex justify-between border-t border-[#edf1ed] pt-4 text-sm"><span className="text-[#748078]">Your line total</span><strong className="text-[#29392f]">${sellerTotal.toFixed(2)}</strong></div></aside></div></div>
}