import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useAuth } from '@/contexts/AuthContext'
import CartDrawer from '@/components/common/CartDrawer'
import SearchModal from '@/components/common/SearchModal'

const navLinks = [
  { label: 'Shop All', href: '/shop' },
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
  { label: 'Blog', href: '/blog' },
  { label: 'About Us', href: '/our-story' },
  { label: 'Contact Us', href: '/contact' },
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
        <button className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/75 hover:text-primary transition-colors py-5">
          {link.label}
          <ChevronDown className="w-3 h-3 opacity-50 group-hover:rotate-180 transition-transform duration-200" />
        </button>
        <div className="absolute top-full left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-border/50 py-2 w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 mt-0">
          {link.children.map((child: any) => (
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
          `text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors py-5 ${
            isActive ? 'text-primary' : 'text-foreground/75 hover:text-primary'
          }`
        }>
        {link.label}
      </NavLink>
    )

  return (
    <>
      <header className={`sticky top-0 z-30 bg-white transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'shadow-sm border-b border-border/30'}`}>
        <div className="max-w-screen-xl mx-auto px-5 lg:px-10">

          {/* ── DESKTOP ── */}
          <div className="hidden lg:grid grid-cols-[200px_1fr_auto] items-center h-[76px] gap-6">

            {/* LEFT — Logo only (PNG already contains brand name) */}
            <Link to="/" className="flex items-center flex-shrink-0 group">
              <img
                src="/logo.png"
                alt="Meena Rajwada"
                className="h-[68px] w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                style={{  }}
              />
            </Link>

            {/* CENTER — Navigation */}
            <nav className="flex items-center justify-center gap-7">
              {navLinks.map(link => <NavItem key={link.label} link={link} />)}
            </nav>

            {/* RIGHT — Icons */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <button onClick={() => setSearchOpen(true)}
                className="p-2.5 text-foreground/60 hover:text-primary transition-colors rounded-lg hover:bg-background" aria-label="Search">
                <Search className="w-[18px] h-[18px]" />
              </button>
              <button onClick={() => navigate(user ? '/account' : '/auth')}
                className="p-2.5 text-foreground/60 hover:text-primary transition-colors rounded-lg hover:bg-background" aria-label="Account">
                <User className="w-[18px] h-[18px]" />
              </button>
              <Link to="/wishlist"
                className="relative p-2.5 text-foreground/60 hover:text-primary transition-colors rounded-lg hover:bg-background" aria-label="Wishlist">
                <Heart className="w-[18px] h-[18px]" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-primary text-white text-[8px] rounded-full flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <button onClick={() => setCartOpen(true)}
                className="relative p-2.5 text-foreground/60 hover:text-primary transition-colors rounded-lg hover:bg-background" aria-label="Cart">
                <ShoppingBag className="w-[18px] h-[18px]" />
                {itemCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-primary text-white text-[8px] rounded-full flex items-center justify-center font-bold">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ── MOBILE ── */}
          <div className="lg:hidden flex items-center justify-between h-16">
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-foreground/70 hover:text-primary transition-colors">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/" className="absolute left-1/2 -translate-x-1/2">
              <img src="/logo.png" alt="Meena Rajwada" className="h-12 w-auto object-contain"
                style={{  }} />
            </Link>
            <div className="flex items-center gap-0.5">
              <button onClick={() => setSearchOpen(true)} className="p-2 text-foreground/70 hover:text-primary">
                <Search className="w-5 h-5" />
              </button>
              <button onClick={() => setCartOpen(true)} className="relative p-2 text-foreground/70 hover:text-primary">
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-primary text-white text-[8px] rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-border bg-white shadow-lg">
            <div className="px-4 py-3 space-y-0.5">
              {navLinks.map(link =>
                link.children ? (
                  <div key={link.label}>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground px-3 pt-4 pb-1">
                      {link.label}
                    </p>
                    {link.children.map(child => (
                      <NavLink key={child.href} to={child.href} onClick={() => setMobileOpen(false)}
                        className="block px-3 py-2 text-sm text-foreground/70 hover:text-primary font-medium">
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                ) : (
                  <NavLink key={link.href} to={link.href} end={link.href === '/'}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `block px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] rounded-lg ${
                        isActive ? 'text-primary bg-background' : 'text-foreground/70 hover:text-primary'
                      }`
                    }>
                    {link.label}
                  </NavLink>
                )
              )}
              <div className="pt-3 border-t border-border flex gap-2 mt-2">
                <button onClick={() => { navigate(user ? '/account' : '/auth'); setMobileOpen(false) }}
                  className="flex-1 py-2.5 text-[11px] font-semibold uppercase tracking-widest border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors">
                  {user ? 'My Account' : 'Sign In'}
                </button>
                <Link to="/wishlist" onClick={() => setMobileOpen(false)}
                  className="flex-1 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-center border border-border rounded-lg hover:border-primary hover:text-primary transition-colors">
                  Wishlist
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
