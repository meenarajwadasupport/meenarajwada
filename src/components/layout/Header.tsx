import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useAuth } from '@/contexts/AuthContext'
import CartDrawer from '@/components/common/CartDrawer'
import SearchModal from '@/components/common/SearchModal'

const leftLinks = [
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
]

const rightLinks = [
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
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const NavItem = ({ link }: { link: any }) => (
    link.children ? (
      <div className="relative group">
        <button className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-foreground/80 hover:text-primary transition-colors py-2">
          {link.label} <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform" />
        </button>
        <div className="absolute top-full left-0 bg-white rounded-xl shadow-2xl border border-border py-2 w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 mt-2 z-50">
          {link.children.map((child: any) => (
            <NavLink key={child.href} to={child.href} className="block px-5 py-2.5 text-sm text-foreground/80 hover:text-primary hover:bg-background transition-colors font-medium">
              {child.label}
            </NavLink>
          ))}
        </div>
      </div>
    ) : (
      <NavLink to={link.href} className={({ isActive }) => `text-xs font-semibold uppercase tracking-widest transition-colors ${isActive ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`}>
        {link.label}
      </NavLink>
    )
  )

  return (
    <>
      <header className={`sticky top-0 z-30 transition-all duration-300 ${scrolled ? 'bg-white/97 backdrop-blur-md shadow-md' : 'bg-white shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop — 3 column centered layout */}
          <div className="hidden lg:grid grid-cols-3 items-center h-20">
            {/* Left nav */}
            <nav className="flex items-center gap-7">
              {leftLinks.map(link => <NavItem key={link.label} link={link} />)}
            </nav>

            {/* Center logo */}
            <div className="flex justify-center">
              <Link to="/" className="flex flex-col items-center group">
                <img
                  src="/logo.png"
                  alt="Meena Rajwada"
                  className="h-16 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                  onError={e => {
                    const t = e.currentTarget
                    t.style.display = 'none'
                    const parent = t.parentElement
                    if (parent) {
                      parent.innerHTML = '<span class="font-serif text-2xl font-bold text-primary tracking-wide">Meena Rajwada</span>'
                    }
                  }}
                />
              </Link>
            </div>

            {/* Right nav + icons */}
            <div className="flex items-center justify-end gap-7">
              {rightLinks.map(link => <NavItem key={link.label} link={link} />)}
              <div className="flex items-center gap-1 ml-2 border-l border-border pl-4">
                <button onClick={() => setSearchOpen(true)} className="p-2 hover:bg-background rounded-lg transition-colors" aria-label="Search">
                  <Search className="w-4.5 h-4.5" />
                </button>
                <Link to="/wishlist" className="relative p-2 hover:bg-background rounded-lg transition-colors">
                  <Heart className="w-4.5 h-4.5" />
                  {wishlistCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[9px] rounded-full flex items-center justify-center font-bold">{wishlistCount}</span>}
                </Link>
                <button onClick={() => setCartOpen(true)} className="relative p-2 hover:bg-background rounded-lg transition-colors">
                  <ShoppingBag className="w-4.5 h-4.5" />
                  {itemCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[9px] rounded-full flex items-center justify-center font-bold">{itemCount}</span>}
                </button>
                <button onClick={() => navigate(user ? '/account' : '/auth')} className="p-2 hover:bg-background rounded-lg transition-colors">
                  <User className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile layout */}
          <div className="lg:hidden flex items-center justify-between h-16">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/" className="absolute left-1/2 -translate-x-1/2">
              <img src="/logo.png" alt="Meena Rajwada" className="h-12 w-auto object-contain"
                onError={e => { e.currentTarget.style.display='none'; const s=document.createElement('span'); s.className='font-serif text-xl font-bold text-primary'; s.textContent='Meena Rajwada'; e.currentTarget.parentElement?.appendChild(s) }} />
            </Link>
            <div className="flex items-center gap-1">
              <button onClick={() => setSearchOpen(true)} className="p-2"><Search className="w-5 h-5" /></button>
              <button onClick={() => setCartOpen(true)} className="relative p-2">
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[9px] rounded-full flex items-center justify-center">{itemCount}</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-border bg-white px-4 py-4 space-y-1">
            {[...leftLinks, ...rightLinks].map(link => (
              link.children ? (
                <div key={link.label}>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-3 pt-3 pb-1">{link.label}</p>
                  {link.children.map(child => (
                    <NavLink key={child.href} to={child.href} onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm hover:text-primary font-medium">{child.label}</NavLink>
                  ))}
                </div>
              ) : (
                <NavLink key={link.href} to={link.href} end={link.href === '/'} onClick={() => setMobileOpen(false)} className={({ isActive }) => `block px-3 py-2.5 text-sm font-semibold uppercase tracking-wider rounded-lg ${isActive ? 'text-primary bg-background' : 'hover:text-primary'}`}>
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
