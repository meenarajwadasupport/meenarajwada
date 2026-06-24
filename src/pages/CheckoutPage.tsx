import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { formatPrice, calcShipping } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { loadCashfreeSDK, startCashfreePayment } from '@/lib/cashfree'
import SEOHead from '@/components/common/SEOHead'
import { toast } from 'sonner'
import { MapPin } from 'lucide-react'

const schema = z.object({
  full_name: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number'),
  address: z.string().min(10, 'Enter your full address'),
  city: z.string().min(2, 'Enter city'),
  state: z.string().min(2, 'Enter state'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit PIN'),
})
type FormData = z.infer<typeof schema>

interface SavedAddress {
  id: string
  full_name: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  is_default: boolean
}

// Generate sequential order number: MR-10001
async function generateOrderNumber(): Promise<string> {
  const { data } = await supabase
    .from('orders')
    .select('order_number')
    .not('order_number', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
  const last = data?.[0]?.order_number
  if (last && last.startsWith('MR-')) {
    const num = parseInt(last.replace('MR-', ''), 10)
    return `MR-${num + 1}`
  }
  return 'MR-10001'
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null)
  const shipping = calcShipping(subtotal)
  const total = subtotal + shipping

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: user?.email ?? '' },
  })

  // Load saved addresses for logged-in users
  useEffect(() => {
    if (!user) return
    supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .then(({ data }) => {
        if (data?.length) {
          setSavedAddresses(data)
          const def = data.find(a => a.is_default) ?? data[0]
          setSelectedAddress(def.id)
          reset({
            email: user.email ?? '',
            full_name: def.full_name,
            phone: def.phone,
            address: def.address,
            city: def.city,
            state: def.state,
            pincode: def.pincode,
          })
        }
      })
  }, [user])

  function applyAddress(addr: SavedAddress) {
    setSelectedAddress(addr.id)
    reset({
      email: user?.email ?? '',
      full_name: addr.full_name,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    })
  }

  if (!items.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Link to="/shop" className="btn-primary px-8 py-3">Browse Jewellery</Link>
      </div>
    )
  }

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      await loadCashfreeSDK()

      const orderNumber = await generateOrderNumber()

      // Create order in DB
      const { data: order, error: orderErr } = await supabase.from('orders').insert({
        order_number: orderNumber,
        user_id: user?.id ?? null,
        customer_name: data.full_name,
        customer_email: data.email,
        customer_phone: data.phone,
        shipping_address: { address: data.address, city: data.city, state: data.state, pincode: data.pincode },
        subtotal,
        shipping_amount: shipping,
        total_amount: total,
        status: 'pending',
        payment_status: 'pending',
        email_sent: false,
      }).select('id').single()
      if (orderErr || !order) throw new Error('Could not create order')

      // Insert order items
      await supabase.from('order_items').insert(
        items.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          product_name: item.product?.name,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          image_url: item.product?.images?.[0],
        }))
      )

      // Get Cashfree payment session
      const res = await fetch('/api/create-cashfree-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderNumber,
          orderAmount: total,
          customerId: user?.id ?? `guest_${data.email.replace(/[^a-z0-9]/gi, '_')}`,
          customerName: data.full_name,
          customerEmail: data.email,
          customerPhone: data.phone,
        }),
      })
      const json = await res.json()
      if (!json.payment_session_id) throw new Error('Payment session failed')

      // ✅ Only clear cart AFTER we have confirmed session — before redirect
      clearCart()
      await startCashfreePayment(
        json.payment_session_id,
        `${window.location.origin}/payment-status?order_id=${order.id}`
      )
    } catch (err: any) {
      toast.error(err.message ?? 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const inputCls = 'w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors bg-white'
  const errCls = 'text-xs text-red-500 mt-1'

  return (
    <>
      <SEOHead title="Checkout – Meena Rajwada" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-serif text-3xl font-bold mb-8">Checkout</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Shipping Form */}
          <div className="lg:col-span-2 space-y-5">

            {/* Saved addresses (logged-in users) */}
            {savedAddresses.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-border">
                <h2 className="font-semibold text-base mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> Saved Addresses
                </h2>
                <div className="space-y-2">
                  {savedAddresses.map(addr => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => applyAddress(addr)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors text-sm ${
                        selectedAddress === addr.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <p className="font-medium">{addr.full_name} · {addr.phone}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        {addr.address}, {addr.city}, {addr.state} – {addr.pincode}
                      </p>
                      {addr.is_default && <span className="text-[10px] text-primary font-semibold mt-1 inline-block">Default</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-6 border border-border">
              <h2 className="font-semibold text-lg mb-4">
                {savedAddresses.length > 0 ? 'Edit / Enter New Address' : 'Shipping Details'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Full Name</label>
                  <input {...register('full_name')} className={`${inputCls} mt-1`} placeholder="Meena Sharma" />
                  {errors.full_name && <p className={errCls}>{errors.full_name.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</label>
                  <input {...register('email')} type="email" className={`${inputCls} mt-1`} placeholder="you@email.com" />
                  {errors.email && <p className={errCls}>{errors.email.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mobile (10 digits)</label>
                  <input {...register('phone')} type="tel" className={`${inputCls} mt-1`} placeholder="9876543210" maxLength={10} />
                  {errors.phone && <p className={errCls}>{errors.phone.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">PIN Code</label>
                  <input {...register('pincode')} className={`${inputCls} mt-1`} placeholder="400001" maxLength={6} />
                  {errors.pincode && <p className={errCls}>{errors.pincode.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Address</label>
                  <textarea {...register('address')} rows={3} className={`${inputCls} mt-1 resize-none`} placeholder="House No., Street, Landmark" />
                  {errors.address && <p className={errCls}>{errors.address.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">City</label>
                  <input {...register('city')} className={`${inputCls} mt-1`} placeholder="Mumbai" />
                  {errors.city && <p className={errCls}>{errors.city.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">State</label>
                  <input {...register('state')} className={`${inputCls} mt-1`} placeholder="Maharashtra" />
                  {errors.state && <p className={errCls}>{errors.state.message}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-border">
              <h2 className="font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3 max-h-52 overflow-y-auto">
                {items.map(item => (
                  <div key={`${item.product_id}-${item.size}`} className="flex gap-3">
                    <img
                      src={item.product?.images?.[0]}
                      alt=""
                      className="w-12 h-12 object-cover rounded-lg bg-muted flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{item.product?.name}</p>
                      <p className="text-[10px] text-muted-foreground">Size: {item.size} × {item.quantity}</p>
                    </div>
                    <span className="text-xs font-semibold">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-[11px] text-muted-foreground">
                    Add {formatPrice(999 - subtotal)} more for free shipping
                  </p>
                )}
                <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base disabled:opacity-60"
            >
              {loading ? 'Processing…' : `Pay ${formatPrice(total)}`}
            </button>
            <p className="text-xs text-center text-muted-foreground">🔒 Secured by Cashfree Payments</p>
            {!user && (
              <p className="text-xs text-center text-muted-foreground">
                <Link to="/auth" className="text-primary underline">Sign in</Link> to use saved addresses
              </p>
            )}
          </div>
        </form>
      </div>
    </>
  )
}
