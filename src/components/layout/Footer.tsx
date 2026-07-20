import { Link } from 'react-router-dom'
import { Instagram, Facebook, Youtube, Heart } from 'lucide-react'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export default function Footer() {
  const { data: settings } = useSiteSettings()
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSubscribing(true)
    try {
      const { error } = await supabase.from('newsletter_subs').upsert({ email: email.toLowerCase() }, { onConflict: 'email' })
      if (error) throw error
      toast.success('Subscribed! Welcome to Meena Rajwada 💖')
      setEmail('')
    } catch {
      toast.error('Could not subscribe. Please try again.')
    } finally {
      setSubscribing(false)
    }
  }

  return (
    <footer className="relative bg-[hsl(345,80%,12%)] text-white/75 pb-20 lg:pb-0 overflow-hidden">
      {/* Decorative gold hairline on top */}
      <div className="h-[3px] bg-gradient-to-r from-transparent via-gold to-transparent" />

      {/* Soft radial glow accents */}
      <div className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 w-80 h-80 rounded-full bg-white/[0.03] blur-2xl" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">

        {/* ── Newsletter band ── */}
        <div className="py-10 sm:py-12 border-b border-white/10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-md">
              <p className="text-[10px] font-bold tracking-[0.35em] uppercase text-gold mb-2">Join the Family</p>
              <h3 className="font-serif text-2xl sm:text-[28px] font-bold text-white leading-snug">
                Stories, new arrivals &amp; exclusive offers
              </h3>
              <p className="text-xs sm:text-sm text-white/55 mt-2 leading-relaxed">
                Be the first to see fresh handcrafted pieces and crafting stories from our studio.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="w-full lg:w-auto lg:min-w-[420px]">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:bg-white/[0.07] sm:border sm:border-white/15 sm:rounded-full sm:p-1.5 sm:focus-within:border-gold/60 transition-colors">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 min-w-0 bg-white/[0.07] sm:bg-transparent border border-white/15 sm:border-0 rounded-full px-5 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-gold/60"
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="bg-gold hover:bg-gold-light disabled:opacity-60 text-white px-7 py-3 rounded-full text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 whitespace-nowrap flex-shrink-0 hover:shadow-lg hover:shadow-gold/20 active:scale-[0.98]"
                >
                  {subscribing ? 'Joining…' : 'Subscribe'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── Link columns ── */}
        <div className="py-10 sm:py-14 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 sm:gap-10">

          {/* Brand — full width on mobile */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-3">
              <img src="/logo-circle.png" alt="MR" className="h-10 w-auto object-contain opacity-95" style={{ filter: 'brightness(0) invert(1)' }} />
              <div>
                <h3 className="font-serif text-[22px] font-bold text-white leading-none">Meena Rajwada</h3>
                <p className="text-[8px] font-semibold tracking-[0.3em] uppercase text-white/40 mt-1">Handcrafted Jewellery</p>
              </div>
            </div>
            <p className="text-[13px] leading-relaxed mb-5 text-white/55 max-w-xs">
              Handcrafted jewellery made with love, celebrating the timeless artistry of Indian tradition — one piece at a time.
            </p>
            <div className="flex gap-2.5">
              {settings?.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                  className="w-9 h-9 rounded-full bg-white/[0.08] border border-white/10 hover:bg-gold hover:border-gold flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings?.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                  className="w-9 h-9 rounded-full bg-white/[0.08] border border-white/10 hover:bg-gold hover:border-gold flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings?.youtube_url && (
                <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" aria-label="YouTube"
                  className="w-9 h-9 rounded-full bg-white/[0.08] border border-white/10 hover:bg-gold hover:border-gold flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5">
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-bold text-white mb-4 uppercase tracking-[0.25em] text-[10px] flex items-center gap-2">
              Shop
              <span className="w-6 h-px bg-gold/50" />
            </h4>
            <ul className="space-y-2.5 text-[13px]">
              {[['All Jewellery', '/shop'], ['Bangles', '/category/bangles'], ['Bridal', '/category/bridal'], ['Custom Jewelry', '/category/custom-jewelry'], ['Festive', '/category/festive']].map(([label, href]) => (
                <li key={href}>
                  <Link to={href} className="group inline-flex items-center gap-0 text-white/55 hover:text-gold transition-colors duration-200">
                    <span className="w-0 group-hover:w-3 h-px bg-gold transition-all duration-300 group-hover:mr-2" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-bold text-white mb-4 uppercase tracking-[0.25em] text-[10px] flex items-center gap-2">
              Help
              <span className="w-6 h-px bg-gold/50" />
            </h4>
            <ul className="space-y-2.5 text-[13px]">
              {[['Contact Us', '/contact'], ['FAQ', '/faq'], ['Track Order', '/track-order'], ['Shipping Policy', '/shipping-policy'], ['Return Policy', '/return-policy']].map(([label, href]) => (
                <li key={href}>
                  <Link to={href} className="group inline-flex items-center gap-0 text-white/55 hover:text-gold transition-colors duration-200">
                    <span className="w-0 group-hover:w-3 h-px bg-gold transition-all duration-300 group-hover:mr-2" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Discover */}
          <div className="col-span-2 lg:col-span-1">
            <h4 className="font-bold text-white mb-4 uppercase tracking-[0.25em] text-[10px] flex items-center gap-2">
              Discover
              <span className="w-6 h-px bg-gold/50" />
            </h4>
            <ul className="space-y-2.5 text-[13px]">
              {[['Customize Your Piece', '/customize'], ['Our Story', '/our-story'], ['Blog', '/blog'], ['Rajwada Heritage', '/category/rajwada-heritage'], ['Wishlist', '/wishlist']].map(([label, href]) => (
                <li key={href}>
                  <Link to={href} className="group inline-flex items-center gap-0 text-white/55 hover:text-gold transition-colors duration-200">
                    <span className="w-0 group-hover:w-3 h-px bg-gold transition-all duration-300 group-hover:mr-2" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="py-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-[11px] text-white/40">
          <p>© {new Date().getFullYear()} Meena Rajwada. All rights reserved.</p>
          <div className="flex gap-5">
            {[['Terms', '/terms'], ['Returns & Refunds', '/return-policy'], ['Shipping', '/shipping-policy']].map(([label, href]) => (
              <Link key={href} to={href} className="hover:text-gold transition-colors">{label}</Link>
            ))}
          </div>
          <p className="flex items-center gap-1.5">
            Made with <Heart className="w-3 h-3 fill-current text-red-400 animate-pulse" /> in India
          </p>
        </div>
      </div>
    </footer>
  )
}
