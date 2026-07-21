import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import SEOHead from '@/components/common/SEOHead'

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) })
const signupSchema = loginSchema.extend({
  full_name: z.string().min(2, 'Enter your name'),
  confirm_password: z.string().min(6),
}).refine(d => d.password === d.confirm_password, { message: 'Passwords do not match', path: ['confirm_password'] })

type LoginData = z.infer<typeof loginSchema>
type SignupData = z.infer<typeof signupSchema>

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname ?? '/'

  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) })
  const signupForm = useForm<SignupData>({ resolver: zodResolver(signupSchema) })

  async function handleLogin(data: LoginData) {
    try { await signIn(data.email, data.password); navigate(from, { replace: true }) }
    catch (e: any) { toast.error(e.message ?? 'Login failed') }
  }

  async function handleSignup(data: SignupData) {
    try {
      await signUp(data.email, data.password, data.full_name)
      toast.success('Account created! Please check your email to verify.')
      setMode('login')
    } catch (e: any) { toast.error(e.message ?? 'Sign up failed') }
  }

  const inputCls = 'w-full border border-[#e8ddd8] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#7D1935] focus:ring-2 focus:ring-[#7D1935]/10 bg-white transition-all duration-200 placeholder:text-[#c4b4ae]'
  const labelCls = 'block text-[10px] font-bold tracking-[0.18em] uppercase text-[#9a8880] mb-1.5'
  const errCls = 'text-[11px] text-red-500 mt-1.5'

  return (
    <>
      <SEOHead title={mode === 'login' ? 'Sign In — Meena Rajwada' : 'Create Account — Meena Rajwada'} />

      <div className="min-h-[100dvh] grid grid-cols-1 lg:grid-cols-2">

        {/* ── Left panel (desktop only) ── */}
        <div className="hidden lg:flex flex-col justify-between bg-[#7D1935] text-white p-12 xl:p-16 relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-black/10 blur-3xl pointer-events-none" />

          <div className="relative">
            <Link to="/" className="inline-flex items-center gap-3">
              <img src="/logo-circle.png" alt="Meena Rajwada" className="h-10 w-auto" style={{ filter: 'brightness(0) invert(1)' }} />
              <div>
                <p className="font-serif text-[18px] font-bold text-white leading-none">Meena Rajwada</p>
                <p className="text-[8px] font-semibold tracking-[0.3em] uppercase text-white/50 mt-0.5">Handcrafted Jewellery</p>
              </div>
            </Link>
          </div>

          <div className="relative">
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/50 mb-5">
              {mode === 'login' ? 'Welcome Back' : 'Join the Family'}
            </p>
            <h2 className="font-serif text-[40px] xl:text-[48px] font-bold text-white leading-[1.1] mb-6">
              {mode === 'login'
                ? <>Every piece<br />has your<br />story in it.</>
                : <>Jewellery made<br />to be worn<br />and remembered.</>
              }
            </h2>
            <div className="flex items-center gap-3 mb-8">
              <span className="w-10 h-px bg-white/30" />
              <span className="text-white/40 text-xs">✦</span>
              <span className="w-10 h-px bg-white/30" />
            </div>
            <p className="text-[14px] text-white/65 leading-relaxed max-w-xs">
              Sign in to track orders, manage your wishlist, and enjoy a personalised shopping experience.
            </p>
          </div>

          <div className="relative">
            <p className="text-[12px] text-white/40 italic">
              "Handcrafted with love, rooted in tradition."
            </p>
          </div>
        </div>

        {/* ── Right panel: form ── */}
        <div className="flex flex-col items-center justify-center bg-[#FAF7F5] px-5 sm:px-10 py-14">

          {/* Mobile logo */}
          <div className="lg:hidden mb-10 text-center">
            <Link to="/" className="inline-flex flex-col items-center gap-2">
              <img src="/logo-circle.png" alt="Meena Rajwada" className="h-12 w-auto" />
              <p className="font-serif text-[20px] font-bold text-[#1a0a08]">Meena Rajwada</p>
            </Link>
          </div>

          <div className="w-full max-w-md">
            {/* Mode toggle */}
            <div className="flex bg-white border border-[#e8ddd8] rounded-xl p-1 mb-8">
              {(['login', 'signup'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2.5 rounded-lg text-[12px] font-bold tracking-[0.12em] uppercase transition-all duration-300 ${
                    mode === m
                      ? 'bg-[#7D1935] text-white shadow-md'
                      : 'text-[#9a8880] hover:text-[#1a0a08]'
                  }`}
                >
                  {m === 'login' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>

            <div className="bg-white border border-[#e8ddd8] rounded-3xl p-7 sm:p-8 shadow-[0_8px_48px_-16px_rgba(125,25,53,0.08)]">

              {/* Google */}
              <button
                onClick={signInWithGoogle}
                className="w-full flex items-center justify-center gap-3 py-3 border border-[#e8ddd8] rounded-xl text-[13px] font-semibold text-[#1a0a08] hover:bg-[#FAF7F5] hover:border-[#c8b8b2] transition-all duration-200 mb-5"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-[#ece3dc]" />
                <span className="text-[11px] text-[#9a8880] font-medium">or continue with email</span>
                <div className="flex-1 h-px bg-[#ece3dc]" />
              </div>

              {mode === 'login' ? (
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <div>
                    <label className={labelCls}>Email Address</label>
                    <input {...loginForm.register('email')} type="email" placeholder="you@example.com" className={inputCls} />
                    {loginForm.formState.errors.email && <p className={errCls}>{loginForm.formState.errors.email.message}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Password</label>
                    <input {...loginForm.register('password')} type="password" placeholder="••••••••" className={inputCls} />
                    {loginForm.formState.errors.password && <p className={errCls}>{loginForm.formState.errors.password.message}</p>}
                  </div>
                  <button
                    type="submit"
                    disabled={loginForm.formState.isSubmitting}
                    className="w-full bg-[#7D1935] hover:bg-[#9a1f40] disabled:opacity-60 text-white py-3.5 rounded-xl text-[12px] font-bold uppercase tracking-[0.2em] mt-2 transition-all duration-300 shadow-lg shadow-[#7D1935]/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {loginForm.formState.isSubmitting ? 'Signing in…' : 'Sign In'}
                  </button>
                </form>
              ) : (
                <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                  <div>
                    <label className={labelCls}>Full Name</label>
                    <input {...signupForm.register('full_name')} placeholder="Priya Sharma" className={inputCls} />
                    {signupForm.formState.errors.full_name && <p className={errCls}>{signupForm.formState.errors.full_name.message}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Email Address</label>
                    <input {...signupForm.register('email')} type="email" placeholder="you@example.com" className={inputCls} />
                    {signupForm.formState.errors.email && <p className={errCls}>{signupForm.formState.errors.email.message}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Password</label>
                    <input {...signupForm.register('password')} type="password" placeholder="Minimum 6 characters" className={inputCls} />
                    {signupForm.formState.errors.password && <p className={errCls}>{signupForm.formState.errors.password.message}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Confirm Password</label>
                    <input {...signupForm.register('confirm_password')} type="password" placeholder="Repeat password" className={inputCls} />
                    {signupForm.formState.errors.confirm_password && <p className={errCls}>{signupForm.formState.errors.confirm_password.message}</p>}
                  </div>
                  <button
                    type="submit"
                    disabled={signupForm.formState.isSubmitting}
                    className="w-full bg-[#7D1935] hover:bg-[#9a1f40] disabled:opacity-60 text-white py-3.5 rounded-xl text-[12px] font-bold uppercase tracking-[0.2em] mt-2 transition-all duration-300 shadow-lg shadow-[#7D1935]/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {signupForm.formState.isSubmitting ? 'Creating account…' : 'Create Account'}
                  </button>
                </form>
              )}
            </div>

            <p className="text-center text-[13px] text-[#9a8880] mt-6">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-[#7D1935] font-semibold hover:underline"
              >
                {mode === 'login' ? 'Create one' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
