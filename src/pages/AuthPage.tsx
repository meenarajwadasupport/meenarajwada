import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import SEOHead from '@/components/common/SEOHead'

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) })
const signupSchema = loginSchema.extend({ full_name: z.string().min(2, 'Enter your name'), confirm_password: z.string().min(6) }).refine(d => d.password === d.confirm_password, { message: 'Passwords do not match', path: ['confirm_password'] })

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

  const inputCls = 'w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors bg-white'
  const errCls = 'text-xs text-red-500 mt-1'

  return (
    <>
      <SEOHead title={mode === 'login' ? 'Sign In' : 'Create Account'} />
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-bold">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{mode === 'login' ? 'Sign in to your Meena Rajwada account' : 'Join our jewellery family'}</p>
          </div>

          <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
            {/* Google */}
            <button onClick={signInWithGoogle} className="w-full flex items-center justify-center gap-2 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-background transition-colors">
              <img src="https://www.google.com/favicon.ico" alt="" className="w-4 h-4" />
              Continue with Google
            </button>
            <div className="flex items-center gap-3"><div className="flex-1 h-px bg-border" /><span className="text-xs text-muted-foreground">or</span><div className="flex-1 h-px bg-border" /></div>

            {mode === 'login' ? (
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-3">
                <div>
                  <input {...loginForm.register('email')} type="email" placeholder="Email" className={inputCls} />
                  {loginForm.formState.errors.email && <p className={errCls}>{loginForm.formState.errors.email.message}</p>}
                </div>
                <div>
                  <input {...loginForm.register('password')} type="password" placeholder="Password" className={inputCls} />
                  {loginForm.formState.errors.password && <p className={errCls}>{loginForm.formState.errors.password.message}</p>}
                </div>
                <button type="submit" disabled={loginForm.formState.isSubmitting} className="btn-primary w-full py-3 disabled:opacity-60">
                  {loginForm.formState.isSubmitting ? 'Signing in…' : 'Sign In'}
                </button>
              </form>
            ) : (
              <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-3">
                <div>
                  <input {...signupForm.register('full_name')} placeholder="Full Name" className={inputCls} />
                  {signupForm.formState.errors.full_name && <p className={errCls}>{signupForm.formState.errors.full_name.message}</p>}
                </div>
                <div>
                  <input {...signupForm.register('email')} type="email" placeholder="Email" className={inputCls} />
                  {signupForm.formState.errors.email && <p className={errCls}>{signupForm.formState.errors.email.message}</p>}
                </div>
                <div>
                  <input {...signupForm.register('password')} type="password" placeholder="Password (min 6 chars)" className={inputCls} />
                  {signupForm.formState.errors.password && <p className={errCls}>{signupForm.formState.errors.password.message}</p>}
                </div>
                <div>
                  <input {...signupForm.register('confirm_password')} type="password" placeholder="Confirm Password" className={inputCls} />
                  {signupForm.formState.errors.confirm_password && <p className={errCls}>{signupForm.formState.errors.confirm_password.message}</p>}
                </div>
                <button type="submit" disabled={signupForm.formState.isSubmitting} className="btn-primary w-full py-3 disabled:opacity-60">
                  {signupForm.formState.isSubmitting ? 'Creating account…' : 'Create Account'}
                </button>
              </form>
            )}

            <p className="text-center text-sm text-muted-foreground">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-primary font-medium hover:underline">
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
