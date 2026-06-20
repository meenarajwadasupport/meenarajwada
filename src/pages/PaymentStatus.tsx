import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import SEOHead from '@/components/common/SEOHead'

export default function PaymentStatus() {
  const [params] = useSearchParams()
  const orderId = params.get('order_id')
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')

  useEffect(() => {
    if (!orderId) { setStatus('failed'); return }
    fetch(`/api/verify-payment?order_id=${orderId}`)
      .then(r => r.json())
      .then(d => setStatus(d.success ? 'success' : 'failed'))
      .catch(() => setStatus('failed'))
  }, [orderId])

  return (
    <>
      <SEOHead title="Payment Status" />
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-4 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-muted-foreground">Verifying your payment…</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-500" />
            <h1 className="font-serif text-3xl font-bold">Payment Successful!</h1>
            <p className="text-muted-foreground max-w-sm">Thank you for your order. We'll start crafting your jewellery and dispatch it soon!</p>
            <div className="flex gap-3 mt-4">
              <Link to={`/order-confirmation?order_id=${orderId}`} className="btn-primary px-8 py-3">View Order</Link>
              <Link to="/shop" className="btn-outline px-8 py-3">Continue Shopping</Link>
            </div>
          </>
        )}
        {status === 'failed' && (
          <>
            <XCircle className="w-16 h-16 text-red-500" />
            <h1 className="font-serif text-3xl font-bold">Payment Failed</h1>
            <p className="text-muted-foreground max-w-sm">Something went wrong with your payment. Please try again or contact support.</p>
            <div className="flex gap-3 mt-4">
              <Link to="/checkout" className="btn-primary px-8 py-3">Try Again</Link>
              <Link to="/contact" className="btn-outline px-8 py-3">Contact Support</Link>
            </div>
          </>
        )}
      </div>
    </>
  )
}
