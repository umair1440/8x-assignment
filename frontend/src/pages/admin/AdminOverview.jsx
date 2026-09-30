import { Link } from 'react-router-dom'
import { ArrowRight, CircleDollarSign, Package, ShoppingBag, Users } from 'lucide-react'
import { useSelector } from 'react-redux'

function getLastSevenDays(orders) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - (6 - index))
    const revenue = orders.filter((order) => {
      const orderDate = new Date(order.createdAt)
      return orderDate.toDateString() === date.toDateString() && order.status !== 'Cancelled'
    }).reduce((total, order) => total + (Number(order.total) || 0), 0)
    return { label: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date), revenue }
  })
}

function currency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

export default function AdminOverview() {
  const { orders, users, products } = useSelector((state) => state.adminData)
  const revenue = orders.filter((order) => order.status !== 'Cancelled').reduce((total, order) => total + (Number(order.total) || 0), 0)
  const series = getLastSevenDays(orders)
  const maxDay = Math.max(...series.map((day) => day.revenue), 1)
  const stats = [
    { label: 'Total revenue', value: currency(revenue), icon: CircleDollarSign, detail: 'Excludes cancelled orders' },
    { label: 'Orders', value: orders.length.toLocaleString(), icon: ShoppingBag, detail: 'Demo and local orders' },
    { label: 'Users', value: users.length.toLocaleString(), icon: Users, detail: 'Registered customer profiles' },
    { label: 'Products', value: products.length.toLocaleString(), icon: Package, detail: 'Available catalog listings' },
  ]
  const latestOrders = [...orders].sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt)).slice(0, 5)

  return (
    <div className="space-y-7">
      <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#328051]">Store operations</p><h1 className="mt-1 text-2xl font-bold text-[#20352a]">Overview</h1><p className="mt-1 text-sm text-[#738078]">A snapshot of store activity and catalog health.</p></div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{stats.map(({ label, value, icon: Icon, detail }) => <article key={label} className="rounded-xl border border-[#dfe8e0] bg-white p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between gap-2"><p className="text-xs font-medium text-[#738078] sm:text-sm">{label}</p><Icon className="h-4 w-4 text-[#398456]" /></div><p className="mt-3 text-2xl font-bold text-[#20352a]">{value}</p><p className="mt-1 text-xs text-[#89958c]">{detail}</p></article>)}</div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <section className="rounded-xl border border-[#dfe8e0] bg-white p-5 shadow-sm sm:p-6"><div className="flex items-end justify-between gap-3"><div><h2 className="font-bold text-[#2c3c31]">Revenue · last 7 days</h2><p className="mt-1 text-xs text-[#89958c]">Daily total from non-cancelled orders</p></div><span className="text-sm font-bold text-[#236744]">{currency(series.reduce((total, day) => total + day.revenue, 0))}</span></div><div className="mt-7 flex h-48 items-end gap-2 border-b border-[#e8eee9] px-1 sm:gap-4">{series.map((day) => <div key={day.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"><span className="max-w-full truncate text-[0.65rem] text-[#738078]">{day.revenue ? currency(day.revenue) : ''}</span><div title={`${day.label}: ${currency(day.revenue)}`} className="w-full max-w-12 rounded-t-md bg-[#73bd88] transition hover:bg-[#429762]" style={{ height: `${Math.max(day.revenue > 0 ? 8 : 2, (day.revenue / maxDay) * 120)}px` }} /><span className="pb-2 text-xs text-[#738078]">{day.label}</span></div>)}</div></section>

        <section className="rounded-xl border border-[#dfe8e0] bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between gap-3"><div><h2 className="font-bold text-[#2c3c31]">Latest orders</h2><p className="mt-1 text-xs text-[#89958c]">Most recent activity</p></div><Link to="/admin/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-[#176a43]">All orders <ArrowRight className="h-4 w-4" /></Link></div>{latestOrders.length === 0 ? <p className="py-12 text-center text-sm text-[#829087]">No orders yet.</p> : <div className="mt-4 divide-y divide-[#edf1ed]">{latestOrders.map((order) => <Link key={order.id} to="/admin/orders" className="flex items-center gap-3 py-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eff6f0] text-[#398456]"><ShoppingBag className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-[#344238]">{order.customerName}</span><span className="mt-0.5 block text-xs text-[#89958c]">{order.number}</span></span><span className="text-right"><span className="block text-sm font-semibold text-[#344238]">{currency(order.total)}</span><span className="mt-0.5 block text-[0.68rem] text-[#768279]">{order.status}</span></span></Link>)}</div>}</section>
      </div>
    </div>
  )
}