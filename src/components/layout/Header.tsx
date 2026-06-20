import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useAuth } from '@/contexts/AuthContext'
import CartDrawer from '@/components/common/CartDrawer'
import SearchModal from '@/components/common/SearchModal'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Customize', href: '/customize' },
  {
    label: 'Collections', href: '#', children: [
      { label: 'Bangles', href: '/category/bangles' },
      { label: 'Custom Jewelry', href: '/category/custom-jewelry' },
      { label: 'Bridal', href: '/category/bridal' },
      { label: 'Festive', href: '/category/festive' },
      { label: 'Rajwada Heritage', href: '/category/rajwada-heritage' },
    ]
  },
  { label: 'Our Story', href: '/our-story' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
]

export default function Header() {
  const { itemCount } = useCart()
  const { count: wishlistCount } = useWishlist()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const NavItem = ({ link }: { link: any }) =>
    link.children ? (
      <div className="relative group">
        <button className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/80 hover:text-primary transition-colors py-3">
          {link.label} <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform" />
        </button>
        <div className="absolute top-full left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-border py-2 w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          {link.children.map((child: any) => (
            <NavLink key={child.href} to={child.href}
              className="block px-5 py-2.5 text-sm text-foreground/80 hover:text-primary hover:bg-background transition-colors font-medium">
              {child.label}
            </NavLink>
          ))}
        </div>
      </div>
    ) : (
      <NavLink to={link.href} end={link.href === '/'}
        className={({ isActive }) =>
          `text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors py-3 border-b-2 ${
            isActive ? 'text-primary border-primary' : 'text-foreground/80 hover:text-primary border-transparent'
          }`
        }>
        {link.label}
      </NavLink>
    )

  return (
    <>
      <header className={`sticky top-0 z-30 bg-white transition-shadow duration-300 ${scrolled ? 'shadow-lg' : 'shadow-sm'}`}>

        {/* ── LOGO BAR ── */}
        <div className="border-b border-border/60">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="hidden lg:grid grid-cols-3 items-center h-28">

              {/* Left icons */}
              <div className="flex items-center gap-1">
                <button onClick={() => setSearchOpen(true)}
                  className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-foreground/70 hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-background">
                  <Search className="w-4 h-4" /> Search
                </button>
                <Link to="/wishlist"
                  className="relative flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-foreground/70 hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-background">
                  <Heart className="w-4 h-4" />
                  <span>Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="absolute top-1 left-6 w-4 h-4 bg-primary text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              </div>

              {/* Center — LARGE logo */}
              <div className="flex justify-center">
                <Link to="/" className="group block">
                  <img
                    src="/logo.svg"
                    alt="Meena Rajwada"
                    className="h-24 w-auto object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
                  />
                </Link>
              </div>

              {/* Right icons */}
              <div className="flex items-center justify-end gap-1">
                <button
                  onClick={() => setCartOpen(true)}
                  className="relative flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-foreground/70 hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-background">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Cart</span>
                  {itemCount > 0 && (
                    <span className="absolute top-1 left-6 w-4 h-4 bg-primary text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                      {itemCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => navigate(user ? '/account' : '/auth')}
                  className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-foreground/70 hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-background">
                  <User className="w-4 h-4" />
                  <span>{user ? 'Account' : 'Sign In'}</span>
                </button>
              </div>
            </div>

            {/* Mobile logo bar */}
            <div className="lg:hidden flex items-center justify-between h-20">
              <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-foreground/70 hover:text-primary">
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <Link to="/" className="absolute left-1/2 -translate-x-1/2">
                <img src="/logo.svg" alt="Meena Rajwada" className="h-16 w-auto object-contain" />
              </Link>
              <div className="flex items-center gap-1">
                <button onClick={() => setSearchOpen(true)} className="p-2 text-foreground/70 hover:text-primary">
                  <Search className="w-5 h-5" />
                </button>
                <button onClick={() => setCartOpen(true)} className="relative p-2 text-foreground/70 hover:text-primary">
                  <ShoppingBag className="w-5 h-5" />
                  {itemCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[9px] rounded-full flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── NAVIGATION BAR ── */}
        <div className="hidden lg:block border-b border-border/40 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <nav className="flex items-center justify-center gap-8">
              {navLinks.map(link => <NavItem key={link.label} link={link} />)}
            </nav>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-border bg-white px-4 py-3 space-y-0.5 shadow-lg">
            {navLinks.map(link =>
              link.children ? (
                <div key={link.label}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 pt-4 pb-1">
                    {link.label}
                  </p>
                  {link.children.map(child => (
                    <NavLink key={child.href} to={child.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 text-sm hover:text-primary font-medium">
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              ) : (
                <NavLink key={link.href} to={link.href} end={link.href === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2.5 text-sm font-semibold uppercase tracking-wider rounded-lg ${
                      isActive ? 'text-primary bg-background' : 'hover:text-primary'
                    }`
                  }>
                  {link.label}
                </NavLink>
              )
            )}
            <div className="pt-3 border-t border-border mt-2 flex gap-2">
              <button onClick={() => { navigate(user ? '/account' : '/auth'); setMobileOpen(false) }}
                className="flex-1 py-2.5 text-xs font-semibold uppercase tracking-widest border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors">
                {user ? 'My Account' : 'Sign In'}
              </button>
              <Link to="/wishlist" onClick={() => setMobileOpen(false)}
                className="flex-1 py-2.5 text-xs font-semibold uppercase tracking-widest text-center border border-border rounded-lg hover:border-primary hover:text-primary transition-colors">
                Wishlist
              </Link>
            </div>
          </div>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
