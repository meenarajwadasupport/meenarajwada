import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { Package, Search } from 'lucide-react'
import SEOHead from '@/components/common/SEOHead'

const STEPS = ['pending', 'confirmed', 'processing', 'dispatched', 'delivered']

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('')
  const [phone, setPhone] = useState('')
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setOrder(null); setLoading(true)
    const search = orderId.trim().toUpperCase()
    const { data, error: err } = await supabase
      .from('orders').select('*').ilike('id', `${search}%`).eq('customer_phone', phone.trim()).maybeSingle()
    setLoading(false)
    if (err || !data) { setError('Order not found. Check your Order ID and phone number.'); return }
    setOrder(data)
  }

  const currentStep = STEPS.indexOf(order?.status ?? 'pending')

  return (
    <>
      <SEOHead title="Track Your Order" />
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-8">
          <p className="section-label">Shipping</p>
          <h1 className="section-title">Track Your Order</h1>
          <div className="divider" />
        </div>

        <form onSubmit={handleTrack} className="bg-white rounded-2xl border border-border p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Order ID (first 8 characters)</label>
            <input value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="e.g. A1B2C3D4" className="w-full mt-1 border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary" required />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mobile Number</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="10-digit mobile" className="w-full mt-1 border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary" maxLength={10} required />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            <Search className="w-4 h-4" /> {loading ? 'Tracking…' : 'Track Order'}
          </button>
        </form>

        {order && (
          <div className="mt-6 bg-white rounded-2xl border border-border p-6">
            <div className="flex justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground">Order ID</p>
                <p className="font-mono font-semibold">{order.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <p className="font-bold text-primary">{formatPrice(order.total_amount)}</p>
            </div>
            {/* Progress */}
            <div className="relative mt-4">
              <div className="flex justify-between mb-2">
                {STEPS.map((step, i) => (
                  <div key={step} className="flex flex-col items-center gap-1 text-center flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i <= currentStep ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                      {i < currentStep ? '✓' : i + 1}
                    </div>
                    <span className={`text-[10px] capitalize leading-tight ${i <= currentStep ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{step}</span>
                  </div>
                ))}
              </div>
              {order.tracking_id && (
                <div className="mt-4 p-3 bg-background rounded-lg">
                  <p className="text-xs text-muted-foreground">Tracking ID</p>
                  <p className="font-mono text-sm font-medium">{order.tracking_id}</p>
                  {order.courier && <p className="text-xs text-muted-foreground mt-0.5">via {order.courier}</p>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
