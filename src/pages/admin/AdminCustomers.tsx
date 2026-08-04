import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { Users, Search, Mail, Phone, ShoppingBag, TrendingUp, Loader2, UserCheck } from 'lucide-react'

export default function AdminCustomers() {
  const [search, setSearch] = useState('')

  // Fetch all profiles
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      // Use RPC to bypass RLS — only works for admin users
      const { data: profiles, error } = await supabase.rpc('get_all_profiles')

      // Fallback: if RPC not created yet, fall back to own profile only
      const profileList = error
        ? ((await supabase.from('profiles').select('*').order('created_at', { ascending: false })).data ?? [])
        : (profiles ?? [])

      if (!profileList?.length) return []

      // Fetch orders to calculate per-customer stats
      const { data: orders } = await supabase
        .from('orders')
        .select('id, customer_email, total_amount, payment_status, status, created_at')

      return profileList.map((p: any) => {
        const customerOrders = (orders ?? []).filter(
          (o: any) => o.customer_email === p.email
        )
        const totalSpent = customerOrders
          .filter((o: any) => o.payment_status === 'paid')
          .reduce((s: number, o: any) => s + (o.total_amount ?? 0), 0)
        const lastOrder = customerOrders[0]?.created_at ?? null

        return {
          ...p,
          orderCount: customerOrders.length,
          totalSpent,
          lastOrderAt: lastOrder,
        }
      })
    },
    refetchInterval: 60_000,
  })

  const filtered = customers.filter((c: any) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      c.full_name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q)
    )
  })

  const totalRevenue = customers.reduce((s: number, c: any) => s + c.totalSpent, 0)
  const activeCustomers = customers.filter((c: any) => c.orderCount > 0).length

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">Customers</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {customers.length} registered user{customers.length === 1 ? '' : 's'} · {activeCustomers} have placed orders
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-border p-4">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
            <Users className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold">{customers.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total Registered</p>
        </div>
        <div className="bg-white rounded-2xl border border-border p-4">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
            <UserCheck className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold">{activeCustomers}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Ordered at Least Once</p>
        </div>
        <div className="bg-white rounded-2xl border border-border p-4 col-span-2 sm:col-span-1">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold">{formatPrice(totalRevenue)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total Revenue from Customers</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search name, email, phone…"
          className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 bg-white transition-colors"
        />
      </div>

      {/* Customer list */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-border flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading customers…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-border flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Users className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-serif text-lg font-semibold">
            {search ? 'No customers match your search' : 'No customers yet'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            {search
              ? `Nothing matches "${search}". Try a different name or email.`
              : 'Customers who register on the website will appear here.'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block bg-white rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-background/50 border-b border-border">
                <tr>
                  {['Customer', 'Contact', 'Orders', 'Total Spent', 'Joined', 'Role'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c: any) => (
                  <tr key={c.id} className="hover:bg-background/40 transition-colors">
                    {/* Avatar + name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-serif font-bold text-sm flex-shrink-0">
                          {(c.full_name ?? c.email ?? '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-xs leading-tight">{c.full_name ?? '—'}</p>
                          {c.is_admin && (
                            <span className="text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">Admin</span>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Contact */}
                    <td className="px-4 py-3">
                      {c.email && (
                        <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                          <Mail className="w-3 h-3" /> {c.email}
                        </a>
                      )}
                      {c.phone && (
                        <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mt-0.5">
                          <Phone className="w-3 h-3" /> {c.phone}
                        </a>
                      )}
                      {!c.email && !c.phone && <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    {/* Orders */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-semibold">{c.orderCount}</span>
                      </div>
                    </td>
                    {/* Spent */}
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold ${c.totalSpent > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                        {c.totalSpent > 0 ? formatPrice(c.totalSpent) : '—'}
                      </span>
                    </td>
                    {/* Joined */}
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {c.created_at
                        ? new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                    {/* Role */}
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.is_admin ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {c.is_admin ? 'Admin' : 'Customer'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="sm:hidden space-y-3">
            {filtered.map((c: any) => (
              <div key={c.id} className="bg-white rounded-2xl border border-border p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-serif font-bold flex-shrink-0">
                    {(c.full_name ?? c.email ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{c.full_name ?? '—'}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.email ?? '—'}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${c.is_admin ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {c.is_admin ? 'Admin' : 'Customer'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
                  <div className="text-center">
                    <p className="text-xs font-bold text-foreground">{c.orderCount}</p>
                    <p className="text-[10px] text-muted-foreground">Orders</p>
                  </div>
                  <div className="text-center border-x border-border">
                    <p className="text-xs font-bold text-primary">{c.totalSpent > 0 ? formatPrice(c.totalSpent) : '—'}</p>
                    <p className="text-[10px] text-muted-foreground">Spent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-foreground">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Joined</p>
                  </div>
                </div>
                {c.phone && (
                  <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2.5">
                    <Phone className="w-3 h-3" /> {c.phone}
                  </a>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* SQL notice if only 1 customer showing */}
      {customers.length <= 1 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <p className="font-semibold mb-1">⚠️ Missing customers?</p>
          <p className="text-xs leading-relaxed">
            Some users may have registered before the profile sync was set up. Run the backfill SQL in{' '}
            <strong>Supabase → SQL Editor</strong> to import all existing users. Ask your developer for the SQL script.
          </p>
        </div>
      )}
    </div>
  )
}
