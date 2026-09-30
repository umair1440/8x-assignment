import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Plus, Star, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { createLocalId, readAccountCollection, writeAccountCollection } from '../../features/account/localAccountData'

const emptyAddress = { label: 'Home', recipient: '', phone: '', line1: '', line2: '', city: '', region: '', postalCode: '', country: '' }

export default function Addresses() {
  const userId = useSelector((state) => state.auth.user?.id)
  const [addresses, setAddresses] = useState(() => readAccountCollection('addresses', userId))
  const [isAdding, setIsAdding] = useState(false)
  const [form, setForm] = useState(emptyAddress)

  const saveAddresses = (nextAddresses) => {
    setAddresses(nextAddresses)
    writeAccountCollection('addresses', userId, nextAddresses)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const address = { ...form, id: createLocalId(), isDefault: addresses.length === 0 }
    saveAddresses([...addresses, address])
    setForm(emptyAddress)
    setIsAdding(false)
    toast.success('Address saved')
  }

  const setDefault = (id) => saveAddresses(addresses.map((address) => ({ ...address, isDefault: address.id === id })))
  const removeAddress = (id) => {
    const remaining = addresses.filter((address) => address.id !== id)
    if (!remaining.some((address) => address.isDefault) && remaining[0]) remaining[0].isDefault = true
    saveAddresses(remaining)
    toast.success('Address removed')
  }

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  return (
    <section className="mx-auto max-w-[960px] py-3 sm:py-8">
      <Link to="/account" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1a7f52] hover:text-[#126b44]"><ArrowLeft className="h-4 w-4" /> Account overview</Link>
      <div className="mb-7 mt-5 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1a7f52]">Delivery details</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1d2f2a]">Your addresses</h1></div>
        <button type="button" onClick={() => setIsAdding((current) => !current)} className="inline-flex items-center gap-2 rounded-full bg-[#1a7f52] px-5 py-3 text-sm font-semibold text-white hover:bg-[#126b44]"><Plus className="h-4 w-4" /> Add address</button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-5 rounded-2xl border border-[#dfeee1] bg-white p-5 shadow-sm sm:p-7">
          <h2 className="font-bold text-[#1d2f2a]">New delivery address</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-[#46534a]">Address label<select name="label" value={form.label} onChange={updateField} className="mt-2 h-11 w-full rounded-xl border border-[#dce2dd] bg-white px-3"><option>Home</option><option>Work</option><option>Other</option></select></label>
            <label className="text-sm font-medium text-[#46534a]">Recipient name<input name="recipient" required value={form.recipient} onChange={updateField} autoComplete="name" className="mt-2 h-11 w-full rounded-xl border border-[#dce2dd] px-3" /></label>
            <label className="text-sm font-medium text-[#46534a]">Mobile number<input name="phone" required type="tel" value={form.phone} onChange={updateField} autoComplete="tel" className="mt-2 h-11 w-full rounded-xl border border-[#dce2dd] px-3" /></label>
            <label className="text-sm font-medium text-[#46534a] sm:col-span-2">Street address<input name="line1" required value={form.line1} onChange={updateField} autoComplete="street-address" className="mt-2 h-11 w-full rounded-xl border border-[#dce2dd] px-3" /></label>
            <label className="text-sm font-medium text-[#46534a] sm:col-span-2">Apartment, suite, etc. <span className="font-normal text-[#87918a]">(optional)</span><input name="line2" value={form.line2} onChange={updateField} className="mt-2 h-11 w-full rounded-xl border border-[#dce2dd] px-3" /></label>
            <label className="text-sm font-medium text-[#46534a]">City<input name="city" required value={form.city} onChange={updateField} autoComplete="address-level2" className="mt-2 h-11 w-full rounded-xl border border-[#dce2dd] px-3" /></label>
            <label className="text-sm font-medium text-[#46534a]">State / Region<input name="region" required value={form.region} onChange={updateField} autoComplete="address-level1" className="mt-2 h-11 w-full rounded-xl border border-[#dce2dd] px-3" /></label>
            <label className="text-sm font-medium text-[#46534a]">Postal code<input name="postalCode" required value={form.postalCode} onChange={updateField} autoComplete="postal-code" className="mt-2 h-11 w-full rounded-xl border border-[#dce2dd] px-3" /></label>
            <label className="text-sm font-medium text-[#46534a]">Country<input name="country" required value={form.country} onChange={updateField} autoComplete="country-name" className="mt-2 h-11 w-full rounded-xl border border-[#dce2dd] px-3" /></label>
          </div>
          <div className="mt-6 flex gap-3"><button type="submit" className="rounded-full bg-[#1a7f52] px-5 py-3 text-sm font-semibold text-white">Save address</button><button type="button" onClick={() => setIsAdding(false)} className="rounded-full border border-[#dce2dd] px-5 py-3 text-sm font-semibold text-[#46534a]">Cancel</button></div>
        </form>
      )}

      {addresses.length === 0 ? (
        <div className="rounded-2xl border border-[#dfeee1] bg-white px-6 py-14 text-center shadow-sm"><MapPin className="mx-auto h-8 w-8 text-[#1a7f52]" /><h2 className="mt-4 font-bold text-[#1d2f2a]">No saved addresses</h2><p className="mt-2 text-sm text-[#748078]">Add a home or work address to speed up checkout.</p></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <article key={address.id} className="rounded-2xl border border-[#dfeee1] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 font-bold text-[#1d2f2a]"><MapPin className="h-4 w-4 text-[#1a7f52]" />{address.label}</div>{address.isDefault && <span className="rounded-full bg-[#edf7ef] px-3 py-1 text-xs font-semibold text-[#347249]">Default</span>}</div>
              <p className="mt-4 font-medium text-[#36423a]">{address.recipient}</p><p className="mt-1 text-sm leading-6 text-[#6f7972]">{address.line1}{address.line2 && `, ${address.line2}`}<br />{address.city}, {address.region} {address.postalCode}<br />{address.country}<br />{address.phone}</p>
              <div className="mt-5 flex items-center justify-between border-t border-[#edf0ed] pt-4">{!address.isDefault ? <button type="button" onClick={() => setDefault(address.id)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1a7f52]"><Star className="h-3.5 w-3.5" /> Set as default</button> : <span /> }<button type="button" onClick={() => removeAddress(address.id)} aria-label={`Remove ${address.label} address`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9b5555] hover:text-red-700"><Trash2 className="h-3.5 w-3.5" /> Remove</button></div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
