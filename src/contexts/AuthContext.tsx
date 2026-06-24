import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch profile — reads is_admin from JWT app_metadata as fallback
  async function fetchProfile(authUser: User) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle()

      const isAdmin = authUser.app_metadata?.is_admin === true

      if (data) {
        setProfile({ ...data, is_admin: data.is_admin || isAdmin } as Profile)
      } else {
        // Profile row missing — build from JWT metadata
        setProfile({
          id: authUser.id,
          full_name: authUser.user_metadata?.full_name ?? authUser.email ?? '',
          is_admin: isAdmin,
          created_at: new Date().toISOString(),
        } as Profile)
      }
    } catch {
      // RLS blocked or network error — still build from JWT
      const isAdmin = authUser.app_metadata?.is_admin === true
      setProfile({
        id: authUser.id,
        full_name: authUser.email ?? '',
        is_admin: isAdmin,
        created_at: new Date().toISOString(),
      } as Profile)
    }
  }

  useEffect(() => {
    // ── Helmet Hub pattern: set up listener BEFORE getSession ──
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          // Defer profile fetch with setTimeout to avoid auth deadlock
          setTimeout(() => {
            fetchProfile(session.user!)
          }, 0)
        } else {
          setProfile(null)
        }
      }
    )

    // Then get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user!).finally(() => setLoading(false))
        }, 0)
      } else {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } }
    })
    if (error) throw error

    // Create profile in app code (Helmet Hub pattern — no trigger needed)
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        is_admin: false,
      }, { onConflict: 'id' })
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setProfile(null)
    setUser(null)
    setSession(null)
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
  }

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signIn, signUp, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
