import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, LockKeyhole } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { setUser } from '../../features/auth/authSlice'
import { changeDemoPassword, updateDemoAccount } from '../../features/auth/demoAccounts'

function AccountInput({ label, ...props }) {
  return (
    <label className="block text-sm font-medium text-[#46534a]">
      {label}
      <input {...props} className="mt-2 h-11 w-full rounded-xl border border-[#dce2dd] bg-white px-3 text-sm text-[#1d2f2a] outline-none focus:border-[#1a7f52] focus:ring-2 focus:ring-[#1a7f52]/10" />
    </label>
  )
}

export default function Security() {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)
  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const handleSaveProfile = (event) => {
    event.preventDefault()
    const updatedUser = { ...user, name: name.trim(), phone: phone.trim() }
    dispatch(setUser(updatedUser))
    updateDemoAccount(updatedUser)
    toast.success('Personal details updated')
  }

  const handleChangePassword = async (event) => {
    event.preventDefault()
    setPasswordError('')

    if (newPassword !== confirmPassword) {
      setPasswordError('The new passwords do not match.')
      return
    }

    try {
      await changeDemoPassword({ userId: user.id, currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast.success('Password updated')
    } catch (error) {
      setPasswordError(error.message)
    }
  }

  return (
    <section className="mx-auto max-w-[900px] py-3 sm:py-8">
      <Link to="/account" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1a7f52] hover:text-[#126b44]">
        <ArrowLeft className="h-4 w-4" /> Account overview
      </Link>
      <div className="mb-7 mt-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1a7f52]">Account settings</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1d2f2a]">Login & security</h1>
      </div>

      <form onSubmit={handleSaveProfile} className="rounded-2xl border border-[#dfeee1] bg-white p-5 shadow-sm sm:p-7">
        <h2 className="font-bold text-[#1d2f2a]">Personal details</h2>
        <p className="mt-1 text-sm text-[#748078]">Update the name and mobile number on your account.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <AccountInput label="Full name" type="text" autoComplete="name" minLength={2} required value={name} onChange={(event) => setName(event.target.value)} />
          <AccountInput label="Mobile number" type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Add your mobile number" />
          <AccountInput label="Email address" type="email" value={user?.email ?? ''} readOnly className="bg-[#f6f8f6] text-[#758078]" />
        </div>
        <button type="submit" className="mt-6 rounded-full bg-[#1a7f52] px-5 py-3 text-sm font-semibold text-white hover:bg-[#126b44]">Save personal details</button>
      </form>

      <form onSubmit={handleChangePassword} className="mt-5 rounded-2xl border border-[#dfeee1] bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eff8f1] text-[#1a7f52]"><LockKeyhole className="h-5 w-5" /></span>
          <div>
            <h2 className="font-bold text-[#1d2f2a]">Change password</h2>
            <p className="mt-1 text-sm text-[#748078]">{user?.provider === 'Email' ? 'Choose a new password for your email account.' : 'This demo profile uses Google sign-in; password changes are unavailable.'}</p>
          </div>
        </div>

        {user?.provider === 'Email' && (
          <>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <AccountInput label="Current password" type="password" autoComplete="current-password" minLength={8} required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
              <AccountInput label="New password" type="password" autoComplete="new-password" minLength={8} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
              <AccountInput label="Confirm new password" type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
            </div>
            {passwordError && <p role="alert" className="mt-4 text-sm text-red-700">{passwordError}</p>}
            <button type="submit" className="mt-6 rounded-full border border-[#1a7f52] px-5 py-3 text-sm font-semibold text-[#1a7f52] transition hover:bg-[#f1f8f2]">Update password</button>
          </>
        )}
      </form>
    </section>
  )
}