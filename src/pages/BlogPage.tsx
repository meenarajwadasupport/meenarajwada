import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { BlogPost } from '@/types'
import SEOHead from '@/components/common/SEOHead'

export default function BlogPage() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const { data } = await supabase.from('blog_posts').select('*').eq('is_published', true).order('created_at', { ascending: false })
      return (data ?? []) as BlogPost[]
    },
  })

  return (
    <>
      <SEOHead title="Blog" description="Stories, tips, and inspiration from the world of handcrafted jewellery." url="https://www.meenarajwada.com/blog" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <p className="section-label">Insights</p>
          <h1 className="section-title">Our Journal</h1>
          <div className="divider" />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl overflow-hidden border border-border animate-pulse"><div className="h-48 bg-muted" /><div className="p-4 space-y-2"><div className="h-4 bg-muted rounded w-3/4" /><div className="h-3 bg-muted rounded w-full" /></div></div>)}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No blog posts yet. Check back soon!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map(post => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="group bg-white rounded-2xl overflow-hidden border border-border hover:shadow-md transition-shadow">
                {post.cover_image && (
                  <div className="h-48 overflow-hidden">
                    <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-5">
                  <h2 className="font-serif font-semibold text-base leading-snug group-hover:text-primary transition-colors">{post.title}</h2>
                  {post.excerpt && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{post.excerpt}</p>}
                  <p className="text-xs text-muted-foreground mt-3">Read more →</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
