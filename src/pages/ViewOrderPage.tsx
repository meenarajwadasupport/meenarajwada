import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useOrder } from '@/hooks/useOrders'
import { formatPrice } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import SEOHead from '@/components/common/SEOHead'
import { Package, ChevronLeft, Truck, MapPin, RotateCcw, Loader2, CheckCircle, Clock, XCircle } from 'lucide-react'

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'dispatched', 'delivered']

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  dispatched: 'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
}

function ReturnRequestForm({ orderNumber, customerName, customerEmail }: { orderNumber: string; customerName: string; customerEmail: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function submit() {
    if (!reason) { toast.error('Please select a reason'); return }
    setSubmitting(true)
    const { error } = await supabase.from('return_requests').insert({
      order_number: orderNumber,
      customer_name: customerName,
      customer_email: customerEmail,
      reason,
      description,
    })
    setSubmitting(false)
    if (error) { toast.error('Could not submit. Please try again.'); return }
    setSubmitted(true)
    toast.success("Return request submitted! We'll contact you within 24 hours.")
  }

  if (submitted) return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-3">
      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
      <p className="text-sm text-green-700 font-medium">Return request submitted. We'll contact you within 24 hours.</p>
    </div>
  )

  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-foreground hover:bg-muted/30 transition-colors"
      >
        <span className="flex items-center gap-2"><RotateCcw className="w-4 h-4 text-primary" /> Request Return / Exchange</span>
        <span className="text-muted-foreground text-lg">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-border">
          <div className="mt-4">
            <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground block mb-1.5">Reason *</label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary bg-white"
            >
              <option value="">Select a reason</option>
              <option value="damaged">Damaged / Defective item</option>
              <option value="wrong_item">Wrong item received</option>
              <option value="size_issue">Size / fit issue</option>
              <option value="not_as_described">Not as described</option>
              <option value="changed_mind">Changed my mind</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground block mb-1.5">Additional details <span className="text-muted-foreground/60 normal-case font-normal">(optional)</span></label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the issue..."
              className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary bg-white resize-none"
            />
          </div>
          <button
            onClick={submit}
            disabled={submitting}
            className="btn-primary w-full py-3 text-[12px] tracking-[0.15em] flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : 'Submit Return Request'}
          </button>
          <p className="text-[11px] text-muted-foreground text-center">We'll review your request and contact you within 24 hours.</p>
        </div>
      )}
    </div>
  )
}

export default function ViewOrderPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { user, profile } = useAuth()
  const { data: order, isLoading } = useOrder(orderId ?? '')

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!order) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
      <p className="text-muted-foreground mb-6">Order not found.</p>
      <Link to="/my-orders" className="btn-primary px-8 py-3">Back to Orders</Link>
    </div>
  )

  const stepIndex = STATUS_STEPS.indexOf(order.status)
  const isCancelled = order.status === 'cancelled'
  const addr = order.shipping_address as any

  return (
    <>
      <SEOHead title={`Order ${order.order_number ?? order.id.slice(0, 8).toUpperCase()}`} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {/* Back */}
        <Link to="/my-orders" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to My Orders
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold">Order Details</h1>
            <p className="text-sm text-muted-foreground mt-1">#{order.order_number ?? order.id.slice(0, 8).toUpperCase()}</p>
            <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize flex-shrink-0 ${STATUS_COLORS[order.status] ?? 'bg-muted text-foreground'}`}>
            {order.status}
          </span>
        </div>

        {/* Progress tracker */}
        {!isCancelled && (
          <div className="bg-white border border-border rounded-2xl p-5 mb-5">
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-4">Order Progress</p>
            <div className="flex items-center gap-0">
              {STATUS_STEPS.map((step, i) => {
                const done = stepIndex >= i
                const current = stepIndex === i
                return (
                  <div key={step} className="flex-1 flex items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold transition-colors ${
                      done ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                    } ${current ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                      {done ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 ${stepIndex > i ? 'bg-primary' : 'bg-muted'}`} />
                    )}
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-2">
              {STATUS_STEPS.map(step => (
                <span key={step} className="text-[9px] text-muted-foreground capitalize flex-1 text-center first:text-left last:text-right">{step}</span>
              ))}
            </div>
          </div>
        )}

        {/* Tracking */}
        {order.tracking_id && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
            <Truck className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-indigo-800">Your order is on its way!</p>
              <p className="text-[12px] text-indigo-600 mt-0.5">
                Tracking ID: <span className="font-mono font-bold">{order.tracking_id}</span>
                {order.courier && <> · {order.courier}</>}
              </p>
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-white border border-border rounded-2xl p-5 mb-5">
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-4">Items Ordered</p>
          <div className="space-y-4">
            {(order as any).order_items?.map((item: any, i: number) => {
              const img = item.products?.images?.[0]
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                    {img ? (
                      <img src={img} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{item.product_name}</p>
                    {item.size && <p className="text-xs text-muted-foreground">Size: {item.size}</p>}
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-primary flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
                </div>
              )
            })}
          </div>

          <div className="border-t border-border mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal ?? order.total_amount)}</span>
            </div>
            {order.shipping_amount !== undefined && order.shipping_amount > 0 && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Shipping</span>
                <span>{formatPrice(order.shipping_amount)}</span>
              </div>
            )}
            {order.shipping_amount === 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Shipping</span>
                <span>Free</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-primary">{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        {addr && (
          <div className="bg-white border border-border rounded-2xl p-5 mb-5">
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-3 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Delivery Address</p>
            <p className="text-sm font-semibold">{addr.full_name ?? order.customer_name}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}</p>
            <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.pincode}</p>
            {addr.phone && <p className="text-sm text-muted-foreground mt-0.5">{addr.phone}</p>}
          </div>
        )}

        {/* Return request — only for delivered orders */}
        {order.status === 'delivered' && (
          <ReturnRequestForm
            orderNumber={order.order_number ?? order.id}
            customerName={order.customer_name}
            customerEmail={order.customer_email}
          />
        )}

        {/* Cancelled notice */}
        {isCancelled && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">This order was cancelled. If you were charged, you'll receive a refund within 5–7 business days.</p>
          </div>
        )}
      </div>
    </>
  )
}
