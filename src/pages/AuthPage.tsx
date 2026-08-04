import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import SEOHead from '@/components/common/SEOHead'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'

const loginSchema  = z.object({ email: z.string().email(), password: z.string().min(6) })
const signupSchema = loginSchema.extend({
  full_name:        z.string().min(2, 'Enter your name'),
  confirm_password: z.string().min(6),
}).refine(d => d.password === d.confirm_password, { message: 'Passwords do not match', path: ['confirm_password'] })
const forgotSchema = z.object({ email: z.string().email('Enter a valid email') })
const resetSchema  = z.object({
  password:         z.string().min(6, 'Minimum 6 characters'),
  confirm_password: z.string().min(6),
}).refine(d => d.password === d.confirm_password, { message: 'Passwords do not match', path: ['confirm_password'] })

type LoginData  = z.infer<typeof loginSchema>
type SignupData = z.infer<typeof signupSchema>
type ForgotData = z.infer<typeof forgotSchema>
type ResetData  = z.infer<typeof resetSchema>
type Mode = 'login' | 'signup' | 'forgot' | 'reset'

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [showPw, setShowPw] = useState<Record<string, boolean>>({})
  const { signIn, signUp, signInWithGoogle, resetPassword, updatePassword } = useAuth()
  const navigate       = useNavigate()
  const location       = useLocation()
  const [searchParams] = useSearchParams()
  const from = (location.state as any)?.from?.pathname ?? '/'

  useEffect(() => {
    if (searchParams.get('mode') === 'reset') setMode('reset')
  }, [searchParams])

  const loginForm  = useForm<LoginData>  ({ resolver: zodResolver(loginSchema) })
  const signupForm = useForm<SignupData> ({ resolver: zodResolver(signupSchema) })
  const forgotForm = useForm<ForgotData> ({ resolver: zodResolver(forgotSchema) })
  const resetForm  = useForm<ResetData>  ({ resolver: zodResolver(resetSchema) })

  const togglePw = (key: string) => setShowPw(prev => ({ ...prev, [key]: !prev[key] }))
  const pwType   = (key: string) => showPw[key] ? 'text' : 'password'

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

  async function handleGoogle() {
    try { await signInWithGoogle() }
    catch (e: any) { toast.error(e.message ?? 'Google sign-in failed') }
  }

  async function handleForgot(data: ForgotData) {
    try {
      await resetPassword(data.email)
      toast.success('Reset link sent! Check your inbox.')
      setMode('login')
    } catch (e: any) { toast.error(e.message ?? 'Could not send reset email') }
  }

  async function handleReset(data: ResetData) {
    try {
      await updatePassword(data.password)
      toast.success('Password updated! Please sign in.')
      navigate('/auth', { replace: true })
      setMode('login')
    } catch (e: any) { toast.error(e.message ?? 'Could not update password') }
  }

  const inputCls  = 'w-full border border-[#e8ddd8] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#7D1935] focus:ring-2 focus:ring-[#7D1935]/10 bg-white transition-all duration-200 placeholder:text-[#c4b4ae]'
  const pwInputCls = 'w-full border border-[#e8ddd8] rounded-lg pl-4 pr-11 py-3 text-sm outline-none focus:border-[#7D1935] focus:ring-2 focus:ring-[#7D1935]/10 bg-white transition-all duration-200 placeholder:text-[#c4b4ae]'
  const labelCls  = 'block text-[10px] font-bold tracking-[0.18em] uppercase text-[#9a8880] mb-1.5'
  const errCls    = 'text-[11px] text-red-500 mt-1.5'
  const isSubMode = mode === 'forgot' || mode === 'reset'

  // Reusable password field with eye toggle
  function PwField({ id, label, register, error, placeholder = '••••••••' }: {
    id: string; label: string; register: any; error?: string; placeholder?: string
  }) {
    return (
      <div>
        <label className={labelCls}>{label}</label>
        <div className="relative">
          <input {...register} type={pwType(id)} placeholder={placeholder} className={pwInputCls} />
          <button
            type="button"
            onClick={() => togglePw(id)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a8880] hover:text-[#7D1935] transition-colors"
            tabIndex={-1}
          >
            {showPw[id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {error && <p className={errCls}>{error}</p>}
      </div>
    )
  }

  // Google button
  function GoogleBtn({ label }: { label: string }) {
    return (
      <button
        type="button"
        onClick={handleGoogle}
        className="w-full flex items-center justify-center gap-3 border border-[#e8ddd8] bg-white hover:bg-[#fdf8f5] text-[#1a0a08] py-3 rounded-xl text-[13px] font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
      >
        {/* Google G logo */}
        <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        {label}
      </button>
    )
  }

  return (
    <>
      <SEOHead title={
        mode === 'login'  ? 'Sign In — Meena Rajwada' :
        mode === 'signup' ? 'Create Account — Meena Rajwada' :
        mode === 'forgot' ? 'Forgot Password — Meena Rajwada' :
                            'Set New Password — Meena Rajwada'
      } />

      <div className="min-h-[100dvh] grid grid-cols-1 lg:grid-cols-2">

        {/* ── Left panel (desktop only) ── */}
        <div className="hidden lg:flex flex-col justify-between bg-[#7D1935] text-white p-12 xl:p-16 relative overflow-hidden">
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
              {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Join the Family' : 'Account Recovery'}
            </p>
            <h2 className="font-serif text-[40px] xl:text-[48px] font-bold text-white leading-[1.1] mb-6">
              {mode === 'login'  ? <>Every piece<br />has your<br />story in it.</> :
               mode === 'signup' ? <>Jewellery made<br />to be worn<br />and remembered.</> :
                                   <>We'll help you<br />get back in.</>}
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
            <p className="text-[12px] text-white/40 italic">"Handcrafted with love, rooted in tradition."</p>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="flex flex-col items-center justify-center bg-[#FAF7F5] px-5 sm:px-10 py-14">

          {/* Mobile logo */}
          <div className="lg:hidden mb-10 text-center">
            <Link to="/" className="inline-flex flex-col items-center gap-2">
              <img src="/logo-circle.png" alt="Meena Rajwada" className="h-12 w-auto" />
              <p className="font-serif text-[20px] font-bold text-[#1a0a08]">Meena Rajwada</p>
            </Link>
          </div>

          <div className="w-full max-w-md">

            {/* Tab toggle — login / signup only */}
            {!isSubMode && (
              <div className="flex bg-white border border-[#e8ddd8] rounded-xl p-1 mb-6">
                {(['login', 'signup'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-2.5 rounded-lg text-[12px] font-bold tracking-[0.12em] uppercase transition-all duration-300 ${
                      mode === m ? 'bg-[#7D1935] text-white shadow-md' : 'text-[#9a8880] hover:text-[#1a0a08]'
                    }`}
                  >
                    {m === 'login' ? 'Sign In' : 'Register'}
                  </button>
                ))}
              </div>
            )}

            <div className="bg-white border border-[#e8ddd8] rounded-3xl p-7 sm:p-8 shadow-[0_8px_48px_-16px_rgba(125,25,53,0.08)]">

              {/* ── LOGIN ── */}
              {mode === 'login' && (
                <>
                  <GoogleBtn label="Continue with Google" />

                  <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-[#ece3dc]" />
                    <span className="text-[11px] text-[#9a8880] font-medium">or sign in with email</span>
                    <div className="flex-1 h-px bg-[#ece3dc]" />
                  </div>

                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <div>
                      <label className={labelCls}>Email Address</label>
                      <input {...loginForm.register('email')} type="email" placeholder="you@example.com" className={inputCls} />
                      {loginForm.formState.errors.email && <p className={errCls}>{loginForm.formState.errors.email.message}</p>}
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className={labelCls} style={{ marginBottom: 0 }}>Password</label>
                        <button type="button" onClick={() => setMode('forgot')} className="text-[11px] text-[#7D1935] hover:underline font-medium">
                          Forgot password?
                        </button>
                      </div>
                      <PwField
                        id="login-pw"
                        label=""
                        register={loginForm.register('password')}
                        error={loginForm.formState.errors.password?.message}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loginForm.formState.isSubmitting}
                      className="w-full bg-[#7D1935] hover:bg-[#9a1f40] disabled:opacity-60 text-white py-3.5 rounded-xl text-[12px] font-bold uppercase tracking-[0.2em] mt-2 transition-all duration-300 shadow-lg shadow-[#7D1935]/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                    >
                      {loginForm.formState.isSubmitting ? 'Signing in…' : 'Sign In'}
                    </button>
                  </form>
                </>
              )}

              {/* ── SIGN UP ── */}
              {mode === 'signup' && (
                <>
                  <GoogleBtn label="Sign up with Google" />

                  <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-[#ece3dc]" />
                    <span className="text-[11px] text-[#9a8880] font-medium">or register with email</span>
                    <div className="flex-1 h-px bg-[#ece3dc]" />
                  </div>

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
                    <PwField
                      id="signup-pw"
                      label="Password"
                      register={signupForm.register('password')}
                      error={signupForm.formState.errors.password?.message}
                      placeholder="Minimum 6 characters"
                    />
                    <PwField
                      id="signup-confirm"
                      label="Confirm Password"
                      register={signupForm.register('confirm_password')}
                      error={signupForm.formState.errors.confirm_password?.message}
                      placeholder="Repeat password"
                    />
                    <button
                      type="submit"
                      disabled={signupForm.formState.isSubmitting}
                      className="w-full bg-[#7D1935] hover:bg-[#9a1f40] disabled:opacity-60 text-white py-3.5 rounded-xl text-[12px] font-bold uppercase tracking-[0.2em] mt-2 transition-all duration-300 shadow-lg shadow-[#7D1935]/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                    >
                      {signupForm.formState.isSubmitting ? 'Creating account…' : 'Create Account'}
                    </button>
                  </form>
                </>
              )}

              {/* ── FORGOT PASSWORD ── */}
              {mode === 'forgot' && (
                <>
                  <div className="mb-5">
                    <h3 className="font-serif text-lg font-bold text-[#1a0a08]">Forgot your password?</h3>
                    <p className="text-[12px] text-[#9a8880] mt-1 leading-relaxed">Enter your email and we'll send you a link to reset it.</p>
                  </div>
                  <form onSubmit={forgotForm.handleSubmit(handleForgot)} className="space-y-4">
                    <div>
                      <label className={labelCls}>Email Address</label>
                      <input {...forgotForm.register('email')} type="email" placeholder="you@example.com" className={inputCls} />
                      {forgotForm.formState.errors.email && <p className={errCls}>{forgotForm.formState.errors.email.message}</p>}
                    </div>
                    <button
                      type="submit"
                      disabled={forgotForm.formState.isSubmitting}
                      className="w-full bg-[#7D1935] hover:bg-[#9a1f40] disabled:opacity-60 text-white py-3.5 rounded-xl text-[12px] font-bold uppercase tracking-[0.2em] mt-2 transition-all duration-300 shadow-lg shadow-[#7D1935]/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                    >
                      {forgotForm.formState.isSubmitting ? 'Sending…' : 'Send Reset Link'}
                    </button>
                  </form>
                  <button type="button" onClick={() => setMode('login')} className="mt-5 flex items-center gap-1.5 text-[12px] text-[#9a8880] hover:text-[#7D1935] transition-colors font-medium">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                  </button>
                </>
              )}

              {/* ── RESET PASSWORD ── */}
              {mode === 'reset' && (
                <>
                  <div className="mb-5">
                    <h3 className="font-serif text-lg font-bold text-[#1a0a08]">Set a new password</h3>
                    <p className="text-[12px] text-[#9a8880] mt-1 leading-relaxed">Choose a strong password for your account.</p>
                  </div>
                  <form onSubmit={resetForm.handleSubmit(handleReset)} className="space-y-4">
                    <PwField
                      id="reset-pw"
                      label="New Password"
                      register={resetForm.register('password')}
                      error={resetForm.formState.errors.password?.message}
                      placeholder="Minimum 6 characters"
                    />
                    <PwField
                      id="reset-confirm"
                      label="Confirm New Password"
                      register={resetForm.register('confirm_password')}
                      error={resetForm.formState.errors.confirm_password?.message}
                      placeholder="Repeat new password"
                    />
                    <button
                      type="submit"
                      disabled={resetForm.formState.isSubmitting}
                      className="w-full bg-[#7D1935] hover:bg-[#9a1f40] disabled:opacity-60 text-white py-3.5 rounded-xl text-[12px] font-bold uppercase tracking-[0.2em] mt-2 transition-all duration-300 shadow-lg shadow-[#7D1935]/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                    >
                      {resetForm.formState.isSubmitting ? 'Updating…' : 'Set New Password'}
                    </button>
                  </form>
                </>
              )}

            </div>

            {/* Footer link */}
            {!isSubMode && (
              <p className="text-center text-[13px] text-[#9a8880] mt-6">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-[#7D1935] font-semibold hover:underline">
                  {mode === 'login' ? 'Create one' : 'Sign in'}
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
