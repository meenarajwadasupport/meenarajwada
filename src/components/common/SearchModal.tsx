import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types'
import { formatPrice } from '@/lib/utils'

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) { setQuery(''); setResults([]); setTimeout(() => inputRef.current?.focus(), 100) }
  }, [open])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      const { data } = await supabase
        .from('products').select('id,name,slug,price,images')
        .ilike('name', `%${query}%`).eq('is_active', true).limit(6)
      setResults(data ?? [])
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!open) return null

  function goToProduct(slug: string) {
    onClose()
    navigate(`/product/${slug}`)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 bg-black/50" onClick={onClose}>
      <div className="bg-white w-full max-w-xl mx-4 rounded-xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search jewellery..."
            className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>
        {loading && (
          <div className="p-4 text-center text-sm text-muted-foreground">Searching…</div>
        )}
        {!loading && results.length > 0 && (
          <ul className="divide-y divide-border max-h-80 overflow-y-auto">
            {results.map(p => (
              <li key={p.id}>
                <button onClick={() => goToProduct(p.slug)} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-background/80 text-left">
                  <img src={p.images?.[0]} alt={p.name} className="w-10 h-10 object-cover rounded-md flex-shrink-0 bg-muted" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-primary">{formatPrice(p.price)}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
        {!loading && query.trim() && results.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground">No results for "{query}"</div>
        )}
      </div>
    </div>
  )
}
