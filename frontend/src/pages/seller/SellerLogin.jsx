import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Store } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { loginSeller } from '../../features/seller/sellerAccounts'
import { setSellerSession } from '../../features/seller/sellerAuthSlice'

export default function SellerLogin() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useSelector((state) => state.sellerAuth.isAuthenticated)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) return <Navigate to="/seller" replace />

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const seller = await loginSeller({ email, password })
      dispatch(setSellerSession(seller))
      toast.success(`Welcome to ${seller.storeName}`)
      navigate(location.state?.from ?? '/seller', { replace: true })
    } catch (loginError) {
      setError(loginError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-[#eef5ef] px-4 py-10">
      <section className="w-full max-w-[460px] rounded-2xl border border-[#dce9dd] bg-white p-6 shadow-[0_22px_60px_rgba(29,67,42,0.1)] sm:p-9">
        <Link to="/" className="flex w-fit items-center gap-2 text-sm font-bold text-[#155f3d]"><Store className="h-5 w-5" /> ELITE SELLER</Link>
        <p className="mt-9 text-xs font-bold uppercase tracking-[0.16em] text-[#398456]">Seller workspace</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#183324]">Sign in to your store</h1>
        <p className="mt-2 text-sm leading-6 text-[#718078]">Manage your products and keep your storefront up to date.</p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <label className="block text-sm font-medium text-[#435147]">Seller email<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[#dce5de] px-3 outline-none focus:border-[#398456] focus:ring-2 focus:ring-[#398456]/10" /></label>
          <label className="block text-sm font-medium text-[#435147]">Password<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[#dce5de] px-3 outline-none focus:border-[#398456] focus:ring-2 focus:ring-[#398456]/10" /></label>
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={isSubmitting} className="h-11 w-full rounded-lg bg-[#176a43] text-sm font-semibold text-white transition hover:bg-[#105735] disabled:opacity-60">{isSubmitting ? 'Signing in…' : 'Sign in'}</button>
        </form>

        <p className="mt-6 text-center text-sm text-[#718078]">New seller? <Link to="/seller/register" className="font-semibold text-[#176a43] hover:underline">Create a seller account</Link></p>
        <p className="mt-5 border-t border-[#edf1ed] pt-4 text-center text-xs leading-5 text-[#8a958d]">Demo seller accounts are stored in this browser only. This is not production authentication.</p>
      </section>
    </main>
  )
}