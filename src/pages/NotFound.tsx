import { Link } from 'react-router-dom'
import SEOHead from '@/components/common/SEOHead'

export default function NotFound() {
  return (
    <>
      <SEOHead title="Page Not Found" />
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 px-4 text-center">
        <p className="font-serif text-8xl font-bold text-primary/20">404</p>
        <h1 className="font-serif text-3xl font-bold">Page Not Found</h1>
        <p className="text-muted-foreground max-w-sm">The page you're looking for doesn't exist. It may have been moved or the URL may be incorrect.</p>
        <div className="flex gap-3 mt-4">
          <Link to="/" className="btn-primary px-8 py-3">Go Home</Link>
          <Link to="/shop" className="btn-outline px-8 py-3">Browse Jewellery</Link>
        </div>
      </div>
    </>
  )
}
