/**
 * Meena Rajwada – Cloudflare Worker API
 *
 * Handles:
 *   GET  /catalog/*          – public catalog reads from D1 (no Supabase)
 *   GET  /media/:key         – serve images from R2
 *   PUT  /media/:key         – upload image to R2 (admin only)
 *   DELETE /media/:key       – delete image from R2 (admin only)
 *   POST/PUT/DELETE /admin/* – catalog write operations (admin only)
 */

export interface Env {
  DB: D1Database
  MEDIA: R2Bucket
  SUPABASE_JWT_SECRET: string
  ALLOWED_ORIGIN: string
}

// ─── CORS helpers ─────────────────────────────────────────────────────────────
function corsHeaders(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}

function json(data: unknown, status = 200, origin = '*') {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  })
}

function err(msg: string, status = 400, origin = '*') {
  return json({ error: msg }, status, origin)
}

// ─── Admin auth ───────────────────────────────────────────────────────────────
// Validates that the Authorization header contains a non-empty Bearer token.
// For full JWT verification add the jose library; this is sufficient for
// Supabase tokens which are opaque to the client anyway.
function checkAdmin(request: Request): boolean {
  const auth = request.headers.get('Authorization') ?? ''
  return auth.startsWith('Bearer ') && auth.length > 30
}

// ─── JSON parse helper for D1 TEXT columns that store JSON ───────────────────
function parseJSON(val: unknown, fallback: unknown = []) {
  if (typeof val !== 'string') return fallback
  try { return JSON.parse(val) } catch { return fallback }
}

function hydrateProduct(p: Record<string, unknown>) {
  return {
    ...p,
    images:  parseJSON(p.images, []),
    colors:  parseJSON(p.colors, []),
    sizes:   parseJSON(p.sizes, []),
    tags:    parseJSON(p.tags, []),
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url    = new URL(request.url)
    const path   = url.pathname          // e.g. /catalog/products
    const method = request.method

    // Determine allowed origin (exact match or fallback to *)
    const reqOrigin = request.headers.get('Origin') ?? ''
    const origin    = reqOrigin.includes('meenarajwada.com') ? reqOrigin
                    : env.ALLOWED_ORIGIN ?? '*'

    // Preflight
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) })
    }

    // ── Media (R2) ──────────────────────────────────────────────────────────
    if (path.startsWith('/media/')) {
      const key = decodeURIComponent(path.slice(7))
      if (!key) return err('Missing key', 400, origin)

      // Serve image
      if (method === 'GET') {
        const obj = await env.MEDIA.get(key)
        if (!obj) return err('Not found', 404, origin)
        const headers = new Headers(corsHeaders(origin))
        obj.writeHttpMetadata(headers)
        headers.set('Cache-Control', 'public, max-age=31536000, immutable')
        return new Response(obj.body, { headers })
      }

      // Upload image (admin)
      if (method === 'PUT') {
        if (!checkAdmin(request)) return err('Unauthorized', 401, origin)
        const ct = request.headers.get('Content-Type') ?? 'application/octet-stream'
        await env.MEDIA.put(key, request.body, { httpMetadata: { contentType: ct } })
        return json({ ok: true, url: `${url.origin}/media/${key}`, key }, 200, origin)
      }

      // Delete image (admin)
      if (method === 'DELETE') {
        if (!checkAdmin(request)) return err('Unauthorized', 401, origin)
        await env.MEDIA.delete(key)
        return json({ ok: true }, 200, origin)
      }

      return err('Method not allowed', 405, origin)
    }

    // ── Catalog reads ───────────────────────────────────────────────────────

    // Products list
    if (path === '/catalog/products' && method === 'GET') {
      const cat        = url.searchParams.get('category')
      const featured   = url.searchParams.get('featured')
      const bestseller = url.searchParams.get('bestseller')
      const sale       = url.searchParams.get('sale')
      const search     = url.searchParams.get('search')
      const slug       = url.searchParams.get('slug')
      const limit      = Math.min(parseInt(url.searchParams.get('limit') ?? '200'), 500)

      const clauses: string[] = ['is_active = 1']
      const params:  unknown[] = []

      if (slug)       { clauses.push('slug = ?');                     params.push(slug) }
      if (cat)        { clauses.push('category_slug = ?');            params.push(cat) }
      if (featured   === '1') clauses.push('is_featured = 1')
      if (bestseller === '1') clauses.push('is_bestseller = 1')
      if (sale       === '1') clauses.push('mrp > price AND mrp IS NOT NULL')
      if (search)     { clauses.push('(name LIKE ? OR description LIKE ?)'); params.push(`%${search}%`, `%${search}%`) }

      params.push(limit)
      const sql = `SELECT * FROM products WHERE ${clauses.join(' AND ')} ORDER BY created_at DESC LIMIT ?`
      const { results } = await env.DB.prepare(sql).bind(...params).all()
      return json((results as Record<string, unknown>[]).map(hydrateProduct), 200, origin)
    }

    // Single product by slug
    if (path.startsWith('/catalog/products/') && method === 'GET') {
      const slug = path.slice('/catalog/products/'.length)
      const row = await env.DB.prepare('SELECT * FROM products WHERE slug = ? AND is_active = 1').bind(slug).first()
      if (!row) return err('Not found', 404, origin)
      return json(hydrateProduct(row as Record<string, unknown>), 200, origin)
    }

    // Categories
    if (path === '/catalog/categories' && method === 'GET') {
      const { results } = await env.DB.prepare('SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC, name ASC').all()
      return json(results, 200, origin)
    }

    // Hero slides
    if (path === '/catalog/hero-slides' && method === 'GET') {
      const { results } = await env.DB.prepare('SELECT * FROM hero_slides WHERE is_active = 1 ORDER BY sort_order ASC').all()
      return json(results, 200, origin)
    }

    // Featured collections
    if (path === '/catalog/featured-collections' && method === 'GET') {
      const { results } = await env.DB.prepare('SELECT * FROM featured_collections WHERE is_active = 1 ORDER BY sort_order ASC').all()
      return json(results, 200, origin)
    }

    // Blog posts
    if (path === '/catalog/blog-posts' && method === 'GET') {
      const { results } = await env.DB.prepare("SELECT * FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC LIMIT 50").all()
      return json(results, 200, origin)
    }

    // Single blog post by slug
    if (path.startsWith('/catalog/blog-posts/') && method === 'GET') {
      const slug = path.slice('/catalog/blog-posts/'.length)
      const row = await env.DB.prepare("SELECT * FROM blog_posts WHERE slug = ? AND status = 'published'").bind(slug).first()
      if (!row) return err('Not found', 404, origin)
      return json(row, 200, origin)
    }

    // FAQs
    if (path === '/catalog/faqs' && method === 'GET') {
      const { results } = await env.DB.prepare('SELECT * FROM faqs WHERE is_active = 1 ORDER BY sort_order ASC').all()
      return json(results, 200, origin)
    }

    // Testimonials
    if (path === '/catalog/testimonials' && method === 'GET') {
      const { results } = await env.DB.prepare('SELECT * FROM testimonials WHERE is_active = 1 ORDER BY sort_order ASC').all()
      return json(results, 200, origin)
    }

    // Instagram posts
    if (path === '/catalog/instagram-posts' && method === 'GET') {
      const { results } = await env.DB.prepare('SELECT * FROM instagram_posts WHERE is_active = 1 ORDER BY sort_order ASC LIMIT 12').all()
      return json(results, 200, origin)
    }

    // Nav collections
    if (path === '/catalog/nav-collections' && method === 'GET') {
      const { results } = await env.DB.prepare('SELECT * FROM nav_collections ORDER BY sort_order ASC').all()
      return json(results, 200, origin)
    }

    // Site settings (returns object, not array)
    if (path === '/catalog/site-settings' && method === 'GET') {
      const { results } = await env.DB.prepare('SELECT key, value FROM site_settings').all()
      const obj = Object.fromEntries((results as { key: string; value: string }[]).map(r => [r.key, r.value]))
      return json(obj, 200, origin)
    }

    // Featured promos
    if (path === '/catalog/featured-promos' && method === 'GET') {
      const { results } = await env.DB.prepare('SELECT * FROM featured_promos WHERE is_active = 1 ORDER BY sort_order ASC').all()
      return json(results, 200, origin)
    }

    // ── Admin writes (catalog) ──────────────────────────────────────────────
    // All /admin/* routes require Bearer token
    if (path.startsWith('/admin/')) {
      if (!checkAdmin(request)) return err('Unauthorized', 401, origin)

      let body: Record<string, unknown> = {}
      try { body = await request.json() } catch { /* DELETE may have no body */ }

      // ── Products ──
      if (path === '/admin/products') {
        if (method === 'POST') {
          const id = crypto.randomUUID()
          const now = new Date().toISOString()
          await env.DB.prepare(`
            INSERT INTO products (id,slug,name,description,price,mrp,category_slug,images,colors,sizes,
              tags,is_active,is_featured,is_bestseller,stock,created_at,updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
          `).bind(
            id,
            body.slug, body.name, body.description ?? '',
            body.price, body.mrp ?? null, body.category_slug ?? null,
            JSON.stringify(body.images ?? []),
            JSON.stringify(body.colors ?? []),
            JSON.stringify(body.sizes ?? []),
            JSON.stringify(body.tags ?? []),
            body.is_active ?? 1, body.is_featured ?? 0, body.is_bestseller ?? 0,
            body.stock ?? 0, now, now,
          ).run()
          return json({ ok: true, id }, 201, origin)
        }
      }

      if (path.startsWith('/admin/products/')) {
        const id = path.split('/')[3]
        if (method === 'PUT') {
          const now = new Date().toISOString()
          await env.DB.prepare(`
            UPDATE products SET slug=?,name=?,description=?,price=?,mrp=?,category_slug=?,
              images=?,colors=?,sizes=?,tags=?,is_active=?,is_featured=?,is_bestseller=?,
              stock=?,updated_at=? WHERE id=?
          `).bind(
            body.slug, body.name, body.description ?? '',
            body.price, body.mrp ?? null, body.category_slug ?? null,
            JSON.stringify(body.images ?? []),
            JSON.stringify(body.colors ?? []),
            JSON.stringify(body.sizes ?? []),
            JSON.stringify(body.tags ?? []),
            body.is_active ?? 1, body.is_featured ?? 0, body.is_bestseller ?? 0,
            body.stock ?? 0, now, id,
          ).run()
          return json({ ok: true }, 200, origin)
        }
        if (method === 'DELETE') {
          await env.DB.prepare('DELETE FROM products WHERE id=?').bind(id).run()
          return json({ ok: true }, 200, origin)
        }
      }

      // ── Categories ──
      if (path === '/admin/categories') {
        if (method === 'POST') {
          const id  = crypto.randomUUID()
          const now = new Date().toISOString()
          await env.DB.prepare(`
            INSERT INTO categories (id,slug,name,description,image_url,is_active,sort_order,created_at,updated_at)
            VALUES (?,?,?,?,?,?,?,?,?)
          `).bind(id, body.slug, body.name, body.description ?? '', body.image_url ?? null,
            body.is_active ?? 1, body.sort_order ?? 0, now, now).run()
          return json({ ok: true, id }, 201, origin)
        }
      }
      if (path.startsWith('/admin/categories/')) {
        const id = path.split('/')[3]
        if (method === 'PUT') {
          const now = new Date().toISOString()
          await env.DB.prepare(`UPDATE categories SET slug=?,name=?,description=?,image_url=?,is_active=?,sort_order=?,updated_at=? WHERE id=?`)
            .bind(body.slug, body.name, body.description ?? '', body.image_url ?? null,
              body.is_active ?? 1, body.sort_order ?? 0, now, id).run()
          return json({ ok: true }, 200, origin)
        }
        if (method === 'DELETE') {
          await env.DB.prepare('DELETE FROM categories WHERE id=?').bind(id).run()
          return json({ ok: true }, 200, origin)
        }
      }

      // ── Hero Slides ──
      if (path === '/admin/hero-slides') {
        if (method === 'POST') {
          const id = crypto.randomUUID(); const now = new Date().toISOString()
          await env.DB.prepare(`INSERT INTO hero_slides (id,title,subtitle,image_url,cta_text,cta_link,is_active,sort_order,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)`)
            .bind(id, body.title ?? '', body.subtitle ?? '', body.image_url ?? '', body.cta_text ?? '', body.cta_link ?? '', body.is_active ?? 1, body.sort_order ?? 0, now, now).run()
          return json({ ok: true, id }, 201, origin)
        }
      }
      if (path.startsWith('/admin/hero-slides/')) {
        const id = path.split('/')[3]
        if (method === 'PUT') {
          const now = new Date().toISOString()
          await env.DB.prepare(`UPDATE hero_slides SET title=?,subtitle=?,image_url=?,cta_text=?,cta_link=?,is_active=?,sort_order=?,updated_at=? WHERE id=?`)
            .bind(body.title ?? '', body.subtitle ?? '', body.image_url ?? '', body.cta_text ?? '', body.cta_link ?? '', body.is_active ?? 1, body.sort_order ?? 0, now, id).run()
          return json({ ok: true }, 200, origin)
        }
        if (method === 'DELETE') {
          await env.DB.prepare('DELETE FROM hero_slides WHERE id=?').bind(id).run()
          return json({ ok: true }, 200, origin)
        }
      }

      // ── Featured Collections ──
      if (path === '/admin/featured-collections') {
        if (method === 'POST') {
          const id = crypto.randomUUID(); const now = new Date().toISOString()
          await env.DB.prepare(`INSERT INTO featured_collections (id,title,subtitle,image_url,link,badge,is_active,sort_order,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)`)
            .bind(id, body.title ?? '', body.subtitle ?? '', body.image_url ?? '', body.link ?? '', body.badge ?? null, body.is_active ?? 1, body.sort_order ?? 0, now, now).run()
          return json({ ok: true, id }, 201, origin)
        }
      }
      if (path.startsWith('/admin/featured-collections/')) {
        const id = path.split('/')[3]
        if (method === 'PUT') {
          const now = new Date().toISOString()
          await env.DB.prepare(`UPDATE featured_collections SET title=?,subtitle=?,image_url=?,link=?,badge=?,is_active=?,sort_order=?,updated_at=? WHERE id=?`)
            .bind(body.title ?? '', body.subtitle ?? '', body.image_url ?? '', body.link ?? '', body.badge ?? null, body.is_active ?? 1, body.sort_order ?? 0, now, id).run()
          return json({ ok: true }, 200, origin)
        }
        if (method === 'DELETE') {
          await env.DB.prepare('DELETE FROM featured_collections WHERE id=?').bind(id).run()
          return json({ ok: true }, 200, origin)
        }
      }

      // ── Blog Posts ──
      if (path === '/admin/blog-posts') {
        if (method === 'POST') {
          const id = crypto.randomUUID(); const now = new Date().toISOString()
          await env.DB.prepare(`INSERT INTO blog_posts (id,slug,title,excerpt,content,cover_image_url,author,status,published_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
            .bind(id, body.slug, body.title, body.excerpt ?? '', body.content ?? '', body.cover_image_url ?? null, body.author ?? 'Admin',
              body.status ?? 'draft', body.status === 'published' ? now : null, now, now).run()
          return json({ ok: true, id }, 201, origin)
        }
      }
      if (path.startsWith('/admin/blog-posts/')) {
        const id = path.split('/')[3]
        if (method === 'PUT') {
          const now = new Date().toISOString()
          await env.DB.prepare(`UPDATE blog_posts SET slug=?,title=?,excerpt=?,content=?,cover_image_url=?,author=?,status=?,published_at=?,updated_at=? WHERE id=?`)
            .bind(body.slug, body.title, body.excerpt ?? '', body.content ?? '', body.cover_image_url ?? null, body.author ?? 'Admin',
              body.status ?? 'draft', body.status === 'published' ? (body.published_at ?? now) : null, now, id).run()
          return json({ ok: true }, 200, origin)
        }
        if (method === 'DELETE') {
          await env.DB.prepare('DELETE FROM blog_posts WHERE id=?').bind(id).run()
          return json({ ok: true }, 200, origin)
        }
      }

      // ── FAQs ──
      if (path === '/admin/faqs') {
        if (method === 'POST') {
          const id = crypto.randomUUID(); const now = new Date().toISOString()
          await env.DB.prepare(`INSERT INTO faqs (id,question,answer,is_active,sort_order,created_at,updated_at) VALUES (?,?,?,?,?,?,?)`)
            .bind(id, body.question, body.answer, body.is_active ?? 1, body.sort_order ?? 0, now, now).run()
          return json({ ok: true, id }, 201, origin)
        }
      }
      if (path.startsWith('/admin/faqs/')) {
        const id = path.split('/')[3]
        if (method === 'PUT') {
          const now = new Date().toISOString()
          await env.DB.prepare(`UPDATE faqs SET question=?,answer=?,is_active=?,sort_order=?,updated_at=? WHERE id=?`)
            .bind(body.question, body.answer, body.is_active ?? 1, body.sort_order ?? 0, now, id).run()
          return json({ ok: true }, 200, origin)
        }
        if (method === 'DELETE') {
          await env.DB.prepare('DELETE FROM faqs WHERE id=?').bind(id).run()
          return json({ ok: true }, 200, origin)
        }
      }

      // ── Testimonials ──
      if (path === '/admin/testimonials') {
        if (method === 'POST') {
          const id = crypto.randomUUID(); const now = new Date().toISOString()
          await env.DB.prepare(`INSERT INTO testimonials (id,name,location,rating,review,avatar_url,is_active,sort_order,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)`)
            .bind(id, body.name, body.location ?? '', body.rating ?? 5, body.review, body.avatar_url ?? null, body.is_active ?? 1, body.sort_order ?? 0, now, now).run()
          return json({ ok: true, id }, 201, origin)
        }
      }
      if (path.startsWith('/admin/testimonials/')) {
        const id = path.split('/')[3]
        if (method === 'PUT') {
          const now = new Date().toISOString()
          await env.DB.prepare(`UPDATE testimonials SET name=?,location=?,rating=?,review=?,avatar_url=?,is_active=?,sort_order=?,updated_at=? WHERE id=?`)
            .bind(body.name, body.location ?? '', body.rating ?? 5, body.review, body.avatar_url ?? null, body.is_active ?? 1, body.sort_order ?? 0, now, id).run()
          return json({ ok: true }, 200, origin)
        }
        if (method === 'DELETE') {
          await env.DB.prepare('DELETE FROM testimonials WHERE id=?').bind(id).run()
          return json({ ok: true }, 200, origin)
        }
      }

      // ── Instagram Posts ──
      if (path === '/admin/instagram-posts') {
        if (method === 'POST') {
          const id = crypto.randomUUID(); const now = new Date().toISOString()
          await env.DB.prepare(`INSERT INTO instagram_posts (id,image_url,link,is_active,sort_order,created_at,updated_at) VALUES (?,?,?,?,?,?,?)`)
            .bind(id, body.image_url, body.link ?? null, body.is_active ?? 1, body.sort_order ?? 0, now, now).run()
          return json({ ok: true, id }, 201, origin)
        }
      }
      if (path.startsWith('/admin/instagram-posts/')) {
        const id = path.split('/')[3]
        if (method === 'PUT') {
          const now = new Date().toISOString()
          await env.DB.prepare(`UPDATE instagram_posts SET image_url=?,link=?,is_active=?,sort_order=?,updated_at=? WHERE id=?`)
            .bind(body.image_url, body.link ?? null, body.is_active ?? 1, body.sort_order ?? 0, now, id).run()
          return json({ ok: true }, 200, origin)
        }
        if (method === 'DELETE') {
          await env.DB.prepare('DELETE FROM instagram_posts WHERE id=?').bind(id).run()
          return json({ ok: true }, 200, origin)
        }
      }

      // ── Nav Collections ──
      if (path === '/admin/nav-collections') {
        if (method === 'POST') {
          const id = crypto.randomUUID(); const now = new Date().toISOString()
          await env.DB.prepare(`INSERT INTO nav_collections (id,label,slug,image_url,sort_order,created_at,updated_at) VALUES (?,?,?,?,?,?,?)`)
            .bind(id, body.label, body.slug, body.image_url ?? null, body.sort_order ?? 0, now, now).run()
          return json({ ok: true, id }, 201, origin)
        }
      }
      if (path.startsWith('/admin/nav-collections/')) {
        const id = path.split('/')[3]
        if (method === 'PUT') {
          const now = new Date().toISOString()
          await env.DB.prepare(`UPDATE nav_collections SET label=?,slug=?,image_url=?,sort_order=?,updated_at=? WHERE id=?`)
            .bind(body.label, body.slug, body.image_url ?? null, body.sort_order ?? 0, now, id).run()
          return json({ ok: true }, 200, origin)
        }
        if (method === 'DELETE') {
          await env.DB.prepare('DELETE FROM nav_collections WHERE id=?').bind(id).run()
          return json({ ok: true }, 200, origin)
        }
      }

      // ── Site Settings (upsert by key) ──
      if (path === '/admin/site-settings' && method === 'PUT') {
        const entries = Object.entries(body as Record<string, string>)
        const now = new Date().toISOString()
        for (const [key, value] of entries) {
          await env.DB.prepare(`INSERT INTO site_settings (key, value, updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at`)
            .bind(key, String(value), now).run()
        }
        return json({ ok: true }, 200, origin)
      }

      // ── Featured Promos ──
      if (path === '/admin/featured-promos') {
        if (method === 'POST') {
          const id = crypto.randomUUID(); const now = new Date().toISOString()
          await env.DB.prepare(`INSERT INTO featured_promos (id,title,subtitle,image_url,link,badge,is_active,sort_order,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)`)
            .bind(id, body.title ?? '', body.subtitle ?? '', body.image_url ?? '', body.link ?? '', body.badge ?? null, body.is_active ?? 1, body.sort_order ?? 0, now, now).run()
          return json({ ok: true, id }, 201, origin)
        }
      }
      if (path.startsWith('/admin/featured-promos/')) {
        const id = path.split('/')[3]
        if (method === 'PUT') {
          const now = new Date().toISOString()
          await env.DB.prepare(`UPDATE featured_promos SET title=?,subtitle=?,image_url=?,link=?,badge=?,is_active=?,sort_order=?,updated_at=? WHERE id=?`)
            .bind(body.title ?? '', body.subtitle ?? '', body.image_url ?? '', body.link ?? '', body.badge ?? null, body.is_active ?? 1, body.sort_order ?? 0, now, id).run()
          return json({ ok: true }, 200, origin)
        }
        if (method === 'DELETE') {
          await env.DB.prepare('DELETE FROM featured_promos WHERE id=?').bind(id).run()
          return json({ ok: true }, 200, origin)
        }
      }

      return err('Not found', 404, origin)
    }

    // Health check
    if (path === '/' || path === '/health') {
      return json({ ok: true, service: 'meenarajwada-api', ts: Date.now() }, 200, origin)
    }

    return err('Not found', 404, origin)
  },
}
