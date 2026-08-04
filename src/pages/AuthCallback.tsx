import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

/**
 * Handles Supabase email confirmation redirects.
 * Supabase appends #access_token=... or ?code=... to the redirectTo URL.
 * This page picks up both, exchanges the session, then sends the user home.
 */
export default function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function handleCallback() {
      try {
        // PKCE flow: ?code=... in query string
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')

        const isRecovery = params.get('type') === 'recovery'

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
          setStatus('success')
          // Password reset flow → send to reset form; otherwise go home
          setTimeout(() => navigate(isRecovery ? '/auth?mode=reset' : '/', { replace: true }), 1500)
          return
        }

        // Implicit flow: #access_token=... in hash (older Supabase default)
        const hash = window.location.hash
        if (hash && hash.includes('access_token')) {
          const isHashRecovery = hash.includes('type=recovery')
          await new Promise(resolve => setTimeout(resolve, 1500))
          const { data } = await supabase.auth.getSession()
          if (data.session) {
            setStatus('success')
            setTimeout(() => navigate(isHashRecovery ? '/auth?mode=reset' : '/', { replace: true }), 1500)
          } else {
            throw new Error('Could not read session from confirmation link.')
          }
          return
        }

        // No token found — maybe arrived here directly
        setStatus('error')
        setMessage('No confirmation token found. Please use the link in your email.')
      } catch (e: any) {
        setStatus('error')
        setMessage(e.message ?? 'Something went wrong. Please try again.')
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#FAF7F5] px-6">
      <div className="bg-white border border-[#e8ddd8] rounded-3xl p-10 shadow-lg max-w-sm w-full text-center">
        {/* Logo */}
        <Link to="/" className="inline-block mb-6">
          <img src="/logo-circle.png" alt="Meena Rajwada" className="h-12 w-auto mx-auto" />
        </Link>

        {status === 'loading' && (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-[#7D1935] mx-auto mb-4" />
            <h2 className="font-serif text-xl font-bold text-[#1a0a08] mb-2">Confirming your email…</h2>
            <p className="text-sm text-[#9a8880]">Just a moment, please.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-4" />
            <h2 className="font-serif text-xl font-bold text-[#1a0a08] mb-2">
              {new URLSearchParams(window.location.search).get('type') === 'recovery'
                ? 'Identity verified!'
                : 'Email confirmed!'}
            </h2>
            <p className="text-sm text-[#9a8880]">
              {new URLSearchParams(window.location.search).get('type') === 'recovery'
                ? 'Redirecting you to set a new password…'
                : 'Welcome to Meena Rajwada. Taking you to the store…'}
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
            <h2 className="font-serif text-xl font-bold text-[#1a0a08] mb-2">Confirmation failed</h2>
            <p className="text-sm text-[#9a8880] mb-6">{message}</p>
            <Link
              to="/auth"
              className="inline-block bg-[#7D1935] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#9a1f40] transition-colors"
            >
              Back to Sign In
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
