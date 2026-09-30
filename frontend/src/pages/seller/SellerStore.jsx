import { useState } from 'react'
import { Store } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { updateSellerAccount } from '../../features/seller/sellerAccounts'
import { updateSellerProfile } from '../../features/seller/sellerAuthSlice'

export default function SellerStore() {
  const dispatch = useDispatch()
  const seller = useSelector((state) => state.sellerAuth.seller)
  const [form, setForm] = useState({ storeName: seller.storeName ?? '', name: seller.name ?? '', phone: seller.phone ?? '', description: seller.description ?? '' })

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  const handleSubmit = (event) => {
    event.preventDefault()
    const updatedSeller = { ...seller, ...form, storeName: form.storeName.trim(), name: form.name.trim(), phone: form.phone.trim(), description: form.description.trim() }
    dispatch(updateSellerProfile(updatedSeller))
    updateSellerAccount(updatedSeller)
    toast.success('Store profile updated')
  }

  return <div className="max-w-[850px] space-y-6"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#398456]">Seller settings</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-[#203128]">Store profile</h1><p className="mt-2 text-sm text-[#748078]">Manage the details associated with your seller account.</p></div><form onSubmit={handleSubmit} className="rounded-xl border border-[#e1e9e2] bg-white p-5 shadow-sm sm:p-7"><div className="mb-6 flex items-center gap-3 border-b border-[#edf1ed] pb-5"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#edf6ef] text-[#176a43]"><Store className="h-6 w-6" /></div><div><p className="font-bold text-[#29392f]">{seller.storeName}</p><p className="text-xs text-[#87938a]">Seller since {new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(new Date(seller.createdAt))}</p></div></div><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold text-[#435147]">Store name<input name="storeName" required minLength={2} maxLength={80} value={form.storeName} onChange={updateField} className="mt-2 h-11 w-full rounded-lg border border-[#dce5de] px-3 font-normal outline-none focus:border-[#398456]" /></label><label className="text-sm font-semibold text-[#435147]">Seller name<input name="name" required minLength={2} value={form.name} onChange={updateField} className="mt-2 h-11 w-full rounded-lg border border-[#dce5de] px-3 font-normal outline-none focus:border-[#398456]" /></label><label className="text-sm font-semibold text-[#435147]">Seller email<input type="email" readOnly value={seller.email} className="mt-2 h-11 w-full rounded-lg border border-[#e1e7e2] bg-[#f7f9f7] px-3 font-normal text-[#748078]" /></label><label className="text-sm font-semibold text-[#435147]">Contact phone<input name="phone" type="tel" value={form.phone} onChange={updateField} placeholder="Add a contact number" className="mt-2 h-11 w-full rounded-lg border border-[#dce5de] px-3 font-normal outline-none focus:border-[#398456]" /></label><label className="text-sm font-semibold text-[#435147] sm:col-span-2">Store description<textarea name="description" maxLength={500} rows={4} value={form.description} onChange={updateField} placeholder="Tell customers about your store." className="mt-2 w-full rounded-lg border border-[#dce5de] px-3 py-2.5 font-normal outline-none focus:border-[#398456]" /></label></div><div className="mt-6 flex justify-end border-t border-[#edf1ed] pt-5"><button type="submit" className="h-10 rounded-lg bg-[#176a43] px-5 text-sm font-semibold text-white hover:bg-[#105735]">Save store profile</button></div></form></div>
}