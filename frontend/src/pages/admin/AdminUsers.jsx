import { useMemo, useState } from 'react'
import { Search, Users } from 'lucide-react'
import { useSelector } from 'react-redux'

function money(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value ?? 0)
}

export default function AdminUsers() {
  const users = useSelector((state) => state.adminData.users)
  const [query, setQuery] = useState('')
  const filteredUsers = useMemo(() => [...users]
    .filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((first, second) => first.name.localeCompare(second.name)), [users, query])

  return (
    <section className="space-y-5"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#328051]">Customers</p><h1 className="mt-1 text-2xl font-bold text-[#20352a]">Users</h1><p className="mt-1 text-sm text-[#738078]">Customer accounts and purchase totals.</p></div><div className="flex h-10 max-w-sm items-center gap-2 rounded-lg border border-[#dbe6dc] bg-white px-3"><Search className="h-4 w-4 text-[#7c8980]" /><input aria-label="Search users" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or email" className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-[#929d95]" /></div>{filteredUsers.length === 0 ? <div className="rounded-xl border border-dashed border-[#cedbd0] bg-white px-5 py-14 text-center"><Users className="mx-auto h-7 w-7 text-[#6c9a79]" /><p className="mt-3 font-semibold text-[#435147]">No users found</p><p className="mt-1 text-sm text-[#87938a]">Try another name or email.</p></div> : <div className="overflow-x-auto rounded-xl border border-[#dfe8e0] bg-white shadow-sm"><table className="w-full min-w-175 border-collapse text-left"><thead className="bg-[#f8faf8] text-[0.68rem] font-bold uppercase tracking-wide text-[#78847c]"><tr><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3">Orders</th><th className="px-4 py-3">Total spent</th></tr></thead><tbody className="divide-y divide-[#edf1ed]">{filteredUsers.map((user) => <tr key={user.id} className="hover:bg-[#fbfdfb]"><td className="px-4 py-3.5"><span className="block text-sm font-semibold text-[#344238]">{user.name}</span><span className="mt-0.5 block text-xs text-[#87938a]">{user.email}</span></td><td className="px-4 py-3.5 text-sm text-[#68766d]">{user.joinedAt ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(user.joinedAt)) : '—'}</td><td className="px-4 py-3.5 text-sm text-[#536158]">{user.orderCount ?? 0}</td><td className="px-4 py-3.5 text-sm font-semibold text-[#344238]">{money(user.totalSpent)}</td></tr>)}</tbody></table></div>}</section>
  )
}