import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import AuthShell from '../components/auth/AuthShell'
import { getGoogleDemoUser, loginDemoAccount } from '../features/auth/demoAccounts'
import { setCredentials } from '../features/auth/authSlice'
import { mergeLocalUser } from '../features/admin/adminDataSlice'

function createDemoToken(user) {
  return `demo-session-${user.id}-${Date.now()}`
}

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) return <Navigate to="/account" replace />

  const completeSignIn = (user) => {
    dispatch(setCredentials({ user, token: createDemoToken(user) }))
    if (!user.isAdmin) dispatch(mergeLocalUser(user))
    toast.success(`Welcome back, ${user.name.split(' ')[0]}`)
    navigate(user.isAdmin ? '/admin' : location.state?.from ?? '/account', { replace: true })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      if (email.trim().toLowerCase() === 'admin@elite.test' && password === 'admin123') {
        completeSignIn({ id: 'demo-admin', name: 'Elite Admin', email: 'admin@elite.test', role: 'admin', isAdmin: true, provider: 'Demo admin' })
      } else {
        completeSignIn(await loginDemoAccount({ email, password }))
      }
    } catch (signInError) {
      setError(signInError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = () => completeSignIn(getGoogleDemoUser())

  return (
    <AuthShell mode="login">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="relative block">
          <span className="sr-only">Email address</span>
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4.25 w-4.25 -translate-y-1/2 text-[#7c8780]" />
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            className="h-12 w-full rounded-full border border-[#dce2dd] bg-white pl-11 pr-4 text-sm text-[#24342b] outline-none transition placeholder:text-[#8d9690] focus:border-[#1a7f52] focus:ring-2 focus:ring-[#1a7f52]/10"
          />
        </label>

        <label className="relative block">
          <span className="sr-only">Password</span>
          <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4.25 w-4.25 -translate-y-1/2 text-[#7c8780]" />
          <input
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            className="h-12 w-full rounded-full border border-[#dce2dd] bg-white pl-11 pr-12 text-sm text-[#24342b] outline-none transition placeholder:text-[#8d9690] focus:border-[#1a7f52] focus:ring-2 focus:ring-[#1a7f52]/10"
          />
          <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7c8780] hover:text-[#1a7f52]">
            {showPassword ? <EyeOff className="h-4.25 w-4.25" /> : <Eye className="h-4.25 w-4.25" />}
          </button>
        </label>

        {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <button type="submit" disabled={isSubmitting} className="h-12 w-full rounded-full bg-[#1a7f52] text-sm font-semibold text-white transition hover:bg-[#126b44] disabled:cursor-wait disabled:opacity-70">
          {isSubmitting ? 'Signing in…' : 'Sign in with email'}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-[#929a94]">
        <span className="h-px flex-1 bg-[#dce2dd]" />
        OR
        <span className="h-px flex-1 bg-[#dce2dd]" />
      </div>

      <button type="button" onClick={handleGoogleSignIn} className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-[#dce2dd] bg-white text-sm font-medium text-[#344039] transition hover:bg-[#f6f9f6]">
        <span aria-hidden="true" className="text-lg font-black text-[#4285f4]">G</span>
        Continue with Google <span className="text-xs text-[#8b948d]">(demo)</span>
      </button>

      <button type="button" onClick={() => { setEmail('admin@elite.test'); setPassword('admin123'); setError('') }} className="mt-4 w-full rounded-xl border border-dashed border-[#c8dccd] bg-[#f6faf6] px-4 py-3 text-left text-xs text-[#627067] transition hover:border-[#8cbea0] hover:bg-[#eff7f0]">
        <span className="block font-semibold text-[#315b3e]">Demo admin account</span>
        <span className="mt-1 block">admin@elite.test · admin123 (select to fill)</span>
      </button>

      <p className="mt-5 text-center text-sm text-[#737e76]">
        New here? <Link to="/register" className="font-semibold text-[#1a7f52] hover:underline">Create an account</Link>
      </p>
    </AuthShell>
  )
}
