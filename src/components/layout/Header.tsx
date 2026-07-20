import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  Search, ShoppingBag, Heart, User, Menu, X,
  ChevronDown, ChevronRight, Home, Store,
  HelpCircle, Truck, RefreshCw, Shield, FileText, Phone, Mail,
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
]

const supportLinks = [
  { label: 'Contact Us',        href: '/contact',         icon: <Phone className="w-4 h-4" /> },
  { label: 'FAQ',               href: '/faq',             icon: <HelpCircle className="w-4 h-4" /> },
  { label: 'Shipping Policy',   href: '/shipping-policy', icon: <Truck className="w-4 h-4" /> },
  { label: 'Returns & Refunds', href: '/return-policy',   icon: <RefreshCw className="w-4 h-4" /> },
  { label: 'Privacy Policy',    href: '/privacy-policy',  icon: <Shield className="w-4 h-4" /> },
  { label: 'Terms & Conditions',href: '/terms',           icon: <FileText className="w-4 h-4" /> },
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
  const [supOpen, setSupOpen]         = useState(false)   // Support submenu in mobile drawer

  useEffect(() => { setMobileOpen(false); setColOpen(false); setSupOpen(false) }, [location.pathname])

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
  const iconCls = scrolled
    ? 'text-foreground/60 hover:text-primary hover:bg-primary/5'
    : 'text-white/85 hover:text-white hover:bg-white/10'
  const logoFilter = scrolled ? 'none' : 'brightness(0) invert(1)'

  const Badge = ({ n }: { n: number }) => (
    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-primary text-white text-[9px] rounded-full flex items-center justify-center font-bold ring-2 ring-white">
      {n > 99 ? '99+' : n}
    </span>
  )

  const NavItem = ({ link }: { link: typeof navLinks[0] }) =>
    (link as any).children ? (
      <div className="relative group">
        <button className={`relative flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 py-6 ${navCls}`}>
          {link.label}
          <ChevronDown className="w-3 h-3 opacity-50 group-hover:rotate-180 transition-transform duration-300" />
          <span className={`absolute bottom-4 left-0 right-3 h-[1.5px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ${scrolled ? 'bg-primary' : 'bg-white'}`} />
        </button>
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-1 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50">
          <div className="bg-white rounded-xl shadow-[0_16px_48px_-12px_rgba(0,0,0,0.22)] border border-border/60 py-2.5 w-56 overflow-hidden">
            <p className="px-5 pt-1 pb-2 text-[9px] font-bold tracking-[0.28em] uppercase text-muted-foreground border-b border-border/40 mb-1">Our Collections</p>
            {(link as any).children.map((child: any) => (
              <NavLink key={child.href} to={child.href}
                className="group/item flex items-center justify-between px-5 py-2.5 text-sm text-foreground/70 hover:text-primary hover:bg-primary/[0.04] transition-colors font-medium">
                {child.label}
                <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover/item:opacity-60 group-hover/item:translate-x-0 transition-all duration-200" />
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    ) : (
      <NavLink to={link.href} end={link.href === '/'}
        className={({ isActive }) =>
          `relative group/nav text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 py-6 ${
            isActive ? (scrolled ? 'text-primary' : 'text-white') : navCls
          }`
        }>
        {({ isActive }) => (
          <>
            {link.label}
            <span className={`absolute bottom-4 left-0 right-0 h-[1.5px] origin-left transition-transform duration-300 ${
              scrolled ? 'bg-primary' : 'bg-white'
            } ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover/nav:scale-x-100'}`} />
          </>
        )}
      </NavLink>
    )

  return (
    <>
      {/* ─── Sticky header ─── */}
      <header className={`sticky top-0 z-30 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-[0_2px_20px_rgba(0,0,0,0.07)] border-b border-border/40'
          : 'bg-gradient-to-b from-black/40 to-transparent'
      }`}>
        <div className="max-w-screen-xl mx-auto px-5 lg:px-10">

          {/* ── DESKTOP ── */}
          <div className="hidden lg:grid grid-cols-[auto_1fr_auto] items-center h-[76px] gap-8">
            <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
              <img src="/logo-circle.png" alt="MR" className="h-[54px] w-auto object-contain transition-all duration-500 group-hover:scale-105 group-hover:rotate-3" style={{ filter: logoFilter }} />
              <div className="flex flex-col leading-tight">
                <span className={`text-[22px] font-semibold tracking-wide leading-none transition-colors duration-500 ${scrolled ? 'text-primary' : 'text-white'}`}
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                  Meena Rajwada
                </span>
                <span className={`text-[9px] font-medium tracking-[0.32em] uppercase mt-1 transition-colors duration-500 ${scrolled ? 'text-foreground/45' : 'text-white/60'}`}
                  style={{ fontFamily: "'Jost', sans-serif" }}>
                  Handcrafted Jewellery
                </span>
              </div>
            </Link>
            <nav className="flex items-center justify-center gap-8">
              {navLinks.map(link => <NavItem key={link.label} link={link} />)}

              {/* Support dropdown */}
              <div className="relative group">
                <button className={`relative flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 py-6 ${navCls}`}>
                  Support
                  <ChevronDown className="w-3 h-3 opacity-50 group-hover:rotate-180 transition-transform duration-300" />
                  <span className={`absolute bottom-4 left-0 right-3 h-[1.5px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ${scrolled ? 'bg-primary' : 'bg-white'}`} />
                </button>
                <div className="absolute top-full right-0 pt-1 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50">
                  <div className="bg-white rounded-xl shadow-[0_16px_48px_-12px_rgba(0,0,0,0.22)] border border-border/60 py-2.5 w-60 overflow-hidden">
                    <p className="px-5 pt-1 pb-2 text-[9px] font-bold tracking-[0.28em] uppercase text-muted-foreground border-b border-border/40 mb-1">Help & Policies</p>
                    {supportLinks.map(item => (
                      <NavLink key={item.href} to={item.href}
                        className="group/item flex items-center gap-3 px-5 py-2.5 text-sm text-foreground/70 hover:text-primary hover:bg-primary/[0.04] transition-colors font-medium">
                        <span className="text-muted-foreground group-hover/item:text-primary transition-colors">{item.icon}</span>
                        {item.label}
                      </NavLink>
                    ))}
                    {/* Contact info at bottom */}
                    <div className="border-t border-border/40 mt-1.5 px-5 pt-3 pb-2 space-y-1.5">
                      <a href="mailto:support@meenarajwada.com" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                        <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                        support@meenarajwada.com
                      </a>
                      <a href="https://wa.me/916304424767" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                        <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                        +91 63044 24767
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </nav>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => setSearchOpen(true)} aria-label="Search" className={`p-2.5 rounded-full transition-all duration-300 ${iconCls}`}>
                <Search className="w-[18px] h-[18px]" strokeWidth={1.75} />
              </button>
              <button onClick={() => navigate(user ? '/account' : '/auth')} aria-label="Account" className={`p-2.5 rounded-full transition-all duration-300 ${iconCls}`}>
                <User className="w-[18px] h-[18px]" strokeWidth={1.75} />
              </button>
              <Link to="/wishlist" aria-label="Wishlist" className={`relative p-2.5 rounded-full transition-all duration-300 ${iconCls}`}>
                <Heart className="w-[18px] h-[18px]" strokeWidth={1.75} />
                {wishlistCount > 0 && <Badge n={wishlistCount} />}
              </Link>
              <button onClick={() => setCartOpen(true)} aria-label="Cart" className={`relative p-2.5 rounded-full transition-all duration-300 ${iconCls}`}>
                <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.75} />
                {itemCount > 0 && <Badge n={itemCount} />}
              </button>
            </div>
          </div>

          {/* ── MOBILE top bar ── */}
          <div className="lg:hidden relative flex items-center justify-between h-16">
            <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className={`-ml-2 p-2.5 rounded-full transition-colors active:scale-95 ${scrolled ? 'text-foreground/70' : 'text-white'}`}>
              <Menu className="w-[22px] h-[22px]" strokeWidth={1.75} />
            </button>
            <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
              <img src="/logo-circle.png" alt="MR" className="h-9 w-auto object-contain" style={{ filter: logoFilter }} />
              <div className="flex flex-col leading-none">
                <span className={`text-[17px] font-semibold transition-colors duration-500 ${scrolled ? 'text-primary' : 'text-white'}`}
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                  Meena Rajwada
                </span>
              </div>
            </Link>
            <div className="flex items-center -mr-2">
              <button onClick={() => setSearchOpen(true)} aria-label="Search" className={`p-2.5 rounded-full transition-colors active:scale-95 ${scrolled ? 'text-foreground/70' : 'text-white'}`}>
                <Search className="w-5 h-5" strokeWidth={1.75} />
              </button>
              <button onClick={() => setCartOpen(true)} aria-label="Cart" className={`relative p-2.5 rounded-full transition-colors active:scale-95 ${scrolled ? 'text-foreground/70' : 'text-white'}`}>
                <ShoppingBag className="w-5 h-5" strokeWidth={1.75} />
                {itemCount > 0 && (
                  <span className={`absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 bg-primary text-white text-[9px] rounded-full flex items-center justify-center font-bold ${scrolled ? 'ring-2 ring-white' : ''}`}>
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── MOBILE DRAWER ─── */}
      {/* Backdrop */}
      <div
        className={`lg:hidden fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px] transition-opacity duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileOpen(false)}
      />
      {/* Panel */}
      <div className={`lg:hidden fixed top-0 left-0 bottom-0 z-50 w-[85vw] max-w-[340px] bg-white flex flex-col shadow-2xl transition-transform duration-300 ease-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Drawer header — brand treatment */}
        <div className="relative px-6 pt-6 pb-5 bg-gradient-to-br from-primary to-[hsl(345,80%,18%)] overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/[0.06]" />
          <div className="absolute -bottom-10 -left-6 w-24 h-24 rounded-full bg-white/[0.05]" />
          <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="absolute top-4 right-4 text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
          <img src="/logo-circle.png" alt="MR" className="h-11 w-auto object-contain mb-2.5" style={{ filter: 'brightness(0) invert(1)' }} />
          <p className="text-white text-lg font-semibold leading-none" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Meena Rajwada</p>
          <p className="text-white/55 text-[9px] font-medium tracking-[0.3em] uppercase mt-1.5">Handcrafted Jewellery</p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-2">
          <NavLink to="/" end onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `flex items-center justify-between px-6 py-[15px] text-[13.5px] font-medium tracking-wide border-b border-border/40 transition-colors ${isActive ? 'text-primary bg-primary/[0.04] border-l-2 border-l-primary' : 'text-foreground/80 active:bg-background'}`}>
            Home
          </NavLink>

          <NavLink to="/shop" onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `flex items-center justify-between px-6 py-[15px] text-[13.5px] font-medium tracking-wide border-b border-border/40 transition-colors ${isActive ? 'text-primary bg-primary/[0.04] border-l-2 border-l-primary' : 'text-foreground/80 active:bg-background'}`}>
            Shop All
          </NavLink>

          {/* Collections with submenu */}
          <button
            onClick={() => setColOpen(!colOpen)}
            className={`w-full flex items-center justify-between px-6 py-[15px] text-[13.5px] font-medium tracking-wide border-b border-border/40 transition-colors ${colOpen ? 'text-primary' : 'text-foreground/80'}`}
          >
            Collections
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${colOpen ? 'rotate-90 text-primary' : 'text-foreground/40'}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${colOpen ? 'max-h-96' : 'max-h-0'}`}>
            <div className="bg-background/80 border-b border-border/40">
              {navLinks.find(l => l.label === 'Collections')?.children?.map((child: any) => (
                <NavLink key={child.href} to={child.href} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 pl-9 pr-6 py-3 text-[13px] text-foreground/65 hover:text-primary active:bg-primary/[0.04] transition-colors border-b border-border/25 last:border-0">
                  <span className="w-1 h-1 rounded-full bg-primary/40 flex-shrink-0" />
                  {child.label}
                </NavLink>
              ))}
            </div>
          </div>

          <NavLink to="/customize" onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `flex items-center justify-between px-6 py-[15px] text-[13.5px] font-medium tracking-wide border-b border-border/40 transition-colors ${isActive ? 'text-primary bg-primary/[0.04] border-l-2 border-l-primary' : 'text-foreground/80 active:bg-background'}`}>
            Customize
          </NavLink>

          <NavLink to="/our-story" onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `flex items-center justify-between px-6 py-[15px] text-[13.5px] font-medium tracking-wide border-b border-border/40 transition-colors ${isActive ? 'text-primary bg-primary/[0.04] border-l-2 border-l-primary' : 'text-foreground/80 active:bg-background'}`}>
            About Us
          </NavLink>

          {/* Support submenu */}
          <button
            onClick={() => setSupOpen(!supOpen)}
            className={`w-full flex items-center justify-between px-6 py-[15px] text-[13.5px] font-medium tracking-wide border-b border-border/40 transition-colors ${supOpen ? 'text-primary' : 'text-foreground/80'}`}
          >
            Support
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${supOpen ? 'rotate-90 text-primary' : 'text-foreground/40'}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${supOpen ? 'max-h-[500px]' : 'max-h-0'}`}>
            <div className="bg-background/80 border-b border-border/40">
              {supportLinks.map(item => (
                <NavLink key={item.href} to={item.href} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 pl-9 pr-6 py-3 text-[13px] text-foreground/65 hover:text-primary active:bg-primary/[0.04] transition-colors border-b border-border/25 last:border-0">
                  <span className="text-primary/50">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
              {/* Contact info */}
              <div className="px-9 py-3 space-y-2 border-t border-border/40 bg-primary/[0.02]">
                <a href="mailto:support@meenarajwada.com" className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="w-3.5 h-3.5 text-primary/60 flex-shrink-0" />
                  support@meenarajwada.com
                </a>
                <a href="https://wa.me/916304424767" className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="w-3.5 h-3.5 text-primary/60 flex-shrink-0" />
                  +91 63044 24767
                </a>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-2.5 bg-background" />

          <button onClick={() => { setMobileOpen(false); navigate('/wishlist') }}
            className="w-full flex items-center gap-3.5 px-6 py-[15px] text-[13.5px] font-medium border-b border-border/40 text-foreground/80 active:bg-background transition-colors">
            <span className="w-8 h-8 rounded-full bg-primary/[0.07] flex items-center justify-center flex-shrink-0">
              <Heart className="w-4 h-4 text-primary" strokeWidth={1.75} />
            </span>
            Wishlist
            {wishlistCount > 0 && <span className="ml-auto min-w-[20px] h-5 px-1.5 bg-primary text-white text-[10px] rounded-full flex items-center justify-center font-bold">{wishlistCount}</span>}
          </button>

          <button onClick={() => { setMobileOpen(false); navigate(user ? '/account' : '/auth') }}
            className="w-full flex items-center gap-3.5 px-6 py-[15px] text-[13.5px] font-medium border-b border-border/40 text-foreground/80 active:bg-background transition-colors">
            <span className="w-8 h-8 rounded-full bg-primary/[0.07] flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-primary" strokeWidth={1.75} />
            </span>
            {user ? 'My Account' : 'Login / Register'}
          </button>
        </nav>

        {/* Drawer footer */}
        <div className="px-6 py-4 border-t border-border/50 bg-background">
          <p className="text-[10px] text-muted-foreground text-center tracking-[0.2em] uppercase flex items-center justify-center gap-2">
            <span className="w-4 h-px bg-border" />
            Handcrafted ✦ Pan India
            <span className="w-4 h-px bg-border" />
          </p>
        </div>
      </div>

      {/* ─── MOBILE BOTTOM NAV — appears only when scrolled (header is white) ─── */}
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-border shadow-[0_-4px_16px_rgba(0,0,0,0.07)] transition-transform duration-300 ${scrolled ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex items-center justify-around py-1.5 pb-safe">

          <Link to="/" className={`flex flex-col items-center gap-1 px-3 py-1.5 transition-colors ${location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'}`}>
            <Home className="w-5 h-5" strokeWidth={location.pathname === '/' ? 2 : 1.6} />
            <span className="text-[9px] font-semibold tracking-wide">Home</span>
          </Link>

          <button onClick={() => navigate('/account')} className={`flex flex-col items-center gap-1 px-3 py-1.5 transition-colors ${location.pathname.startsWith('/account') ? 'text-primary' : 'text-muted-foreground'}`}>
            <User className="w-5 h-5" strokeWidth={location.pathname.startsWith('/account') ? 2 : 1.6} />
            <span className="text-[9px] font-semibold tracking-wide">Account</span>
          </button>

          <Link to="/shop" className={`flex flex-col items-center gap-1 px-3 py-1.5 transition-colors ${location.pathname.startsWith('/shop') ? 'text-primary' : 'text-muted-foreground'}`}>
            <Store className="w-5 h-5" strokeWidth={location.pathname.startsWith('/shop') ? 2 : 1.6} />
            <span className="text-[9px] font-semibold tracking-wide">Shop</span>
          </Link>

          <Link to="/wishlist" className={`relative flex flex-col items-center gap-1 px-3 py-1.5 transition-colors ${location.pathname.startsWith('/wishlist') ? 'text-primary' : 'text-muted-foreground'}`}>
            <Heart className="w-5 h-5" strokeWidth={location.pathname.startsWith('/wishlist') ? 2 : 1.6} />
            {wishlistCount > 0 && <span className="absolute -top-0.5 right-1.5 min-w-[15px] h-[15px] px-0.5 bg-primary text-white text-[8px] rounded-full flex items-center justify-center font-bold ring-2 ring-white">{wishlistCount}</span>}
            <span className="text-[9px] font-semibold tracking-wide">Wishlist</span>
          </Link>

          <button onClick={() => setCartOpen(true)} className="relative flex flex-col items-center gap-1 px-3 py-1.5 text-muted-foreground transition-colors">
            <ShoppingBag className="w-5 h-5" strokeWidth={1.6} />
            {itemCount > 0 && <span className="absolute -top-0.5 right-1.5 min-w-[15px] h-[15px] px-0.5 bg-primary text-white text-[8px] rounded-full flex items-center justify-center font-bold ring-2 ring-white">{itemCount}</span>}
            <span className="text-[9px] font-semibold tracking-wide">Cart</span>
          </button>

        </div>
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
