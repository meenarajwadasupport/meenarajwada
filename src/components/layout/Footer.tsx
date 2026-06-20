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
    <footer className="bg-[hsl(345,80%,14%)] text-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-2xl font-bold text-white mb-3">Meena Rajwada</h3>
            <p className="text-sm leading-relaxed mb-5">Handcrafted jewellery made with love, celebrating the artistry of Indian tradition.</p>
            <div className="flex gap-3">
              {settings?.instagram_url && <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"><Instagram className="w-4 h-4" /></a>}
              {settings?.facebook_url && <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"><Facebook className="w-4 h-4" /></a>}
              {settings?.youtube_url && <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"><Youtube className="w-4 h-4" /></a>}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-white mb-4 uppercase tracking-wider text-xs">Shop</h4>
            <ul className="space-y-2 text-sm">
              {[['All Jewellery', '/shop'], ['Bangles', '/category/bangles'], ['Bridal', '/category/bridal'], ['Custom Jewelry', '/category/custom-jewelry'], ['Festive', '/category/festive']].map(([label, href]) => (
                <li key={href}><Link to={href} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-semibold text-white mb-4 uppercase tracking-wider text-xs">Help</h4>
            <ul className="space-y-2 text-sm">
              {[['Contact Us', '/contact'], ['FAQ', '/faq'], ['Track Order', '/track-order'], ['Shipping Policy', '/shipping-policy'], ['Return Policy', '/return-policy']].map(([label, href]) => (
                <li key={href}><Link to={href} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-white mb-4 uppercase tracking-wider text-xs">Stay Connected</h4>
            <p className="text-sm mb-4">Get new arrivals, offers & crafting stories straight to your inbox.</p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email"
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/50 outline-none focus:border-gold"
              />
              <button type="submit" disabled={subscribing} className="bg-gold hover:bg-gold-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                {subscribing ? '…' : 'Join'}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Meena Rajwada. All rights reserved.</p>
          <div className="flex gap-4">
            {[['Privacy', '/privacy-policy'], ['Terms', '/terms-conditions'], ['Returns', '/return-policy']].map(([label, href]) => (
              <Link key={href} to={href} className="hover:text-white/80 transition-colors">{label}</Link>
            ))}
          </div>
          <p className="flex items-center gap-1">Made with <Heart className="w-3 h-3 fill-current text-red-400" /> in India</p>
        </div>
      </div>
    </footer>
  )
}
