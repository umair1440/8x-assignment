import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import AuthShell from '../components/auth/AuthShell'
import { getGoogleDemoUser, registerDemoAccount } from '../features/auth/demoAccounts'
import { setCredentials } from '../features/auth/authSlice'
import { mergeLocalUser } from '../features/admin/adminDataSlice'

export default function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) return <Navigate to="/account" replace />

  const completeRegistration = (user) => {
    dispatch(setCredentials({ user, token: `demo-session-${user.id}-${Date.now()}` }))
    dispatch(mergeLocalUser(user))
    toast.success('Your demo account is ready')
    navigate('/account', { replace: true })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Your passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      completeRegistration(await registerDemoAccount({ name, email, password }))
    } catch (registrationError) {
      setError(registrationError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignUp = () => completeRegistration(getGoogleDemoUser())

  return (
    <AuthShell mode="register">
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <label className="relative block">
          <span className="sr-only">Full name</span>
          <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4.25 w-4.25 -translate-y-1/2 text-[#7c8780]" />
          <input type="text" autoComplete="name" required minLength={2} value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" className="h-12 w-full rounded-full border border-[#dce2dd] bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-[#8d9690] focus:border-[#1a7f52] focus:ring-2 focus:ring-[#1a7f52]/10" />
        </label>
        <label className="relative block">
          <span className="sr-only">Email address</span>
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4.25 w-4.25 -translate-y-1/2 text-[#7c8780]" />
          <input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" className="h-12 w-full rounded-full border border-[#dce2dd] bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-[#8d9690] focus:border-[#1a7f52] focus:ring-2 focus:ring-[#1a7f52]/10" />
        </label>
        <label className="relative block">
          <span className="sr-only">Password</span>
          <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4.25 w-4.25 -translate-y-1/2 text-[#7c8780]" />
          <input type={showPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create a password" className="h-12 w-full rounded-full border border-[#dce2dd] bg-white pl-11 pr-12 text-sm outline-none transition placeholder:text-[#8d9690] focus:border-[#1a7f52] focus:ring-2 focus:ring-[#1a7f52]/10" />
          <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7c8780] hover:text-[#1a7f52]">
            {showPassword ? <EyeOff className="h-4.25 w-4.25" /> : <Eye className="h-4.25 w-4.25" />}
          </button>
        </label>
        <label className="relative block">
          <span className="sr-only">Confirm password</span>
          <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4.25 w-4.25 -translate-y-1/2 text-[#7c8780]" />
          <input type="password" autoComplete="new-password" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm password" className="h-12 w-full rounded-full border border-[#dce2dd] bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-[#8d9690] focus:border-[#1a7f52] focus:ring-2 focus:ring-[#1a7f52]/10" />
        </label>

        {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <button type="submit" disabled={isSubmitting} className="h-12 w-full rounded-full bg-[#1a7f52] text-sm font-semibold text-white transition hover:bg-[#126b44] disabled:cursor-wait disabled:opacity-70">
          {isSubmitting ? 'Creating account…' : 'Create account with email'}
        </button>
      </form>

      <div className="my-4 flex items-center gap-3 text-xs text-[#929a94]">
        <span className="h-px flex-1 bg-[#dce2dd]" />
        OR
        <span className="h-px flex-1 bg-[#dce2dd]" />
      </div>

      <button type="button" onClick={handleGoogleSignUp} className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-[#dce2dd] bg-white text-sm font-medium text-[#344039] transition hover:bg-[#f6f9f6]">
        <span aria-hidden="true" className="text-lg font-black text-[#4285f4]">G</span>
        Sign up with Google <span className="text-xs text-[#8b948d]">(demo)</span>
      </button>

      <p className="mt-4 text-center text-sm text-[#737e76]">
        Already have an account? <Link to="/login" className="font-semibold text-[#1a7f52] hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  )
}
