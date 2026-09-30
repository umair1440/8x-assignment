import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CreditCard, Plus, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { createLocalId, readAccountCollection, writeAccountCollection } from '../../features/account/localAccountData'

const emptyForm = { holder: '', number: '', expiry: '', cvv: '', brand: 'Visa' }

export default function PaymentMethods() {
  const userId = useSelector((state) => state.auth.user?.id)
  const [methods, setMethods] = useState(() => readAccountCollection('payment_methods', userId))
  const [form, setForm] = useState(emptyForm)
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState('')

  const saveMethods = (nextMethods) => {
    setMethods(nextMethods)
    writeAccountCollection('payment_methods', userId, nextMethods)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const digits = form.number.replace(/\D/g, '')
    if (digits.length < 12 || digits.length > 19) {
      setError('Enter a valid card number between 12 and 19 digits.')
      return
    }

    const method = {
      id: createLocalId(),
      holder: form.holder.trim(),
      brand: form.brand,
      last4: digits.slice(-4),
      expiry: form.expiry,
      isDefault: methods.length === 0,
    }
    saveMethods([...methods, method])
    setForm(emptyForm)
    setError('')
    setIsAdding(false)
    toast.success('Payment method saved')
  }

  const setDefault = (id) => saveMethods(methods.map((method) => ({ ...method, isDefault: method.id === id })))
  const removeMethod = (id) => {
    const remaining = methods.filter((method) => method.id !== id)
    if (!remaining.some((method) => method.isDefault) && remaining[0]) remaining[0].isDefault = true
    saveMethods(remaining)
    toast.success('Payment method removed')
  }

  return (
    <section className="mx-auto max-w-240 py-3 sm:py-8">
      <Link to="/account" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1a7f52] hover:text-[#126b44]"><ArrowLeft className="h-4 w-4" /> Account overview</Link>
      <div className="mb-7 mt-5 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1a7f52]">Checkout preferences</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1d2f2a]">Your payments</h1></div><button type="button" onClick={() => setIsAdding((current) => !current)} className="inline-flex items-center gap-2 rounded-full bg-[#1a7f52] px-5 py-3 text-sm font-semibold text-white hover:bg-[#126b44]"><Plus className="h-4 w-4" /> Add payment method</button></div>

      <p className="mb-5 rounded-xl bg-[#f1f8f2] px-4 py-3 text-sm text-[#55725d]">Demo only: only the cardholder, card brand, last four digits, and expiry are saved. The card number and security code are discarded after entry.</p>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-5 rounded-2xl border border-[#dfeee1] bg-white p-5 shadow-sm sm:p-7">
          <h2 className="font-bold text-[#1d2f2a]">Add a card</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-[#46534a] sm:col-span-2">Cardholder name<input required autoComplete="cc-name" value={form.holder} onChange={(event) => setForm({ ...form, holder: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-[#dce2dd] px-3" /></label>
            <label className="text-sm font-medium text-[#46534a] sm:col-span-2">Card number<input required inputMode="numeric" autoComplete="cc-number" value={form.number} onChange={(event) => setForm({ ...form, number: event.target.value.replace(/[^\d ]/g, '').slice(0, 23) })} placeholder="1234 5678 9012 3456" className="mt-2 h-11 w-full rounded-xl border border-[#dce2dd] px-3" /></label>
            <label className="text-sm font-medium text-[#46534a]">Card brand<select value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-[#dce2dd] bg-white px-3"><option>Visa</option><option>Mastercard</option><option>American Express</option><option>Discover</option></select></label>
            <label className="text-sm font-medium text-[#46534a]">Expiry<input required type="month" autoComplete="cc-exp" value={form.expiry} onChange={(event) => setForm({ ...form, expiry: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-[#dce2dd] px-3" /></label>
            <label className="text-sm font-medium text-[#46534a]">Security code<input required type="password" inputMode="numeric" autoComplete="cc-csc" maxLength={4} value={form.cvv} onChange={(event) => setForm({ ...form, cvv: event.target.value.replace(/\D/g, '').slice(0, 4) })} className="mt-2 h-11 w-full rounded-xl border border-[#dce2dd] px-3" /></label>
          </div>
          {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
          <div className="mt-6 flex gap-3"><button type="submit" className="rounded-full bg-[#1a7f52] px-5 py-3 text-sm font-semibold text-white">Save payment method</button><button type="button" onClick={() => { setIsAdding(false); setError('') }} className="rounded-full border border-[#dce2dd] px-5 py-3 text-sm font-semibold text-[#46534a]">Cancel</button></div>
        </form>
      )}

      {methods.length === 0 ? <div className="rounded-2xl border border-[#dfeee1] bg-white px-6 py-14 text-center shadow-sm"><CreditCard className="mx-auto h-8 w-8 text-[#1a7f52]" /><h2 className="mt-4 font-bold text-[#1d2f2a]">No payment methods saved</h2><p className="mt-2 text-sm text-[#748078]">Add a demo card to make checkout quicker.</p></div> : (
        <div className="space-y-3">{methods.map((method) => <article key={method.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#dfeee1] bg-white p-5 shadow-sm"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eff8f1] text-[#1a7f52]"><CreditCard className="h-6 w-6" /></span><div className="min-w-0 flex-1"><p className="font-semibold text-[#1d2f2a]">{method.brand} ending in {method.last4} {method.isDefault && <span className="ml-2 rounded-full bg-[#edf7ef] px-2.5 py-1 text-[0.68rem] font-semibold text-[#347249]">Default</span>}</p><p className="mt-1 text-sm text-[#748078]">{method.holder} · Expires {method.expiry}</p></div>{!method.isDefault && <button type="button" onClick={() => setDefault(method.id)} className="text-xs font-semibold text-[#1a7f52]">Set default</button>}<button type="button" onClick={() => removeMethod(method.id)} aria-label={`Remove ${method.brand} ending in ${method.last4}`} className="flex h-9 w-9 items-center justify-center rounded-full text-[#8a9690] hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></article>)}</div>
      )}
    </section>
  )
}
