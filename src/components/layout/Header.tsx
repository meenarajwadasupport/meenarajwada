import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useAuth } from '@/contexts/AuthContext'
import CartDrawer from '@/components/common/CartDrawer'
import SearchModal from '@/components/common/SearchModal'

const navLinks = [
  { label: 'Shop', href: '/shop' },
  {
    label: 'Collections', href: '#', children: [
      { label: 'Bangles', href: '/category/bangles' },
      { label: 'Custom Jewelry', href: '/category/custom-jewelry' },
      { label: 'Bridal', href: '/category/bridal' },
      { label: 'Festive', href: '/category/festive' },
      { label: 'Rajwada Heritage', href: '/category/rajwada-heritage' },
    ]
  },
  { label: 'Customize', href: '/customize' },
  { label: 'Our Story', href: '/our-story' },
  { label: 'Blog', href: '/blog' },
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
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header className={`sticky top-0 z-30 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <span className="font-serif text-2xl lg:text-3xl font-bold text-primary tracking-wide">Meena Rajwada</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map(link => (
                link.children ? (
                  <div key={link.label} className="relative group">
                    <button className="flex items-center gap-1 text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-2">
                      {link.label} <ChevronDown className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform" />
                    </button>
                    <div className="absolute top-full left-0 bg-white rounded-xl shadow-xl border border-border py-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 mt-1">
                      {link.children.map(child => (
                        <NavLink key={child.href} to={child.href} className="block px-4 py-2 text-sm text-foreground/80 hover:text-primary hover:bg-background/80 transition-colors">
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ) : (
                  <NavLink key={link.href} to={link.href} className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`}>
                    {link.label}
                  </NavLink>
                )
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button onClick={() => setSearchOpen(true)} className="p-2 hover:bg-background rounded-lg transition-colors" aria-label="Search">
                <Search className="w-5 h-5" />
              </button>
              <Link to="/wishlist" className="relative p-2 hover:bg-background rounded-lg transition-colors" aria-label="Wishlist">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[10px] rounded-full flex items-center justify-center">{wishlistCount}</span>}
              </Link>
              <button onClick={() => setCartOpen(true)} className="relative p-2 hover:bg-background rounded-lg transition-colors" aria-label="Cart">
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[10px] rounded-full flex items-center justify-center">{itemCount}</span>}
              </button>
              <button onClick={() => navigate(user ? '/account' : '/auth')} className="p-2 hover:bg-background rounded-lg transition-colors" aria-label="Account">
                <User className="w-5 h-5" />
              </button>
              <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 hover:bg-background rounded-lg" aria-label="Menu">
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-border bg-white px-4 py-3 space-y-1">
            {navLinks.map(link => (
              link.children ? (
                <div key={link.label}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 pt-3 pb-1">{link.label}</p>
                  {link.children.map(child => (
                    <NavLink key={child.href} to={child.href} onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm hover:text-primary">
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              ) : (
                <NavLink key={link.href} to={link.href} onClick={() => setMobileOpen(false)} className={({ isActive }) => `block px-3 py-2 text-sm rounded-lg ${isActive ? 'text-primary bg-background' : 'hover:text-primary'}`}>
                  {link.label}
                </NavLink>
              )
            ))}
          </div>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
