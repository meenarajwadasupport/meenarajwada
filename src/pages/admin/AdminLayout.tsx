import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingBag, Tag, Star, BookOpen,
  Image, Settings, MessageSquare, Mail, LogOut, Menu, X, Sparkles,
  ExternalLink,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'

const navItems = [
  { to: '/admin',               label: 'Dashboard',      icon: LayoutDashboard, end: true },
  { to: '/admin/orders',        label: 'Orders',         icon: ShoppingBag },
  { to: '/admin/products',      label: 'Products',       icon: Package },
  { to: '/admin/custom-orders', label: 'Custom Orders',  icon: Sparkles },
  { to: '/admin/categories',    label: 'Categories',     icon: Tag },
  { to: '/admin/hero-slider',   label: 'Hero Slider',    icon: Image },
  { to: '/admin/testimonials',  label: 'Testimonials',   icon: Star },
  { to: '/admin/blog',          label: 'Blog',           icon: BookOpen },
  { to: '/admin/messages',      label: 'Messages',       icon: MessageSquare },
  { to: '/admin/newsletter',    label: 'Newsletter',     icon: Mail },
  { to: '/admin/site-settings', label: 'Site Settings',  icon: Settings },
]

function useBadges() {
  return useQuery({
    queryKey: ['admin-badges'],
    queryFn: async () => {
      const [msgs, custom] = await Promise.all([
        supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('is_read', false),
        supabase.from('custom_order_requests').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      ])
      return {
        messages: msgs.count ?? 0,
        customOrders: custom.count ?? 0,
      }
    },
    refetchInterval: 60_000,
  })
}

export default function AdminLayout() {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data: badges } = useBadges()

  const badgeMap: Record<string, number> = {
    '/admin/messages':      badges?.messages ?? 0,
    '/admin/custom-orders': badges?.customOrders ?? 0,
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full w-56 flex-shrink-0" style={{ background: 'hsl(345,80%,12%)' }}>

      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-white font-bold text-sm" style={{ fontFamily: 'serif' }}>M</span>
          </div>
          <div>
            <h1 className="font-bold text-white text-sm leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Meena Rajwada</h1>
            <p className="text-[10px] text-white/40 tracking-widest uppercase mt-0.5">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, end }) => {
          const badge = badgeMap[to] ?? 0
          return (
            <NavLink key={to} to={to} end={end} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-white/15 text-white font-semibold'
                    : 'text-white/60 hover:text-white hover:bg-white/8'
                }`
              }>
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {badge > 0 && (
                <span className="w-5 h-5 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <a href="/" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 w-full text-left text-sm text-white/50 hover:text-white hover:bg-white/8 rounded-lg transition-colors">
          <ExternalLink className="w-4 h-4" /> View Store
        </a>
        <button onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 w-full text-left text-sm text-white/50 hover:text-white hover:bg-white/8 rounded-lg transition-colors">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
        {user?.email && (
          <p className="text-[10px] text-white/25 px-3 pt-2 truncate">{user.email}</p>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-[hsl(0,0%,97%)] overflow-hidden">

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-shrink-0 shadow-xl">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="flex-shrink-0 shadow-2xl"><Sidebar /></div>
          <div className="flex-1 bg-black/60" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile Top Bar */}
        <header className="flex items-center gap-3 px-5 py-3.5 bg-white border-b border-border md:hidden shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 hover:bg-background rounded-lg transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-primary" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Meena Rajwada Admin
          </span>
          {(badges?.messages ?? 0) + (badges?.customOrders ?? 0) > 0 && (
            <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
              {(badges?.messages ?? 0) + (badges?.customOrders ?? 0)}
            </span>
          )}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-5 sm:p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
