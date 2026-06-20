import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, Tag, Star, BookOpen, Image, Settings, MessageSquare, Mail, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/categories', label: 'Categories', icon: Tag },
  { to: '/admin/testimonials', label: 'Testimonials', icon: Star },
  { to: '/admin/blog', label: 'Blog', icon: BookOpen },
  { to: '/admin/hero-slider', label: 'Hero Slider', icon: Image },
  { to: '/admin/site-settings', label: 'Settings', icon: Settings },
  { to: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { to: '/admin/newsletter', label: 'Newsletter', icon: Mail },
]

export default function AdminLayout() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-[hsl(345,80%,14%)] text-white w-56">
      <div className="px-5 py-5 border-b border-white/10">
        <h1 className="font-serif text-lg font-bold">MR Admin</h1>
        <p className="text-xs text-white/50 mt-0.5">Meena Rajwada</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={() => setSidebarOpen(false)} className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-white/15 text-white font-medium' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
            <Icon className="w-4 h-4 flex-shrink-0" /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-white/10">
        <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2 w-full text-left text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0"><Sidebar /></div>
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="w-56 flex-shrink-0"><Sidebar /></div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}
      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center gap-3 px-5 py-3 bg-white border-b border-border md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-background rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-serif font-bold">MR Admin</span>
        </header>
        <main className="flex-1 overflow-y-auto p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
