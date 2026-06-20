import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { BlogPost as BlogPostType } from '@/types'
import { ArrowLeft } from 'lucide-react'
import SEOHead from '@/components/common/SEOHead'

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: post, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data } = await supabase.from('blog_posts').select('*').eq('slug', slug).eq('is_published', true).maybeSingle()
      return data as BlogPostType | null
    },
    enabled: !!slug,
  })

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
  if (!post) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Post not found.</div>

  return (
    <>
      <SEOHead title={post.title} description={post.excerpt} image={post.cover_image} url={`https://www.meenarajwada.com/blog/${slug}`} />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
        {post.cover_image && (
          <div className="h-64 rounded-2xl overflow-hidden mb-8">
            <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}
        <h1 className="font-serif text-3xl font-bold leading-snug mb-4">{post.title}</h1>
        {post.excerpt && <p className="text-muted-foreground text-lg leading-relaxed mb-8 border-l-4 border-primary pl-4">{post.excerpt}</p>}
        <div className="prose prose-sm max-w-none text-foreground/80 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>
      </div>
    </>
  )
}
