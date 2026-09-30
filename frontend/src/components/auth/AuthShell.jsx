import { Link } from 'react-router-dom'
import heroImage from '../../assets/images/hero-image-2.jfif'

export default function AuthShell({ mode, children }) {
  const isLogin = mode === 'login'

  return (
    <div className="min-h-[100svh] bg-[#f7faf7] md:grid md:grid-cols-2">
      <section className="flex min-h-[100svh] flex-col px-6 py-7 sm:px-12 lg:px-[11%]">
        <Link to="/" className="flex w-fit items-center gap-3" aria-label="Elite Commerce home">
          <span className="flex h-11 w-11 items-center justify-center rounded-[11px] bg-[#103c2d] text-xl font-black text-white">E</span>
          <span className="text-[1.65rem] font-bold tracking-[-0.06em] text-[#182a21]">ELITE</span>
        </Link>

        <div className="my-auto w-full max-w-[430px] self-center py-12">
          <div className="mb-7">
            <p className="text-[1.05rem] font-medium text-[#24342b]">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </p>
            <p className="mt-1 text-sm text-[#87918a]">
              {isLogin ? 'Sign in to continue to your account' : 'Join Elite Commerce to get started'}
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-full border border-[#d8ded9] p-1">
            <Link
              to="/login"
              aria-current={isLogin ? 'page' : undefined}
              className={`rounded-full py-2.5 text-center text-sm font-medium transition ${isLogin ? 'bg-[#1a7f52] text-white shadow-sm' : 'text-[#6f7972] hover:text-[#1a7f52]'}`}
            >
              Sign in
            </Link>
            <Link
              to="/register"
              aria-current={!isLogin ? 'page' : undefined}
              className={`rounded-full py-2.5 text-center text-sm font-medium transition ${!isLogin ? 'bg-[#1a7f52] text-white shadow-sm' : 'text-[#6f7972] hover:text-[#1a7f52]'}`}
            >
              Sign up
            </Link>
          </div>

          {children}
          <p className="mt-5 text-center text-xs leading-5 text-[#87918a]">
            Demo account only. Your profile is saved in this browser; no real payment or identity service is connected.
          </p>
        </div>

        <p className="text-center text-xs text-[#8b948d]">© 2026 Elite Commerce</p>
      </section>

      <aside className="relative hidden min-h-[100svh] overflow-hidden bg-[#103c2d] md:block">
        <img src={heroImage} alt="Featured audio collection" className="absolute inset-0 h-full w-full object-cover opacity-65" />
        <div className="absolute inset-0 bg-[linear-gradient(155deg,rgba(9,50,36,0.3),rgba(8,38,29,0.9))]" />
        <div className="relative flex min-h-[100svh] flex-col justify-between p-10 lg:p-14">
          <span className="w-fit rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/85 backdrop-blur-sm">
            Thoughtful finds. Everyday ease.
          </span>
          <div className="max-w-lg pb-16 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b9e7c8]">ELITE COMMERCE</p>
            <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight lg:text-5xl">Good things, chosen for the way you live.</h2>
            <p className="mt-5 max-w-md text-base leading-7 text-white/75">
              Sign in to keep your details, orders, and saved picks together in one place.
            </p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-center text-[0.68rem] leading-5 text-white/70 backdrop-blur-md">
            Demo experience · Profile details are stored locally in your browser
          </div>
        </div>
      </aside>
    </div>
  )
}