import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Loader2, Save, Instagram, Facebook, Youtube, Globe } from 'lucide-react'

const DEFAULTS = {
  announcement_text: '',
  announcement_active: true,
  whatsapp_number: '',
  instagram_url: '',
  facebook_url: '',
  youtube_url: '',
  pinterest_url: '',
}

export default function AdminSiteSettings() {
  const qc = useQueryClient()
  const [form, setForm] = useState(DEFAULTS)

  // Use the same queryKey as useSiteSettings hook so the whole app
  // updates when settings are saved
  const { data, isLoading, error: loadError } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_settings').select('*').maybeSingle()
      if (error) throw new Error(error.message)
      return data
    },
  })

  // Populate form when data loads (or when navigating back to this page)
  useEffect(() => {
    if (data) {
      setForm({
        announcement_text:   data.announcement_text   ?? '',
        announcement_active: data.announcement_active ?? true,
        whatsapp_number:     data.whatsapp_number     ?? '',
        instagram_url:       data.instagram_url       ?? '',
        facebook_url:        data.facebook_url        ?? '',
        youtube_url:         data.youtube_url         ?? '',
        pinterest_url:       data.pinterest_url       ?? '',
      })
    }
  }, [data])

  const save = useMutation({
    mutationFn: async () => {
      if (data?.id) {
        const { error } = await supabase.from('site_settings').update(form).eq('id', data.id)
        if (error) throw new Error(error.message)
      } else {
        const { error } = await supabase.from('site_settings').insert(form)
        if (error) throw new Error(error.message)
      }
    },
    onSuccess: () => {
      // Invalidate both keys so the live site and this page both refresh
      qc.invalidateQueries({ queryKey: ['site-settings'] })
      toast.success('Settings saved ✓')
    },
    onError: (e: any) => toast.error(`Save failed: ${e.message}`),
  })

  const inputCls = 'w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary bg-white transition-colors'
  const labelCls = 'text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5'

  if (isLoading) return (
    <div className="flex items-center justify-center h-40">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="font-serif text-2xl font-bold">Site Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Changes apply across the whole website after saving.</p>
      </div>

      {loadError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          Could not load settings: {(loadError as any).message}. Make sure you've run <code className="font-mono bg-red-100 px-1 rounded">supabase-setup.sql</code> in Supabase.
        </div>
      )}

      {/* ── Announcement Bar ─────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-border p-5 space-y-3">
        <h2 className="font-semibold text-base">📢 Announcement Bar</h2>
        <div>
          <label className={labelCls}>Text</label>
          <textarea
            value={form.announcement_text}
            onChange={e => setForm(f => ({ ...f, announcement_text: e.target.value }))}
            placeholder="e.g. Free shipping on orders above ₹999 · Use code WELCOME10 for 10% off"
            rows={2}
            className={`${inputCls} resize-none`}
          />
        </div>
        <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.announcement_active}
            onChange={e => setForm(f => ({ ...f, announcement_active: e.target.checked }))}
            className="accent-primary w-4 h-4"
          />
          <span>Show announcement bar on website</span>
        </label>
      </section>

      {/* ── Contact ──────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-border p-5 space-y-3">
        <h2 className="font-semibold text-base">📞 Contact</h2>
        <div>
          <label className={labelCls}>WhatsApp Number</label>
          <input
            value={form.whatsapp_number}
            onChange={e => setForm(f => ({ ...f, whatsapp_number: e.target.value }))}
            placeholder="919876543210  (country code + number, no + or spaces)"
            className={inputCls}
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            Example: for +91 98765 43210 → enter <code className="font-mono bg-muted px-1 rounded">919876543210</code>
          </p>
        </div>
      </section>

      {/* ── Social Links ─────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-border p-5 space-y-3">
        <h2 className="font-semibold text-base">🔗 Social Links</h2>
        <div>
          <label className={labelCls}><span className="inline-flex items-center gap-1"><Instagram className="w-3 h-3" /> Instagram URL</span></label>
          <input
            value={form.instagram_url}
            onChange={e => setForm(f => ({ ...f, instagram_url: e.target.value }))}
            placeholder="https://www.instagram.com/meena.rajwada/"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}><span className="inline-flex items-center gap-1"><Facebook className="w-3 h-3" /> Facebook URL</span></label>
          <input
            value={form.facebook_url}
            onChange={e => setForm(f => ({ ...f, facebook_url: e.target.value }))}
            placeholder="https://facebook.com/..."
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}><span className="inline-flex items-center gap-1"><Youtube className="w-3 h-3" /> YouTube URL</span></label>
          <input
            value={form.youtube_url}
            onChange={e => setForm(f => ({ ...f, youtube_url: e.target.value }))}
            placeholder="https://youtube.com/..."
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}><span className="inline-flex items-center gap-1"><Globe className="w-3 h-3" /> Pinterest URL</span></label>
          <input
            value={form.pinterest_url}
            onChange={e => setForm(f => ({ ...f, pinterest_url: e.target.value }))}
            placeholder="https://pinterest.com/..."
            className={inputCls}
          />
        </div>
      </section>

      {/* ── Save ─────────────────────────────────────────────────── */}
      <button
        onClick={() => save.mutate()}
        disabled={save.isPending}
        className="btn-primary w-full py-3 font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {save.isPending
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
          : <><Save className="w-4 h-4" /> Save Settings</>}
      </button>
    </div>
  )
}
