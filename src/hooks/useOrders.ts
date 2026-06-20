import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Order } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

export function useOrders() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(name, images))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Order[]
    },
    enabled: !!user,
  })
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(name, images, slug))')
        .eq('id', orderId)
        .maybeSingle()
      if (error || !data) return null
      return data as Order
    },
    enabled: !!orderId,
  })
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  })
}
