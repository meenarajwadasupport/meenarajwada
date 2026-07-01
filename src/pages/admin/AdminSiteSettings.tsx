import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import {
  Loader2, Save, Phone, Mail, MapPin, Clock,
  Instagram, Facebook, Youtube, Globe, Megaphone, AlertCircle,
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────
interface Settings {
  id?: string
  announcement_text:   string
  announcement_active: boolean
  whatsapp_number:     string
  email_address:       string
  store_address:       string
  business_hours:      string
  instagram_url:       string
  facebook_url:        string
  youtube_url:         string
  pinterest_url:       string
}

const DEFAULTS: Settings = {
  announcement_text:   '',
  announcement_active: true,
  whatsapp_number:     '',
  email_address:       '',
  store_address:       '',
  business_hours:      'Mon–Sat: 10am–7pm',
  instagram_url:       'https://www.instagram.com/meena.rajwada?igsh=aGRoMngyODhrZjlz',
  facebook_url:        '',
  youtube_url:         '',
  pinterest_url:       '',
}

const TABS = [
  { id: 'announcement', label: 'Announcement', icon: Megaphone },
  { id: 'contact',      label: 'Contact',       icon: Phone },
  { id: 'social',       label: 'Social Links',  icon: Globe },
  { id: 'business',     label: 'Business Info', icon: Clock },
]

// ── Component ────────────────────────────────────────────────
export default function AdminSiteSettings() {
  const qc = useQueryClient()
  const [tab, setTab] = useState('announcement')
  const [form, setForm] = useState<Settings>(DEFAULTS)
  const [hasChanges, setHasChanges] = useState(false)

  const { data, isLoading, error: loadError } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      // limit(1) safely handles 0 or multiple rows (maybeSingle fails on multiple)
      const { data: rows, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(1)
      if (error) throw new Error(error.message)
      return (rows?.[0] ?? null) as Settings | null
    },
  })

  useEffect(() => {
    if (data) {
      setForm({
        id: (data as any).id,
        announcement_text:   data.announcement_text   ?? '',
        announcement_active: data.announcement_active ?? true,
        whatsapp_number:     data.whatsapp_number     ?? '',
        email_address:       data.email_address       ?? '',
        store_address:       data.store_address       ?? '',
        business_hours:      data.business_hours      ?? 'Mon–Sat: 10am–7pm',
        instagram_url:       data.instagram_url       ?? 'https://www.instagram.com/meena.rajwada?igsh=aGRoMngyODhrZjlz',
        facebook_url:        data.facebook_url        ?? '',
        youtube_url:         data.youtube_url         ?? '',
        pinterest_url:       data.pinterest_url       ?? '',
      })
      setHasChanges(false)
    }
  }, [data])

  function set(key: keyof Settings, value: any) {
    setForm(f => ({ ...f, [key]: value }))
    setHasChanges(true)
  }

  const save = useMutation({
    mutationFn: async () => {
      const { id, ...payload } = form as any
      payload.updated_at = new Date().toISOString()
      if (id) {
        const { error } = await supabase.from('site_settings').update(payload).eq('id', id)
        if (error) throw new Error(error.message)
      } else {
        const { error } = await supabase.from('site_settings').insert(payload)
        if (error) throw new Error(error.message)
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['site-settings'] })
      setHasChanges(false)
      toast.success('Settings saved ✓')
    },
    onError: (e: any) => toast.error(`Save failed: ${e.message}`),
  })

  const ic = 'w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary bg-white transition-colors'
  const lc = 'text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5'

  if (isLoading) return (
    <div className="flex items-center justify-center h-40">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="max-w-2xl space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold">Site Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Changes apply across the whole website after saving.</p>
        </div>
        <button
          onClick={() => save.mutate()}
          disabled={save.isPending || !hasChanges}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-sm font-semibold disabled:opacity-50 flex-shrink-0"
        >
          {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {save.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>

      {/* Error banner */}
      {loadError && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Could not load settings</p>
            <p className="text-xs mt-0.5">{(loadError as any).message} — make sure you've run <code className="font-mono bg-red-100 px-1 rounded">supabase-setup.sql</code></p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">

        {/* Tab bar */}
        <div className="flex overflow-x-auto border-b border-border bg-background/50 scrollbar-hide">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex-shrink-0
                ${tab === id
                  ? 'border-primary text-primary bg-white'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-white/60'
                }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Announcement ──────────────────────────────────── */}
        {tab === 'announcement' && (
          <div className="p-5 space-y-4">
            <p className="text-sm text-muted-foreground">The scrolling text bar shown at the top of every page.</p>
            <div>
              <label className={lc}>Announcement Text</label>
              <textarea
                value={form.announcement_text}
                onChange={e => set('announcement_text', e.target.value)}
                placeholder="e.g. Free shipping on orders above ₹999 · Use code WELCOME10 for 10% off"
                rows={3}
                className={`${ic} resize-none`}
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Tip: use · (dot) to separate multiple messages. They will scroll across the top bar.
              </p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                onClick={() => set('announcement_active', !form.announcement_active)}
                className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${form.announcement_active ? 'bg-primary' : 'bg-muted'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.announcement_active ? 'left-5' : 'left-1'}`} />
              </div>
              <div>
                <p className="text-sm font-medium">{form.announcement_active ? 'Visible' : 'Hidden'}</p>
                <p className="text-xs text-muted-foreground">Show announcement bar on the website</p>
              </div>
            </label>
          </div>
        )}

        {/* ── Contact ───────────────────────────────────────── */}
        {tab === 'contact' && (
          <div className="p-5 space-y-4">
            <div>
              <label className={lc}><span className="inline-flex items-center gap-1.5"><Phone className="w-3 h-3" />WhatsApp Number</span></label>
              <input
                value={form.whatsapp_number}
                onChange={e => set('whatsapp_number', e.target.value)}
                placeholder="919876543210"
                className={ic}
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Country code + number, no + or spaces. Example: for +91 98765 43210 → <code className="font-mono bg-muted px-1 rounded">919876543210</code>
              </p>
            </div>
            <div>
              <label className={lc}><span className="inline-flex items-center gap-1.5"><Mail className="w-3 h-3" />Email Address</span></label>
              <input
                value={form.email_address}
                onChange={e => set('email_address', e.target.value)}
                placeholder="contact@meenarajwada.com"
                type="email"
                className={ic}
              />
            </div>
            <div>
              <label className={lc}><span className="inline-flex items-center gap-1.5"><MapPin className="w-3 h-3" />Store Address</span></label>
              <textarea
                value={form.store_address}
                onChange={e => set('store_address', e.target.value)}
                placeholder="Shop No. 5, Jewellery Market, Jaipur, Rajasthan – 302001"
                rows={2}
                className={`${ic} resize-none`}
              />
            </div>
          </div>
        )}

        {/* ── Social Links ──────────────────────────────────── */}
        {tab === 'social' && (
          <div className="p-5 space-y-4">
            <div>
              <label className={lc}><span className="inline-flex items-center gap-1.5"><Instagram className="w-3 h-3 text-pink-500" />Instagram URL</span></label>
              <input
                value={form.instagram_url}
                onChange={e => set('instagram_url', e.target.value)}
                placeholder="https://www.instagram.com/meena.rajwada?igsh=aGRoMngyODhrZjlz"
                className={ic}
              />
            </div>
            <div>
              <label className={lc}><span className="inline-flex items-center gap-1.5"><Facebook className="w-3 h-3 text-blue-500" />Facebook URL</span></label>
              <input
                value={form.facebook_url}
                onChange={e => set('facebook_url', e.target.value)}
                placeholder="https://facebook.com/meenarajwada"
                className={ic}
              />
            </div>
            <div>
              <label className={lc}><span className="inline-flex items-center gap-1.5"><Youtube className="w-3 h-3 text-red-500" />YouTube URL</span></label>
              <input
                value={form.youtube_url}
                onChange={e => set('youtube_url', e.target.value)}
                placeholder="https://youtube.com/@meenarajwada"
                className={ic}
              />
            </div>
            <div>
              <label className={lc}><span className="inline-flex items-center gap-1.5"><Globe className="w-3 h-3 text-orange-500" />Pinterest URL</span></label>
              <input
                value={form.pinterest_url}
                onChange={e => set('pinterest_url', e.target.value)}
                placeholder="https://pinterest.com/meenarajwada"
                className={ic}
              />
            </div>
          </div>
        )}

        {/* ── Business Info ─────────────────────────────────── */}
        {tab === 'business' && (
          <div className="p-5 space-y-4">
            <div>
              <label className={lc}><span className="inline-flex items-center gap-1.5"><Clock className="w-3 h-3" />Business Hours</span></label>
              <input
                value={form.business_hours}
                onChange={e => set('business_hours', e.target.value)}
                placeholder="Mon–Sat: 10am–7pm, Sun: Closed"
                className={ic}
              />
            </div>
            <div className="bg-background/60 rounded-xl p-4 border border-border text-sm text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground text-xs uppercase tracking-wide mb-2">Current values in use</p>
              <p><span className="font-medium text-foreground">WhatsApp:</span> {form.whatsapp_number || <span className="italic">not set</span>}</p>
              <p><span className="font-medium text-foreground">Instagram:</span> {form.instagram_url ? <a href={form.instagram_url} target="_blank" rel="noopener noreferrer" className="text-primary underline truncate block max-w-xs">{form.instagram_url}</a> : <span className="italic">not set</span>}</p>
              <p><span className="font-medium text-foreground">Announcement:</span> {form.announcement_active ? '✅ Visible' : '❌ Hidden'}</p>
            </div>
          </div>
        )}

        {/* Footer save */}
        <div className="px-5 pb-5">
          <button
            onClick={() => save.mutate()}
            disabled={save.isPending || !hasChanges}
            className="btn-primary w-full py-3 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {save.isPending
              ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
              : <><Save className="w-4 h-4" />Save Settings</>}
          </button>
        </div>
      </div>

      {/* Floating unsaved changes pill */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 bg-foreground text-background text-xs font-semibold px-4 py-2 rounded-full shadow-xl flex items-center gap-2 z-50">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          Unsaved changes
        </div>
      )}
    </div>
  )
}
