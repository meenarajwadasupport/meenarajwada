import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag, Users, Package, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [ordersRes, customersRes, productsRes] = await Promise.all([
        supabase.from('orders').select('id,total_amount,status,created_at'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
      ])
      const orders = ordersRes.data ?? []
      const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total_amount, 0)
      return {
        totalOrders: orders.length,
        totalRevenue,
        totalCustomers: customersRes.count ?? 0,
        totalProducts: productsRes.count ?? 0,
        recentOrders: orders.slice(0, 5),
      }
    },
  })

  const statCards = [
    { label: 'Total Revenue', value: formatPrice(stats?.totalRevenue ?? 0), icon: TrendingUp, color: 'bg-green-50 text-green-600' },
    { label: 'Total Orders', value: stats?.totalOrders ?? 0, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
    { label: 'Customers', value: stats?.totalCustomers ?? 0, icon: Users, color: 'bg-purple-50 text-purple-600' },
    { label: 'Products', value: stats?.totalProducts ?? 0, icon: Package, color: 'bg-amber-50 text-amber-600' },
  ]

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-border p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border p-5">
        <h2 className="font-semibold mb-4">Recent Orders</h2>
        <div className="space-y-3">
          {(stats?.recentOrders ?? []).map((order: any) => (
            <div key={order.id} className="flex justify-between text-sm py-2 border-b border-border last:border-0">
              <span className="font-mono">{order.id.slice(0, 8).toUpperCase()}</span>
              <span className="capitalize text-muted-foreground">{order.status}</span>
              <span className="font-semibold text-primary">{formatPrice(order.total_amount)}</span>
            </div>
          ))}
          {!stats?.recentOrders?.length && <p className="text-sm text-muted-foreground">No orders yet.</p>}
        </div>
      </div>
    </div>
  )
}
