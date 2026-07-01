import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingBag, Tag, Star, BookOpen,
  Image, Settings, MessageSquare, Mail, LogOut, Menu, X, Sparkles,
  Home, ChevronLeft, HelpCircle, Megaphone, Instagram, ArrowLeft,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// ── Nav items ────────────────────────────────────────────────────────────────
const NAV = [
  { to: '/admin',               label: 'Dashboard',     icon: LayoutDashboard, end: true },
  { to: '/admin/orders',        label: 'Orders',        icon: ShoppingBag,     badge: 'orders' },
  { to: '/admin/products',      label: 'Products',      icon: Package },
  { to: '/admin/custom-orders', label: 'Custom Orders', icon: Sparkles,        badge: 'custom' },
  { to: '/admin/categories',    label: 'Categories',    icon: Tag },
  { to: '/admin/hero-slider',   label: 'Hero Slider',   icon: Image },
  { to: '/admin/testimonials',  label: 'Testimonials',  icon: Star },
  { to: '/admin/promos',        label: 'Promos',        icon: Megaphone },
  { to: '/admin/instagram',     label: 'Instagram',     icon: Instagram },
  { to: '/admin/blog',          label: 'Blog',          icon: BookOpen },
  { to: '/admin/faqs',          label: 'FAQs',          icon: HelpCircle },
  { to: '/admin/messages',      label: 'Messages',      icon: MessageSquare,   badge: 'messages' },
  { to: '/admin/newsletter',    label: 'Newsletter',    icon: Mail },
  { to: '/admin/site-settings', label: 'Settings',      icon: Settings },
]

// ── Unread badges ────────────────────────────────────────────────────────────
function useBadges() {
  return useQuery({
    queryKey: ['admin-badges'],
    queryFn: async () => {
      const [msgs, custom, orders] = await Promise.all([
        supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('is_read', false),
        supabase.from('custom_order_requests').select('id', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ])
      return {
        messages: msgs.count ?? 0,
        custom:   custom.count ?? 0,
        orders:   orders.count ?? 0,
      }
    },
    refetchInterval: 60_000,
  })
}

// ── Sidebar nav content (shared between desktop + mobile) ────────────────────
function SidebarNav({
  collapsed = false,
  badges,
  onNavigate,
}: {
  collapsed?: boolean
  badges: Record<string, number>
  onNavigate?: () => void
}) {
  return (
    <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
      {NAV.map(({ to, label, icon: Icon, end, badge }) => {
        const count = badge ? (badges[badge] ?? 0) : 0
        return (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 relative
              ${collapsed ? 'justify-center px-2' : ''}
              ${isActive
                ? 'bg-white/15 text-white font-semibold'
                : count > 0
                  ? 'bg-red-900/30 text-red-200 hover:bg-red-800/40'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span className="flex-1 truncate">{label}</span>}
            {count > 0 && !collapsed && (
              <span className="ml-auto min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold px-1">
                {count > 9 ? '9+' : count}
              </span>
            )}
            {count > 0 && collapsed && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}

// ── Main layout ──────────────────────────────────────────────────────────────
export default function AdminLayout() {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: badges = { messages: 0, custom: 0, orders: 0 } } = useBadges()

  // Breadcrumb label from path
  const pageName = location.pathname === '/admin'
    ? 'Dashboard'
    : location.pathname.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) ?? ''

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  const sidebarBg = 'hsl(345,80%,10%)'

  // ── Sidebar content (reused in desktop + mobile) ─────────────────────────
  const SidebarContent = ({ col = false, onNav }: { col?: boolean; onNav?: () => void }) => (
    <div className="flex flex-col h-full" style={{ background: sidebarBg }}>
      {/* Logo */}
      <div className={`flex items-center h-14 border-b border-white/10 px-3 ${col ? 'justify-center' : 'justify-between'}`}>
        {!col && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm" style={{ fontFamily: 'serif' }}>M</span>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-white text-sm leading-tight truncate" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Meena Rajwada</p>
              <p className="text-[9px] text-white/40 tracking-widest uppercase">Admin Panel</p>
            </div>
          </div>
        )}
        {col && (
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-white font-bold text-sm" style={{ fontFamily: 'serif' }}>M</span>
          </div>
        )}
        {/* Desktop collapse toggle */}
        {!onNav && (
          <button
            onClick={() => setCollapsed(c => !c)}
            className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
            title={col ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${col ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Nav */}
      <SidebarNav collapsed={col} badges={badges} onNavigate={onNav} />

      {/* Footer */}
      <div className={`border-t border-white/10 p-2 space-y-1 ${col ? '' : ''}`}>
        <NavLink
          to="/"
          onClick={onNav}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/8 transition-colors ${col ? 'justify-center px-2' : ''}`}
          title={col ? 'View Store' : undefined}
        >
          <Home className="w-4 h-4 flex-shrink-0" />
          {!col && <span>View Store</span>}
        </NavLink>
        <button
          onClick={handleSignOut}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left text-sm text-white/50 hover:text-white hover:bg-white/8 transition-colors ${col ? 'justify-center px-2' : ''}`}
          title={col ? 'Sign Out' : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!col && <span>Sign Out</span>}
        </button>
        {!col && user?.email && (
          <p className="text-[10px] text-white/25 px-3 pt-1 truncate">{user.email}</p>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-[hsl(0,0%,97%)] overflow-hidden">

      {/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col flex-shrink-0 shadow-xl transition-all duration-200 ${collapsed ? 'w-[60px]' : 'w-56'}`}
      >
        <SidebarContent col={collapsed} />
      </aside>

      {/* ── Mobile Sidebar Overlay ───────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0 shadow-2xl">
            <SidebarContent onNav={() => setMobileOpen(false)} />
          </div>
          {/* Backdrop */}
          <div className="flex-1 bg-black/60" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* ── Main content area ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* ── Top header ───────────────────────────────────────────────── */}
        <header className="flex items-center justify-between gap-3 px-4 py-3 bg-white border-b border-border shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-1.5 hover:bg-background rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Back button — shows on all sub-pages */}
            {location.pathname !== '/admin' && (
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-background px-2 py-1.5 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm min-w-0">
              <span className="text-muted-foreground hidden sm:inline">Admin</span>
              {pageName !== 'Dashboard' && (
                <>
                  <span className="text-muted-foreground hidden sm:inline">/</span>
                  <span className="font-semibold text-foreground truncate">{pageName}</span>
                </>
              )}
              {pageName === 'Dashboard' && (
                <span className="font-semibold text-foreground">Dashboard</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Total unread badge on mobile */}
            {(badges.messages + badges.custom + badges.orders) > 0 && (
              <span className="md:hidden w-5 h-5 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                {Math.min(badges.messages + badges.custom + badges.orders, 9)}
              </span>
            )}
            <NavLink
              to="/"
              className="flex items-center gap-1.5 text-sm bg-foreground text-background hover:opacity-80 px-3 py-1.5 rounded-lg transition-opacity font-medium shadow-sm"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Store</span>
            </NavLink>
          </div>
        </header>

        {/* ── Page content ─────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-5 md:p-6 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
