import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useOrders } from '@/hooks/useOrders'
import { formatPrice } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { User, Package, LogOut } from 'lucide-react'
import SEOHead from '@/components/common/SEOHead'

export default function Account() {
  const { user, profile, signOut } = useAuth()
  const { data: orders = [] } = useOrders()
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile')

  return (
    <>
      <SEOHead title="My Account" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-3xl font-bold">My Account</h1>
          <button onClick={signOut} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-red-500 transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        <div className="flex gap-1 mb-6 bg-background rounded-xl p-1 w-fit">
          {(['profile', 'orders'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-white shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              {tab === 'profile' ? 'Profile' : 'Orders'}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-lg">{profile?.full_name ?? user?.user_metadata?.full_name ?? 'Customer'}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-background rounded-xl p-4">
                <p className="text-muted-foreground text-xs">Total Orders</p>
                <p className="text-2xl font-bold mt-1">{orders.length}</p>
              </div>
              <div className="bg-background rounded-xl p-4">
                <p className="text-muted-foreground text-xs">Total Spent</p>
                <p className="text-2xl font-bold mt-1">{formatPrice(orders.reduce((s, o) => s + o.total_amount, 0))}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No orders yet.</p>
                <Link to="/shop" className="btn-primary px-6 py-2 mt-4 inline-block">Shop Now</Link>
              </div>
            ) : orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl border border-border p-4 flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm font-semibold">{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 capitalize">{order.status}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{formatPrice(order.total_amount)}</p>
                  <Link to={`/order-confirmation?order_id=${order.id}`} className="text-xs text-primary hover:underline">View →</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
