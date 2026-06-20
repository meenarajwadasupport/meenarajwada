import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export default function AdminSiteSettings() {
  const qc = useQueryClient()
  const [form, setForm] = useState({ announcement_text: '', announcement_active: true, whatsapp_number: '', instagram_url: '', facebook_url: '', youtube_url: '', pinterest_url: '' })

  const { data } = useQuery({
    queryKey: ['site-settings-admin'],
    queryFn: async () => { const { data } = await supabase.from('site_settings').select('*').maybeSingle(); return data },
  })

  useEffect(() => {
    if (data) setForm({ announcement_text: data.announcement_text ?? '', announcement_active: data.announcement_active ?? true, whatsapp_number: data.whatsapp_number ?? '', instagram_url: data.instagram_url ?? '', facebook_url: data.facebook_url ?? '', youtube_url: data.youtube_url ?? '', pinterest_url: data.pinterest_url ?? '' })
  }, [data])

  const save = useMutation({
    mutationFn: async () => {
      if (data?.id) await supabase.from('site_settings').update(form).eq('id', data.id)
      else await supabase.from('site_settings').insert(form)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['site-settings'] }); toast.success('Settings saved') },
  })

  const inputCls = 'w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary bg-white'

  return (
    <div className="max-w-xl">
      <h1 className="font-serif text-2xl font-bold mb-6">Site Settings</h1>
      <div className="bg-white rounded-xl border border-border p-6 space-y-5">
        <div>
          <h2 className="font-semibold mb-3">Announcement Bar</h2>
          <textarea value={form.announcement_text} onChange={e => setForm(f => ({ ...f, announcement_text: e.target.value }))} placeholder="Announcement text" rows={2} className={`${inputCls} resize-none mb-2`} />
          <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.announcement_active} onChange={e => setForm(f => ({ ...f, announcement_active: e.target.checked }))} className="accent-primary" />Show announcement</label>
        </div>
        <div>
          <h2 className="font-semibold mb-3">Contact</h2>
          <input value={form.whatsapp_number} onChange={e => setForm(f => ({ ...f, whatsapp_number: e.target.value }))} placeholder="WhatsApp number (with country code, no +)" className={inputCls} />
        </div>
        <div>
          <h2 className="font-semibold mb-3">Social Links</h2>
          <div className="space-y-2">
            <input value={form.instagram_url} onChange={e => setForm(f => ({ ...f, instagram_url: e.target.value }))} placeholder="Instagram URL" className={inputCls} />
            <input value={form.facebook_url} onChange={e => setForm(f => ({ ...f, facebook_url: e.target.value }))} placeholder="Facebook URL" className={inputCls} />
            <input value={form.youtube_url} onChange={e => setForm(f => ({ ...f, youtube_url: e.target.value }))} placeholder="YouTube URL" className={inputCls} />
            <input value={form.pinterest_url} onChange={e => setForm(f => ({ ...f, pinterest_url: e.target.value }))} placeholder="Pinterest URL" className={inputCls} />
          </div>
        </div>
        <button onClick={() => save.mutate()} disabled={save.isPending} className="btn-primary w-full py-3 disabled:opacity-60">
          {save.isPending ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
