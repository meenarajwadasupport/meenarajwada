import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { Package, Search, CheckCircle, Truck, Sparkles, MapPin } from 'lucide-react'
import SEOHead from '@/components/common/SEOHead'

const STEPS = [
  { key: 'pending',    label: 'Order Placed',   icon: Package },
  { key: 'confirmed',  label: 'Confirmed',       icon: CheckCircle },
  { key: 'processing', label: 'Crafting',        icon: Sparkles },
  { key: 'dispatched', label: 'Dispatched',      icon: Truck },
  { key: 'delivered',  label: 'Delivered',       icon: MapPin },
]

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
      .from('orders')
      .select('*')
      .ilike('id', `${search}%`)
      .eq('customer_phone', phone.trim())
      .maybeSingle()
    setLoading(false)
    if (err || !data) { setError('Order not found. Please check your Order ID and phone number.'); return }
    setOrder(data)
  }

  const currentStep = STEPS.findIndex(s => s.key === (order?.status ?? 'pending'))

  const inputCls = 'w-full border border-[#e8ddd8] rounded-xl px-4 py-3.5 text-sm outline-none focus:border-[#7D1935] focus:ring-2 focus:ring-[#7D1935]/10 bg-white transition-all duration-200 placeholder:text-[#c4b4ae]'
  const labelCls = 'block text-[10px] font-bold tracking-[0.18em] uppercase text-[#9a8880] mb-1.5'

  return (
    <>
      <SEOHead title="Track Your Order — Meena Rajwada" />

      {/* ── Header ── */}
      <div className="bg-[#FAF7F5] border-b border-[#ece3dc]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-14 pb-12 sm:pt-20 sm:pb-16">
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#7D1935]/70 mb-3">After Your Order</p>
          <h1 className="font-serif text-[38px] sm:text-[54px] font-bold text-[#1a0a08] leading-[1.1]">Track Your Order</h1>
          <div className="flex items-center gap-3 mt-4">
            <span className="w-12 h-px bg-[#7D1935]/30" />
            <span className="text-[#7D1935]/50 text-sm">✦</span>
            <span className="w-12 h-px bg-[#7D1935]/30" />
          </div>
          <p className="text-[14px] text-[#6b5a55] mt-4 max-w-md leading-relaxed">
            Enter your Order ID (from your confirmation email) and the mobile number used at checkout.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-14 sm:py-20 space-y-8">

        {/* ── Search form ── */}
        <form onSubmit={handleTrack} className="bg-white border border-[#ece3dc] rounded-3xl p-7 sm:p-9 shadow-[0_8px_48px_-16px_rgba(125,25,53,0.08)]">
          <h2 className="font-serif text-[22px] font-bold text-[#1a0a08] mb-1">Find Your Order</h2>
          <p className="text-[13px] text-[#9a8880] mb-7">Enter the details from your confirmation email.</p>

          <div className="space-y-5">
            <div>
              <label className={labelCls}>Order ID</label>
              <input
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                placeholder="e.g. MR-10001"
                className={inputCls}
                required
              />
              <p className="text-[11px] text-[#b8a8a2] mt-1.5">
                Find your Order ID in the confirmation email subject line.
              </p>
            </div>
            <div>
              <label className={labelCls}>Mobile Number</label>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className={inputCls}
                maxLength={10}
                required
              />
            </div>
          </div>

          {error && (
            <div className="mt-5 bg-red-50 border border-red-200/70 rounded-xl px-4 py-3 text-[13px] text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-7 w-full flex items-center justify-center gap-2.5 bg-[#7D1935] hover:bg-[#9a1f40] disabled:opacity-60 text-white py-4 rounded-xl text-[12px] font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-lg shadow-[#7D1935]/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Tracking…' : 'Track Order'}
          </button>
        </form>

        {/* ── Result ── */}
        {order && (
          <div className="bg-white border border-[#ece3dc] rounded-3xl overflow-hidden shadow-[0_8px_48px_-16px_rgba(125,25,53,0.08)]">

            {/* Result header */}
            <div className="bg-[#7D1935] text-white px-7 py-6">
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/60 mb-1">Order Found</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="font-mono text-[24px] font-bold text-white leading-none">
                    {order.order_number ?? order.id?.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-[13px] text-white/60 mt-1">
                    {order.customer_name}
                  </p>
                </div>
                <p className="font-bold text-[20px] text-white">{formatPrice(order.total_amount)}</p>
              </div>
            </div>

            <div className="p-7">
              {/* Progress tracker */}
              <h3 className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#9a8880] mb-6">Order Status</h3>

              <div className="relative">
                {/* Connecting line */}
                <div className="absolute top-5 left-5 right-5 h-px bg-[#ece3dc] z-0" />
                <div
                  className="absolute top-5 left-5 h-px bg-[#7D1935] z-0 transition-all duration-700"
                  style={{ width: `${currentStep > 0 ? (currentStep / (STEPS.length - 1)) * 100 : 0}%` }}
                />

                <div className="relative z-10 flex justify-between">
                  {STEPS.map(({ key, label, icon: Icon }, i) => {
                    const done = i < currentStep
                    const active = i === currentStep
                    return (
                      <div key={key} className="flex flex-col items-center gap-2 text-center flex-1">
                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          done
                            ? 'bg-[#7D1935] border-[#7D1935] shadow-md shadow-[#7D1935]/25'
                            : active
                            ? 'bg-white border-[#7D1935] shadow-md shadow-[#7D1935]/15'
                            : 'bg-white border-[#e8ddd8]'
                        }`}>
                          <Icon className={`w-4 h-4 transition-colors ${
                            done ? 'text-white' : active ? 'text-[#7D1935]' : 'text-[#c4b4ae]'
                          }`} strokeWidth={2} />
                        </div>
                        <span className={`text-[10px] font-semibold leading-tight transition-colors ${
                          done || active ? 'text-[#7D1935]' : 'text-[#c4b4ae]'
                        }`}>
                          {label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Tracking ID if dispatched */}
              {order.tracking_id && (
                <div className="mt-8 bg-[#FAF7F5] border border-[#ece3dc] rounded-xl p-5">
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#9a8880] mb-2">Tracking Details</p>
                  <p className="font-mono text-[15px] font-semibold text-[#1a0a08]">{order.tracking_id}</p>
                  {order.courier && (
                    <p className="text-[12px] text-[#9a8880] mt-1">via <span className="font-semibold text-[#6b5a55]">{order.courier}</span></p>
                  )}
                </div>
              )}

              {/* Help note */}
              <div className="mt-6 pt-6 border-t border-[#ece3dc] text-center">
                <p className="text-[12.5px] text-[#9a8880]">
                  Questions about your order?{' '}
                  <a href="https://wa.me/916304424767" className="text-[#7D1935] font-semibold hover:underline" target="_blank" rel="noopener noreferrer">WhatsApp us</a>
                  {' '}or email{' '}
                  <a href="mailto:support@meenarajwada.com" className="text-[#7D1935] font-semibold hover:underline">support@meenarajwada.com</a>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
