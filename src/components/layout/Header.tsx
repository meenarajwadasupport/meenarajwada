import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  Search, ShoppingBag, Heart, User, Menu, X,
  ChevronDown, ChevronRight, Home, Store, Clock,
} from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useAuth } from '@/contexts/AuthContext'
import CartDrawer from '@/components/common/CartDrawer'
import SearchModal from '@/components/common/SearchModal'

const navLinks = [
  { label: 'Shop All',    href: '/shop' },
  { label: 'Customize',  href: '/customize' },
  {
    label: 'Collections', href: '#', children: [
      { label: 'Bangles',          href: '/category/bangles' },
      { label: 'Custom Jewelry',   href: '/category/custom-jewelry' },
      { label: 'Bridal',           href: '/category/bridal' },
      { label: 'Festive',          href: '/category/festive' },
      { label: 'Rajwada Heritage', href: '/category/rajwada-heritage' },
    ],
  },
  { label: 'Blog',       href: '/blog' },
  { label: 'About Us',  href: '/our-story' },
  { label: 'Contact',   href: '/contact' },
]

export default function Header() {
  const { itemCount } = useCart()
  const { count: wishlistCount } = useWishlist()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'

  const [scrolled, setScrolled]       = useState(!isHome)
  const [cartOpen, setCartOpen]       = useState(false)
  const [searchOpen, setSearchOpen]   = useState(false)
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [colOpen, setColOpen]         = useState(false)   // Collections submenu in mobile drawer

  useEffect(() => { setMobileOpen(false); setColOpen(false) }, [location.pathname])

  useEffect(() => {
    if (!isHome) { setScrolled(true); return }
    const fn = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', fn)
    fn()
    return () => window.removeEventListener('scroll', fn)
  }, [isHome])

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const navCls  = scrolled ? 'text-foreground/75 hover:text-primary' : 'text-white/90 hover:text-white'
  const iconCls = scrolled ? 'text-foreground/60 hover:text-primary' : 'text-white/80 hover:text-white'
  const logoFilter = scrolled ? 'none' : 'brightness(0) invert(1)'

  const NavItem = ({ link }: { link: typeof navLinks[0] }) =>
    (link as any).children ? (
      <div className="relative group">
        <button className={`flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 py-5 ${navCls}`}>
          {link.label}
          <ChevronDown className="w-3 h-3 opacity-50 group-hover:rotate-180 transition-transform duration-200" />
        </button>
        <div className="absolute top-full left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-border/50 py-2 w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          {(link as any).children.map((child: any) => (
            <NavLink key={child.href} to={child.href}
              className="block px-5 py-2.5 text-sm text-foreground/70 hover:text-primary hover:bg-background transition-colors font-medium">
              {child.label}
            </NavLink>
          ))}
        </div>
      </div>
    ) : (
      <NavLink to={link.href} end={link.href === '/'}
        className={({ isActive }) =>
          `text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 py-5 ${
            isActive ? (scrolled ? 'text-primary' : 'text-white') : navCls
          }`
        }>
        {link.label}
      </NavLink>
    )

  return (
    <>
      {/* ─── Sticky header ─── */}
      <header className={`sticky top-0 z-30 transition-all duration-500 ${scrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
        <div className="max-w-screen-xl mx-auto px-5 lg:px-10">

          {/* ── DESKTOP ── */}
          <div className="hidden lg:grid grid-cols-[auto_1fr_auto] items-center h-[76px] gap-8">
            <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
              <img src="/logo-circle.png" alt="MR" className="h-[56px] w-auto object-contain transition-all duration-500 group-hover:scale-105" style={{ filter: logoFilter }} />
              <div className="flex flex-col leading-tight">
                <span className={`text-[21px] font-semibold tracking-wide leading-none transition-colors duration-500 ${scrolled ? 'text-primary' : 'text-white'}`}
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                  Meena Rajwada
                </span>
                <span className={`text-[9px] font-medium tracking-[0.28em] uppercase mt-0.5 transition-colors duration-500 ${scrolled ? 'text-foreground/45' : 'text-white/60'}`}
                  style={{ fontFamily: "'Jost', sans-serif" }}>
                  Handcrafted Jewellery
                </span>
              </div>
            </Link>
            <nav className="flex items-center justify-center gap-7">
              {navLinks.map(link => <NavItem key={link.label} link={link} />)}
            </nav>
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <button onClick={() => setSearchOpen(true)} className={`p-2.5 rounded-lg transition-colors duration-300 ${iconCls}`}><Search className="w-[18px] h-[18px]" /></button>
              <button onClick={() => navigate(user ? '/account' : '/auth')} className={`p-2.5 rounded-lg transition-colors duration-300 ${iconCls}`}><User className="w-[18px] h-[18px]" /></button>
              <Link to="/wishlist" className={`relative p-2.5 rounded-lg transition-colors duration-300 ${iconCls}`}>
                <Heart className="w-[18px] h-[18px]" />
                {wishlistCount > 0 && <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-primary text-white text-[8px] rounded-full flex items-center justify-center font-bold">{wishlistCount}</span>}
              </Link>
              <button onClick={() => setCartOpen(true)} className={`relative p-2.5 rounded-lg transition-colors duration-300 ${iconCls}`}>
                <ShoppingBag className="w-[18px] h-[18px]" />
                {itemCount > 0 && <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-primary text-white text-[8px] rounded-full flex items-center justify-center font-bold">{itemCount}</span>}
              </button>
            </div>
          </div>

          {/* ── MOBILE top bar ── */}
          <div className="lg:hidden flex items-center justify-between h-16">
            <button onClick={() => setMobileOpen(true)} className={`p-2 transition-colors ${scrolled ? 'text-foreground/70' : 'text-white'}`}>
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
              <img src="/logo-circle.png" alt="MR" className="h-9 w-auto object-contain" style={{ filter: logoFilter }} />
              <span className={`text-base font-semibold transition-colors duration-500 ${scrolled ? 'text-primary' : 'text-white'}`}
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                Meena Rajwada
              </span>
            </Link>
            <div className="flex items-center gap-0.5">
              <button onClick={() => setSearchOpen(true)} className={`p-2 transition-colors ${scrolled ? 'text-foreground/70' : 'text-white'}`}>
                <Search className="w-5 h-5" />
              </button>
              <button onClick={() => setCartOpen(true)} className={`relative p-2 transition-colors ${scrolled ? 'text-foreground/70' : 'text-white'}`}>
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-primary text-white text-[8px] rounded-full flex items-center justify-center">{itemCount}</span>}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── MOBILE DRAWER (RoSin style) ─── */}
      {/* Backdrop */}
      <div
        className={`lg:hidden fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileOpen(false)}
      />
      {/* Panel */}
      <div className={`lg:hidden fixed top-0 left-0 bottom-0 z-50 w-[82vw] max-w-[320px] bg-white flex flex-col shadow-2xl transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 bg-primary">
          <span className="text-white text-xs font-bold tracking-[0.25em] uppercase">Menu</span>
          <button onClick={() => setMobileOpen(false)} className="text-white/80 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto">
          <NavLink to="/" end onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `flex items-center justify-between px-6 py-4 text-sm font-medium border-b border-border/50 transition-colors ${isActive ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`}>
            Home
          </NavLink>

          <NavLink to="/shop" onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `flex items-center justify-between px-6 py-4 text-sm font-medium border-b border-border/50 transition-colors ${isActive ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`}>
            Shop All
          </NavLink>

          {/* Collections with submenu */}
          <button
            onClick={() => setColOpen(!colOpen)}
            className="w-full flex items-center justify-between px-6 py-4 text-sm font-medium border-b border-border/50 text-foreground/80 hover:text-primary transition-colors"
          >
            Collections
            <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${colOpen ? 'rotate-90' : ''}`} />
          </button>
          {colOpen && (
            <div className="bg-background border-b border-border/50">
              {navLinks.find(l => l.label === 'Collections')?.children?.map((child: any) => (
                <NavLink key={child.href} to={child.href} onClick={() => setMobileOpen(false)}
                  className="block pl-10 pr-6 py-3 text-sm text-foreground/65 hover:text-primary transition-colors border-b border-border/30 last:border-0">
                  {child.label}
                </NavLink>
              ))}
            </div>
          )}

          <NavLink to="/customize" onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `flex items-center justify-between px-6 py-4 text-sm font-medium border-b border-border/50 transition-colors ${isActive ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`}>
            Customize
          </NavLink>

          <NavLink to="/our-story" onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `flex items-center justify-between px-6 py-4 text-sm font-medium border-b border-border/50 transition-colors ${isActive ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`}>
            About Us
          </NavLink>

          <NavLink to="/contact" onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `flex items-center justify-between px-6 py-4 text-sm font-medium border-b border-border/50 transition-colors ${isActive ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`}>
            Contact
          </NavLink>

          {/* Divider */}
          <div className="h-2 bg-background" />

          <button onClick={() => { setMobileOpen(false); navigate('/wishlist') }}
            className="w-full flex items-center gap-3 px-6 py-4 text-sm font-medium border-b border-border/50 text-foreground/80 hover:text-primary transition-colors">
            <Heart className="w-4 h-4" />
            Wishlist
            {wishlistCount > 0 && <span className="ml-auto w-5 h-5 bg-primary text-white text-[9px] rounded-full flex items-center justify-center font-bold">{wishlistCount}</span>}
          </button>

          <button onClick={() => { setMobileOpen(false); navigate(user ? '/account' : '/auth') }}
            className="w-full flex items-center gap-3 px-6 py-4 text-sm font-medium border-b border-border/50 text-foreground/80 hover:text-primary transition-colors">
            <User className="w-4 h-4" />
            {user ? 'My Account' : 'Login / Register'}
          </button>
        </nav>

        {/* Drawer footer */}
        <div className="px-6 py-4 border-t border-border/50 bg-background">
          <p className="text-[10px] text-muted-foreground text-center tracking-widest uppercase">Handcrafted Jewellery ✦ Pan India</p>
        </div>
      </div>

      {/* ─── MOBILE BOTTOM NAV — appears only when scrolled (header is white) ─── */}
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-border shadow-[0_-2px_12px_rgba(0,0,0,0.06)] transition-transform duration-300 ${scrolled ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex items-center justify-around py-2 pb-safe">

          <Link to="/" className="flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground hover:text-primary transition-colors">
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-medium">Home</span>
          </Link>

          <button onClick={() => navigate('/account')} className="flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground hover:text-primary transition-colors">
            <User className="w-5 h-5" />
            <span className="text-[9px] font-medium">Account</span>
          </button>

          <Link to="/shop" className="flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground hover:text-primary transition-colors">
            <Store className="w-5 h-5" />
            <span className="text-[9px] font-medium">Shop</span>
          </Link>

          <Link to="/wishlist" className="relative flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground hover:text-primary transition-colors">
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && <span className="absolute top-0 right-2 w-3.5 h-3.5 bg-primary text-white text-[8px] rounded-full flex items-center justify-center font-bold">{wishlistCount}</span>}
            <span className="text-[9px] font-medium">Wishlist</span>
          </Link>

          <button onClick={() => setCartOpen(true)} className="relative flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground hover:text-primary transition-colors">
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && <span className="absolute top-0 right-2 w-3.5 h-3.5 bg-primary text-white text-[8px] rounded-full flex items-center justify-center font-bold">{itemCount}</span>}
            <span className="text-[9px] font-medium">Cart</span>
          </button>

        </div>
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
