import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Mail, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminMessages() {
  const qc = useQueryClient()
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: async () => { const { data } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false }); return data ?? [] },
  })

  const del = useMutation({
    mutationFn: async (id: string) => supabase.from('contact_messages').delete().eq('id', id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-messages'] }); toast.success('Deleted') },
  })

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold mb-6">Contact Messages</h1>
      {isLoading ? <p className="text-muted-foreground">Loading…</p> : (
        <div className="space-y-3">
          {messages.map((m: any) => (
            <div key={m.id} className="bg-white rounded-xl border border-border p-4">
              <div className="flex justify-between mb-2">
                <div><p className="font-semibold text-sm">{m.name}</p><p className="text-xs text-muted-foreground">{m.email} · {m.phone}</p></div>
                <button onClick={() => del.mutate(m.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
              <p className="text-xs font-semibold text-primary">{m.subject}</p>
              <p className="text-sm text-muted-foreground mt-1">{m.message}</p>
              <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2">
                <Mail className="w-3 h-3" /> Reply via Email
              </a>
            </div>
          ))}
          {!messages.length && <p className="text-muted-foreground">No messages yet.</p>}
        </div>
      )}
    </div>
  )
}
