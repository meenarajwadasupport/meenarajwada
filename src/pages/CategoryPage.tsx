import { useParams } from 'react-router-dom'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import ProductGrid from '@/components/product/ProductGrid'
import SEOHead from '@/components/common/SEOHead'

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: products = [], isLoading } = useProducts({ category: slug })
  const { data: categories = [] } = useCategories()
  const category = categories.find(c => c.slug === slug)

  return (
    <>
      <SEOHead title={category?.name ?? 'Collection'} url={`https://www.meenarajwada.com/category/${slug}`} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {category?.image_url && (
          <div className="relative h-48 rounded-2xl overflow-hidden mb-8">
            <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <h1 className="font-serif text-4xl font-bold text-white">{category.name}</h1>
            </div>
          </div>
        )}
        {!category?.image_url && <h1 className="font-serif text-3xl font-bold mb-8 capitalize">{slug?.replace(/-/g, ' ')}</h1>}
        <ProductGrid products={products} loading={isLoading} />
      </div>
    </>
  )
}
