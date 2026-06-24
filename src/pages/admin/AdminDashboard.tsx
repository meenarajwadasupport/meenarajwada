import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import {
  ShoppingBag, Users, Package, TrendingUp, Clock,
  AlertTriangle, CheckCircle, XCircle, ChevronRight, Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'

// IST date helpers
function toIST(d: Date) {
  return new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
}
function todayIST() {
  const d = toIST(new Date())
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function last7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = toIST(new Date())
    d.setDate(d.getDate() - (6 - i))
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })
}
function dayLabel(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { weekday: 'short' })
}

const STATUS_COLOR: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  dispatched: 'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
}

export default function AdminDashboard() {
  const today = todayIST()
  const days  = last7Days()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const [ordersRes, profilesRes, productsRes, customRes, messagesRes] = await Promise.all([
        supabase.from('orders').select('id,total_amount,status,payment_status,customer_name,customer_email,created_at').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id,name,stock,price,images,is_active'),
        supabase.from('custom_order_requests').select('id,status,created_at', { count: 'exact' }),
        supabase.from('contact_messages').select('id,is_read', { count: 'exact' }),
      ])

      const orders      = ordersRes.data ?? []
      const products    = productsRes.data ?? []
      const customOrders = customRes.data ?? []
      const messages    = messagesRes.data ?? []

      const todayOrders    = orders.filter(o => o.created_at?.startsWith(today))
      const todayRevenue   = todayOrders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + (o.total_amount ?? 0), 0)
      const totalRevenue   = orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + (o.total_amount ?? 0), 0)
      const pendingOrders  = orders.filter(o => o.status === 'pending').length
      const lowStock       = products.filter(p => p.is_active && p.stock <= 5)
      const unreadMessages = messages.filter(m => !m.is_read).length
      const newCustom      = customOrders.filter(c => c.status === 'new').length

      // Revenue per day (last 7 days)
      const revenueByDay = days.map(day => ({
        day,
        label: dayLabel(day),
        amount: orders
          .filter(o => o.created_at?.startsWith(day) && o.payment_status === 'paid')
          .reduce((s, o) => s + (o.total_amount ?? 0), 0),
        count: orders.filter(o => o.created_at?.startsWith(day)).length,
      }))

      // Status breakdown
      const statusBreakdown = ['pending', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled'].map(s => ({
        status: s,
        count: orders.filter(o => o.status === s).length,
      }))

      return {
        totalRevenue,
        todayRevenue,
        totalOrders: orders.length,
        todayOrderCount: todayOrders.length,
        totalCustomers: profilesRes.count ?? 0,
        totalProducts: products.length,
        pendingOrders,
        lowStock,
        unreadMessages,
        newCustom,
        recentOrders: orders.slice(0, 8),
        revenueByDay,
        statusBreakdown,
      }
    },
    refetchInterval: 60_000, // auto-refresh every 60s
  })

  const maxBar = Math.max(...(stats?.revenueByDay.map(d => d.amount) ?? [1]))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' })}
          </p>
        </div>
        <div className="flex gap-2">
          {(stats?.unreadMessages ?? 0) > 0 && (
            <Link to="/admin/messages" className="flex items-center gap-1.5 bg-red-50 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-red-200 hover:bg-red-100 transition-colors">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {stats?.unreadMessages} unread
            </Link>
          )}
          {(stats?.newCustom ?? 0) > 0 && (
            <Link to="/admin/custom-orders" className="flex items-center gap-1.5 bg-amber-50 text-amber-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-amber-200 hover:bg-amber-100 transition-colors">
              <Sparkles className="w-3 h-3" />
              {stats?.newCustom} custom requests
            </Link>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Revenue",  value: formatPrice(stats?.todayRevenue ?? 0),    icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600', sub: `${stats?.todayOrderCount ?? 0} orders today` },
          { label: 'Total Revenue',    value: formatPrice(stats?.totalRevenue ?? 0),     icon: TrendingUp, color: 'bg-green-50 text-green-700',    sub: 'All time (paid)' },
          { label: 'Total Orders',     value: stats?.totalOrders ?? 0,                   icon: ShoppingBag, color: 'bg-blue-50 text-blue-600',    sub: `${stats?.pendingOrders ?? 0} pending` },
          { label: 'Customers',        value: stats?.totalCustomers ?? 0,                icon: Users, color: 'bg-purple-50 text-purple-600',       sub: 'Registered users' },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-white rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs font-medium text-muted-foreground mt-0.5">{label}</p>
            <p className="text-[10px] text-muted-foreground/70 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart + Status Breakdown */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Revenue Bar Chart (last 7 days) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-sm">Revenue — Last 7 Days</h2>
            <span className="text-xs text-muted-foreground">Paid orders only</span>
          </div>
          <div className="flex items-end gap-2 h-36">
            {(stats?.revenueByDay ?? []).map(({ label, amount, count }) => (
              <div key={label} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="relative w-full flex flex-col items-center">
                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground text-white text-[10px] rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {formatPrice(amount)}<br />{count} orders
                  </div>
                  {/* Bar */}
                  <div
                    className="w-full rounded-t-lg transition-all duration-500"
                    style={{
                      height: `${maxBar > 0 ? Math.max(4, (amount / maxBar) * 128) : 4}px`,
                      background: amount > 0
                        ? 'linear-gradient(to top, hsl(345,80%,30%), hsl(345,80%,50%))'
                        : 'hsl(0,0%,92%)',
                    }}
                  />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="font-semibold text-sm mb-4">Orders by Status</h2>
          <div className="space-y-2.5">
            {(stats?.statusBreakdown ?? []).map(({ status, count }) => (
              <div key={status} className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize w-24 text-center ${STATUS_COLOR[status]}`}>{status}</span>
                <div className="flex-1 bg-background rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-primary/60"
                    style={{ width: `${stats?.totalOrders ? (count / stats.totalOrders) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-foreground w-5 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders + Alerts */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-sm">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-primary hover:underline flex items-center gap-0.5">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background/50">
                <tr>
                  {['Order', 'Customer', 'Amount', 'Status', 'Payment'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(stats?.recentOrders ?? []).map((order: any) => (
                  <tr key={order.id} className="hover:bg-background/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold">{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-xs leading-tight">{order.customer_name}</p>
                      <p className="text-[10px] text-muted-foreground">{order.customer_email}</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-primary text-xs">{formatPrice(order.total_amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_COLOR[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {order.payment_status === 'paid'
                        ? <CheckCircle className="w-4 h-4 text-green-500" />
                        : order.payment_status === 'failed'
                        ? <XCircle className="w-4 h-4 text-red-500" />
                        : <Clock className="w-4 h-4 text-yellow-500" />}
                    </td>
                  </tr>
                ))}
                {!stats?.recentOrders?.length && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts + Quick Actions */}
        <div className="space-y-4">

          {/* Low Stock Alerts */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="font-semibold text-sm">Low Stock</h2>
              <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                {stats?.lowStock?.length ?? 0}
              </span>
            </div>
            <div className="divide-y divide-border max-h-48 overflow-y-auto">
              {(stats?.lowStock ?? []).length === 0 && (
                <p className="px-4 py-4 text-xs text-muted-foreground">All products well-stocked ✓</p>
              )}
              {(stats?.lowStock ?? []).slice(0, 6).map((p: any) => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                  {p.images?.[0] && <img src={p.images[0]} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{p.name}</p>
                    <p className={`text-[10px] font-bold ${p.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                      {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-border p-4">
            <h2 className="font-semibold text-sm mb-3">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { to: '/admin/products', label: '+ Add Product',       color: 'bg-primary text-white hover:bg-primary/90' },
                { to: '/admin/orders',   label: 'View Pending Orders',  color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200' },
                { to: '/admin/hero-slider', label: 'Edit Hero Banner',  color: 'bg-background hover:bg-background/80 border border-border' },
                { to: '/admin/site-settings', label: 'Site Settings',  color: 'bg-background hover:bg-background/80 border border-border' },
              ].map(({ to, label, color }) => (
                <Link key={to} to={to}
                  className={`block w-full text-center text-xs font-semibold py-2 rounded-lg transition-colors ${color}`}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
