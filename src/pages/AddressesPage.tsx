import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import SEOHead from '@/components/common/SEOHead'
import { MapPin, Plus, Trash2, Star, Loader2, Edit2 } from 'lucide-react'

interface Address {
  id: string
  full_name: string
  phone: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  pincode: string
  country: string
  is_default: boolean
}

const EMPTY: Omit<Address, 'id' | 'is_default'> = {
  full_name: '', phone: '', address_line1: '', address_line2: '',
  city: '', state: '', pincode: '', country: 'India',
}

const inp = 'w-full border border-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary bg-white transition-colors'

function AddressForm({ initial, onSave, onCancel, saving }: {
  initial: typeof EMPTY
  onSave: (data: typeof EMPTY) => void
  onCancel: () => void
  saving: boolean
}) {
  const [form, setForm] = useState(initial)
  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name || !form.phone || !form.address_line1 || !form.city || !form.state || !form.pincode) {
      toast.error('Please fill all required fields')
      return
    }
    if (!/^\d{10}$/.test(form.phone)) { toast.error('Enter a valid 10-digit phone number'); return }
    if (!/^\d{6}$/.test(form.pincode)) { toast.error('Enter a valid 6-digit pincode'); return }
    onSave(form)
  }

  return (
    <form onSubmit={submit} className="bg-white border border-border rounded-2xl p-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground block mb-1.5">Full Name *</label>
          <input value={form.full_name} onChange={set('full_name')} className={inp} placeholder="Meena Sharma" />
        </div>
        <div>
          <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground block mb-1.5">Phone (10 digits) *</label>
          <input value={form.phone} onChange={set('phone')} type="tel" maxLength={10} className={inp} placeholder="9876543210" />
        </div>
      </div>
      <div>
        <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground block mb-1.5">Address Line 1 *</label>
        <input value={form.address_line1} onChange={set('address_line1')} className={inp} placeholder="House / Flat / Street" />
      </div>
      <div>
        <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground block mb-1.5">Address Line 2 <span className="text-muted-foreground/60 normal-case font-normal">(optional)</span></label>
        <input value={form.address_line2} onChange={set('address_line2')} className={inp} placeholder="Landmark / Area" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground block mb-1.5">City *</label>
          <input value={form.city} onChange={set('city')} className={inp} placeholder="Mumbai" />
        </div>
        <div>
          <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground block mb-1.5">State *</label>
          <input value={form.state} onChange={set('state')} className={inp} placeholder="Maharashtra" />
        </div>
        <div>
          <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground block mb-1.5">Pincode *</label>
          <input value={form.pincode} onChange={set('pincode')} maxLength={6} className={inp} placeholder="400001" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary px-6 py-2.5 text-[12px] tracking-[0.15em] flex items-center gap-2 disabled:opacity-60">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save Address'}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline px-6 py-2.5 text-[12px] tracking-[0.15em]">Cancel</button>
      </div>
    </form>
  )
}

export default function AddressesPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['addresses', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false }).order('created_at', { ascending: false })
      if (error) throw error
      return data as Address[]
    },
    enabled: !!user,
  })

  const addAddress = useMutation({
    mutationFn: async (data: typeof EMPTY) => {
      const isFirst = addresses.length === 0
      const { error } = await supabase.from('addresses').insert({ ...data, user_id: user!.id, is_default: isFirst })
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['addresses'] }); setAdding(false); toast.success('Address saved!') },
    onError: () => toast.error('Could not save address'),
  })

  const updateAddress = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof EMPTY }) => {
      const { error } = await supabase.from('addresses').update(data).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['addresses'] }); setEditId(null); toast.success('Address updated!') },
    onError: () => toast.error('Could not update address'),
  })

  const deleteAddress = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('addresses').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['addresses'] }); toast.success('Address removed') },
  })

  const setDefault = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('addresses').update({ is_default: false }).eq('user_id', user!.id)
      await supabase.from('addresses').update({ is_default: true }).eq('id', id)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['addresses'] }); toast.success('Default address updated') },
  })

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <>
      <SEOHead title="Saved Addresses" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-2xl font-bold">Saved Addresses</h1>
          {!adding && (
            <button onClick={() => { setAdding(true); setEditId(null) }} className="btn-primary px-5 py-2.5 text-[11px] tracking-[0.15em] flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add New
            </button>
          )}
        </div>

        {adding && (
          <div className="mb-5">
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-3">New Address</p>
            <AddressForm
              initial={{ ...EMPTY }}
              onSave={data => addAddress.mutate(data)}
              onCancel={() => setAdding(false)}
              saving={addAddress.isPending}
            />
          </div>
        )}

        {addresses.length === 0 && !adding ? (
          <div className="text-center py-16 flex flex-col items-center gap-4">
            <MapPin className="w-12 h-12 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm">No saved addresses yet.</p>
            <button onClick={() => setAdding(true)} className="btn-primary px-8 py-3">Add Your First Address</button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map(addr => (
              <div key={addr.id}>
                {editId === addr.id ? (
                  <AddressForm
                    initial={{ full_name: addr.full_name, phone: addr.phone, address_line1: addr.address_line1, address_line2: addr.address_line2 ?? '', city: addr.city, state: addr.state, pincode: addr.pincode, country: addr.country }}
                    onSave={data => updateAddress.mutate({ id: addr.id, data })}
                    onCancel={() => setEditId(null)}
                    saving={updateAddress.isPending}
                  />
                ) : (
                  <div className={`bg-white border rounded-2xl p-5 transition-all ${addr.is_default ? 'border-primary/40 bg-primary/[0.02]' : 'border-border'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-[15px]">{addr.full_name}</p>
                          {addr.is_default && (
                            <span className="text-[9px] font-bold tracking-[0.1em] uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Star className="w-2.5 h-2.5 fill-current" /> Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}</p>
                        <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} – {addr.pincode}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{addr.phone}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => { setEditId(addr.id); setAdding(false) }} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => { if (confirm('Remove this address?')) deleteAddress.mutate(addr.id) }} className="p-2 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {!addr.is_default && (
                      <button onClick={() => setDefault.mutate(addr.id)} className="mt-3 text-xs text-primary hover:underline font-medium">
                        Set as default
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
