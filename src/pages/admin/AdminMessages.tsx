import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Mail, Trash2, Loader2, Inbox, MailOpen, Phone, ChevronDown, Check } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminMessages() {
  const qc = useQueryClient()
  const [expanded, setExpanded] = useState<string | null>(null)

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: async () => { const { data } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false }); return data ?? [] },
  })

  const del = useMutation({
    mutationFn: async (id: string) => supabase.from('contact_messages').delete().eq('id', id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-messages'] }); toast.success('Deleted') },
  })

  const markRead = useMutation({
    mutationFn: async ({ id, is_read }: { id: string; is_read: boolean }) => {
      await supabase.from('contact_messages').update({ is_read: !is_read }).eq('id', id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-messages'] })
      qc.invalidateQueries({ queryKey: ['admin-badges'] })
    },
  })

  const unreadCount = (messages as any[]).filter((m: any) => !m.is_read).length

  function toggleExpand(m: any) {
    setExpanded(prev => (prev === m.id ? null : m.id))
    if (!m.is_read) markRead.mutate({ id: m.id, is_read: false })
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Contact Messages</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {(messages as any[]).length} message{(messages as any[]).length === 1 ? '' : 's'} · click a message to read it
          </p>
        </div>
        {unreadCount > 0 && (
          <span className="inline-flex items-center gap-2 self-start sm:self-auto bg-primary/10 text-primary text-sm font-semibold px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {unreadCount} unread
          </span>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-border flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading messages…</p>
        </div>
      ) : (messages as any[]).length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-border flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Inbox className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-serif text-lg font-semibold">No messages yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            When customers write to you through the contact page, their messages will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {(messages as any[]).map((m: any) => {
            const isOpen = expanded === m.id
            return (
              <div
                key={m.id}
                className={`rounded-xl border overflow-hidden transition-all ${m.is_read ? 'bg-white border-border' : 'bg-primary/[0.03] border-primary/30 shadow-sm'}`}
              >
                {/* Summary row */}
                <button onClick={() => toggleExpand(m)} className="w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-background/60 transition-colors">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${m.is_read ? 'bg-background text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                    {m.is_read ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm truncate ${m.is_read ? 'font-medium text-foreground' : 'font-bold text-foreground'}`}>{m.name}</p>
                      {!m.is_read && <span className="text-[9px] font-bold uppercase tracking-wide bg-primary text-white px-1.5 py-0.5 rounded-full flex-shrink-0">New</span>}
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${m.is_read ? 'text-muted-foreground' : 'text-foreground/80 font-medium'}`}>
                      {m.subject ? `${m.subject} — ` : ''}{m.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {m.created_at && (
                      <span className="hidden sm:block text-[11px] text-muted-foreground">
                        {new Date(m.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-border/60">
                    {m.subject && <p className="text-sm font-semibold text-primary mt-3">{m.subject}</p>}
                    <p className="text-sm text-foreground/90 mt-2 whitespace-pre-wrap leading-relaxed">{m.message}</p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {m.email}</span>
                      {m.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {m.phone}</span>}
                      {m.created_at && <span>{new Date(m.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-border/60">
                      <a href={`mailto:${m.email}${m.subject ? `?subject=Re: ${encodeURIComponent(m.subject)}` : ''}`} className="btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs">
                        <Mail className="w-3.5 h-3.5" /> Reply via Email
                      </a>
                      <button
                        onClick={() => markRead.mutate({ id: m.id, is_read: m.is_read })}
                        disabled={markRead.isPending}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium border border-border rounded-lg hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" /> Mark as {m.is_read ? 'unread' : 'read'}
                      </button>
                      <button
                        onClick={() => window.confirm(`Delete message from "${m.name}"?`) && del.mutate(m.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
