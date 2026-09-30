import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Store } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { toast } from 'react-hot-toast'
import { registerSeller } from '../../features/seller/sellerAccounts'
import { setSellerSession } from '../../features/seller/sellerAuthSlice'

export default function SellerRegister() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', storeName: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const seller = await registerSeller(form)
      dispatch(setSellerSession(seller))
      toast.success('Seller store created')
      navigate('/seller', { replace: true })
    } catch (registerError) {
      setError(registerError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-[#eef5ef] px-4 py-10">
      <section className="w-full max-w-[480px] rounded-2xl border border-[#dce9dd] bg-white p-6 shadow-[0_22px_60px_rgba(29,67,42,0.1)] sm:p-9">
        <Link to="/" className="flex w-fit items-center gap-2 text-sm font-bold text-[#155f3d]"><Store className="h-5 w-5" /> ELITE SELLER</Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-[#398456]">Seller workspace</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#183324]">Create your store</h1>
        <p className="mt-2 text-sm leading-6 text-[#718078]">Set up a local demo seller profile to start adding products.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
          <label className="block text-sm font-medium text-[#435147]">Your name<input name="name" required minLength={2} autoComplete="name" value={form.name} onChange={updateField} className="mt-1.5 h-11 w-full rounded-lg border border-[#dce5de] px-3 outline-none focus:border-[#398456]" /></label>
          <label className="block text-sm font-medium text-[#435147]">Store name<input name="storeName" required minLength={2} value={form.storeName} onChange={updateField} className="mt-1.5 h-11 w-full rounded-lg border border-[#dce5de] px-3 outline-none focus:border-[#398456]" /></label>
          <label className="block text-sm font-medium text-[#435147]">Email<input name="email" type="email" required autoComplete="email" value={form.email} onChange={updateField} className="mt-1.5 h-11 w-full rounded-lg border border-[#dce5de] px-3 outline-none focus:border-[#398456]" /></label>
          <label className="block text-sm font-medium text-[#435147]">Password<input name="password" type="password" required minLength={8} autoComplete="new-password" value={form.password} onChange={updateField} className="mt-1.5 h-11 w-full rounded-lg border border-[#dce5de] px-3 outline-none focus:border-[#398456]" /></label>
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={isSubmitting} className="h-11 w-full rounded-lg bg-[#176a43] text-sm font-semibold text-white transition hover:bg-[#105735] disabled:opacity-60">{isSubmitting ? 'Creating store…' : 'Create seller account'}</button>
        </form>

        <p className="mt-5 text-center text-sm text-[#718078]">Already have a seller account? <Link to="/seller/login" className="font-semibold text-[#176a43] hover:underline">Sign in</Link></p>
      </section>
    </main>
  )
}