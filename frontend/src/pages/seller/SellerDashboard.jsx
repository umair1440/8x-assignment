import { Link } from 'react-router-dom'
import { ArrowRight, Boxes, CircleDollarSign, Package, PackagePlus, Store } from 'lucide-react'
import { useSelector } from 'react-redux'
import { readSellerOrders, readSellerProducts } from '../../features/seller/sellerCatalog'

export default function SellerDashboard() {
  const seller = useSelector((state) => state.sellerAuth.seller)
  const products = readSellerProducts(seller.id)
  const orders = readSellerOrders(seller.id)
  const unitsSold = orders.flatMap((order) => order.items).reduce((count, item) => count + item.quantity, 0)
  const revenue = orders.reduce((total, order) => total + order.items.reduce((lineTotal, item) => lineTotal + item.unitPrice * item.quantity, 0), 0)
  const stats = [
    { label: 'Active products', value: products.length, icon: Package },
    { label: 'Orders', value: orders.length, icon: Boxes },
    { label: 'Units sold', value: unitsSold, icon: PackagePlus },
    { label: 'Sales', value: `$${revenue.toFixed(2)}`, icon: CircleDollarSign },
  ]

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#398456]">Seller overview</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-[#203128]">Good to see you, {seller.name}</h1><p className="mt-2 text-sm text-[#748078]">Here’s what’s happening at {seller.storeName}.</p></div><Link to="/seller/products/new" className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#176a43] px-4 text-sm font-semibold text-white hover:bg-[#105735]"><PackagePlus className="h-4 w-4" /> Add product</Link></div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{stats.map(({ label, value, icon: Icon }) => <article key={label} className="rounded-xl border border-[#e1e9e2] bg-white p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between gap-2"><p className="text-xs font-medium text-[#748078] sm:text-sm">{label}</p><Icon className="h-4 w-4 text-[#43865a]" /></div><p className="mt-3 text-2xl font-bold text-[#203128]">{value}</p></article>)}</div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(260px,0.75fr)]">
        <section className="rounded-xl border border-[#e1e9e2] bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><div><h2 className="font-bold text-[#26372c]">Recent products</h2><p className="mt-1 text-xs text-[#87938a]">Latest listings in your catalog</p></div><Link to="/seller/products" className="inline-flex items-center gap-1 text-sm font-semibold text-[#176a43]">View all <ArrowRight className="h-4 w-4" /></Link></div>{products.length === 0 ? <div className="py-10 text-center"><Package className="mx-auto h-7 w-7 text-[#699878]" /><p className="mt-3 text-sm font-semibold text-[#435147]">Your catalog is ready</p><p className="mt-1 text-xs text-[#87938a]">Add your first product to get started.</p><Link to="/seller/products/new" className="mt-4 inline-flex text-sm font-semibold text-[#176a43]">Add a product <ArrowRight className="ml-1 h-4 w-4" /></Link></div> : <div className="mt-4 divide-y divide-[#edf1ed]">{products.slice(0, 5).map((product) => <div key={product.id} className="flex items-center gap-3 py-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#edf6ef] text-sm font-bold text-[#398456]">{product.image ? <img src={product.image} alt="" className="h-full w-full object-cover" /> : product.name[0]}</div><p className="min-w-0 flex-1 truncate text-sm font-semibold text-[#334238]">{product.name}</p><span className="text-sm font-medium text-[#536058]">${product.price}</span><span className="hidden text-xs text-[#87938a] sm:inline">{product.stock} in stock</span></div>)}</div>}</section>

        <section className="rounded-xl border border-[#dce9de] bg-[#eaf4ec] p-5"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#176a43]"><Store className="h-5 w-5" /></div><h2 className="mt-4 font-bold text-[#203128]">Store profile</h2><p className="mt-2 text-sm leading-6 text-[#68766d]">Keep your public store name and seller details current.</p><Link to="/seller/store" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#176a43]">Manage store <ArrowRight className="h-4 w-4" /></Link></section>
      </div>
    </div>
  )
}