import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { PRODUCTS, CATEGORIES, COLLECTIONS, TESTIMONIALS } from '@/lib/seed-data'

const ADMIN_EMAILS = ['admin@auverra.com']
const db = supabaseAdmin // service role client — bypasses RLS, used for all server-side data access

// ---------------------------------------------------------------------------
// camelCase <-> snake_case mapping helpers (frontend uses camelCase, Postgres
// columns use snake_case)
// ---------------------------------------------------------------------------
function productToApi(row) {
  if (!row) return row
  return {
    slug: row.slug, name: row.name, tagline: row.tagline,
    price: Number(row.price), compareAtPrice: row.compare_at_price != null ? Number(row.compare_at_price) : null,
    currency: row.currency, category: row.category, collection: row.collection, brand: row.brand,
    images: row.images || [], description: row.description, features: row.features || [],
    specs: row.specs || {}, variants: row.variants || {}, stock: row.stock,
    rating: Number(row.rating), reviewCount: row.review_count,
    featured: row.featured, bestSeller: row.best_seller, newArrival: row.new_arrival,
    limitedEdition: row.limited_edition, badges: row.badges || [],
  }
}
function productFromApi(body) {
  const out = {}
  if (body.slug !== undefined) out.slug = body.slug
  if (body.name !== undefined) out.name = body.name
  if (body.tagline !== undefined) out.tagline = body.tagline
  if (body.price !== undefined) out.price = Number(body.price)
  if (body.compareAtPrice !== undefined) out.compare_at_price = body.compareAtPrice ? Number(body.compareAtPrice) : null
  if (body.category !== undefined) out.category = body.category
  if (body.collection !== undefined) out.collection = body.collection
  if (body.brand !== undefined) out.brand = body.brand
  if (body.images !== undefined) out.images = body.images
  if (body.description !== undefined) out.description = body.description
  if (body.features !== undefined) out.features = body.features
  if (body.specs !== undefined) out.specs = body.specs
  if (body.variants !== undefined) out.variants = body.variants
  if (body.stock !== undefined) out.stock = Number(body.stock)
  if (body.featured !== undefined) out.featured = !!body.featured
  if (body.bestSeller !== undefined) out.best_seller = !!body.bestSeller
  if (body.newArrival !== undefined) out.new_arrival = !!body.newArrival
  if (body.limitedEdition !== undefined) out.limited_edition = !!body.limitedEdition
  if (body.badges !== undefined) out.badges = body.badges
  return out
}
function orderToApi(row) {
  if (!row) return row
  return {
    _id: row.id, orderId: row.order_id, userId: row.user_id, email: row.email,
    items: row.items || [], shipping: row.shipping, subtotal: Number(row.subtotal),
    shippingCost: Number(row.shipping_cost), tax: Number(row.tax), total: Number(row.total),
    paymentMethod: row.payment_method, couponCode: row.coupon_code, discount: Number(row.discount || 0),
    status: row.status, paymentStatus: row.payment_status, createdAt: row.created_at,
  }
}
function couponToApi(row) {
  if (!row) return row
  return {
    _id: row.id, code: row.code, type: row.type, value: Number(row.value),
    minSubtotal: Number(row.min_subtotal || 0), usageLimit: row.usage_limit, usageCount: row.usage_count,
    active: row.active, expiresAt: row.expires_at, createdAt: row.created_at,
  }
}
function postToApi(row) {
  if (!row) return row
  return {
    _id: row.id, slug: row.slug, title: row.title, excerpt: row.excerpt, content: row.content,
    coverImage: row.cover_image, author: row.author, published: row.published, createdAt: row.created_at,
  }
}

// ---------------------------------------------------------------------------
// Seed catalog on first run (idempotent)
// ---------------------------------------------------------------------------
async function ensureSeeded() {
  const { count } = await db.from('products').select('*', { count: 'exact', head: true })
  if (!count) {
    await db.from('categories').upsert(CATEGORIES.map(c => ({ id: c.id, name: c.name, slug: c.slug, description: c.description })))
    await db.from('collections').upsert(COLLECTIONS.map(c => ({ id: c.id, name: c.name, slug: c.slug, tagline: c.tagline, image: c.image })))
    await db.from('products').upsert(PRODUCTS.map(p => ({
      slug: p.slug, name: p.name, tagline: p.tagline, price: p.price, compare_at_price: p.compareAtPrice,
      currency: p.currency, category: p.category, collection: p.collection, brand: p.brand,
      images: p.images, description: p.description, features: p.features, specs: p.specs, variants: p.variants,
      stock: p.stock, rating: p.rating, review_count: p.reviewCount, featured: p.featured, best_seller: p.bestSeller,
      new_arrival: p.newArrival, limited_edition: p.limitedEdition, badges: p.badges,
    })), { onConflict: 'slug' })
    await db.from('testimonials').insert(TESTIMONIALS.map(t => ({ name: t.name, title: t.title, rating: t.rating, text: t.text })))
  }
}

async function getUser() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch { return null }
}

async function isAdmin(user) {
  if (!user) return false
  if (ADMIN_EMAILS.includes(user.email) || user.user_metadata?.role === 'admin') return true
  const { data } = await db.from('profiles').select('role').eq('id', user.id).maybeSingle()
  return data?.role === 'admin'
}

async function handle(request, { params }) {
  const path = (await params).path || []
  const route = path.join('/')
  const method = request.method

  try {
    await ensureSeeded()

    // Health
    if (route === '' || route === 'health') return NextResponse.json({ ok: true, service: 'Auverra API' })

    // Current user
    if (route === 'me' && method === 'GET') {
      const user = await getUser()
      if (!user) return NextResponse.json({ user: null })
      return NextResponse.json({ user: { id: user.id, email: user.email, name: user.user_metadata?.name || user.email?.split('@')[0], role: (await isAdmin(user)) ? 'admin' : 'user' } })
    }

    // Auth
    if (route === 'auth/signup' && method === 'POST') {
      const { email, password, name } = await request.json()
      const supabase = await createClient()
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } })
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ user: data.user, session: data.session })
    }
    if (route === 'auth/login' && method === 'POST') {
      const { email, password } = await request.json()
      const supabase = await createClient()
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ user: data.user })
    }
    if (route === 'auth/logout' && method === 'POST') {
      const supabase = await createClient()
      await supabase.auth.signOut()
      return NextResponse.json({ ok: true })
    }

    // Products list
    if (route === 'products' && method === 'GET') {
      const { searchParams } = new URL(request.url)
      const category = searchParams.get('category')
      const collection = searchParams.get('collection')
      const search = searchParams.get('search')
      const sort = searchParams.get('sort') || 'featured'
      const minPrice = parseInt(searchParams.get('minPrice') || '0')
      const maxPrice = parseInt(searchParams.get('maxPrice') || '99999999')

      let q = db.from('products').select('*').gte('price', minPrice).lte('price', maxPrice)
      if (category) q = q.eq('category', category)
      if (collection) q = q.eq('collection', collection)
      if (search) q = q.or(`name.ilike.%${search}%,tagline.ilike.%${search}%,description.ilike.%${search}%`)
      const { data, error } = await q
      if (error) throw error
      let items = data.map(productToApi)
      const sortMap = {
        'price-asc': (a, b) => a.price - b.price,
        'price-desc': (a, b) => b.price - a.price,
        'rating': (a, b) => b.rating - a.rating,
        'newest': (a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0),
        'featured': (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0),
      }
      items.sort(sortMap[sort] || sortMap.featured)
      return NextResponse.json({ items })
    }

    if (route === 'products/featured' && method === 'GET') {
      const { data, error } = await db.from('products').select('*').eq('featured', true).limit(6)
      if (error) throw error
      return NextResponse.json({ items: data.map(productToApi) })
    }
    if (route === 'products/bestsellers' && method === 'GET') {
      const { data, error } = await db.from('products').select('*').eq('best_seller', true).limit(4)
      if (error) throw error
      return NextResponse.json({ items: data.map(productToApi) })
    }
    if (route === 'products/new' && method === 'GET') {
      const { data, error } = await db.from('products').select('*').eq('new_arrival', true).limit(4)
      if (error) throw error
      return NextResponse.json({ items: data.map(productToApi) })
    }

    // Product by slug
    if (path[0] === 'products' && path.length === 2 && method === 'GET') {
      const slug = path[1]
      const { data: product } = await db.from('products').select('*').eq('slug', slug).maybeSingle()
      if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      const { data: related } = await db.from('products').select('*').eq('category', product.category).neq('slug', slug).limit(4)
      return NextResponse.json({ product: productToApi(product), related: (related || []).map(productToApi) })
    }

    // Categories & Collections
    if (route === 'categories' && method === 'GET') {
      const { data } = await db.from('categories').select('*')
      return NextResponse.json({ items: data || [] })
    }
    if (route === 'collections' && method === 'GET') {
      const { data } = await db.from('collections').select('*')
      return NextResponse.json({ items: data || [] })
    }
    if (route === 'testimonials' && method === 'GET') {
      const { data } = await db.from('testimonials').select('*')
      return NextResponse.json({ items: data || [] })
    }

    // Cart
    if (route === 'cart') {
      const user = await getUser()
      if (!user) return NextResponse.json({ items: [] })
      const { data: doc } = await db.from('carts').select('*').eq('user_id', user.id).maybeSingle()
      if (method === 'GET') return NextResponse.json({ items: doc?.items || [] })
      const body = method !== 'GET' ? await request.json() : {}
      let items = doc?.items || []
      if (method === 'POST') {
        const existing = items.find(i => i.productId === body.productId && JSON.stringify(i.variant) === JSON.stringify(body.variant))
        if (existing) existing.quantity += (body.quantity || 1)
        else items.push(body)
      } else if (method === 'PUT') {
        items = items.map(i => (i.productId === body.productId && JSON.stringify(i.variant) === JSON.stringify(body.variant)) ? { ...i, quantity: body.quantity } : i)
      } else if (method === 'DELETE') {
        items = items.filter(i => !(i.productId === body.productId && JSON.stringify(i.variant) === JSON.stringify(body.variant)))
      }
      await db.from('carts').upsert({ user_id: user.id, items, updated_at: new Date().toISOString() })
      return NextResponse.json({ items })
    }

    // Wishlist
    if (route === 'wishlist') {
      const user = await getUser()
      if (!user) return NextResponse.json({ items: [] })
      const { data: doc } = await db.from('wishlists').select('*').eq('user_id', user.id).maybeSingle()
      if (method === 'GET') return NextResponse.json({ items: doc?.items || [] })
      const body = await request.json()
      let items = doc?.items || []
      if (method === 'POST') { if (!items.some(i => i.productId === body.productId)) items.push(body) }
      else if (method === 'DELETE') { items = items.filter(i => i.productId !== body.productId) }
      await db.from('wishlists').upsert({ user_id: user.id, items, updated_at: new Date().toISOString() })
      return NextResponse.json({ items })
    }

    // Orders
    if (route === 'orders' && method === 'POST') {
      const user = await getUser()
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      const body = await request.json()
      const orderId = 'AV-' + Date.now().toString(36).toUpperCase()
      const row = {
        order_id: orderId, user_id: user.id, email: user.email, items: body.items, shipping: body.shipping,
        subtotal: body.subtotal, shipping_cost: body.shippingCost || 0, tax: body.tax || 0, total: body.total,
        payment_method: body.paymentMethod || 'cod', coupon_code: body.couponCode || null, discount: body.discount || 0,
        status: 'pending', payment_status: 'pending',
      }
      const { data, error } = await db.from('orders').insert(row).select().single()
      if (error) throw error
      await db.from('carts').upsert({ user_id: user.id, items: [], updated_at: new Date().toISOString() })
      if (body.couponCode) {
        const { data: c } = await db.from('coupons').select('usage_count').eq('code', body.couponCode.toUpperCase()).maybeSingle()
        if (c) await db.from('coupons').update({ usage_count: (c.usage_count || 0) + 1 }).eq('code', body.couponCode.toUpperCase())
      }
      return NextResponse.json({ order: orderToApi(data) })
    }
    if (route === 'orders' && method === 'GET') {
      const user = await getUser()
      if (!user) return NextResponse.json({ items: [] })
      const { data } = await db.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      return NextResponse.json({ items: (data || []).map(orderToApi) })
    }

    // Newsletter
    if (route === 'newsletter' && method === 'POST') {
      const { email } = await request.json()
      if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })
      await db.from('newsletter_subscribers').upsert({ email, subscribed_at: new Date().toISOString() })
      return NextResponse.json({ ok: true })
    }

    // Contact
    if (route === 'contact' && method === 'POST') {
      const body = await request.json()
      await db.from('contacts').insert({ name: body.name, email: body.email, subject: body.subject, message: body.message })
      return NextResponse.json({ ok: true })
    }

    // Reviews
    if (path[0] === 'reviews' && path[1] && method === 'GET') {
      const { data } = await db.from('reviews').select('*').eq('product_slug', path[1]).order('created_at', { ascending: false })
      return NextResponse.json({ items: (data || []).map(r => ({ _id: r.id, userId: r.user_id, userName: r.user_name, productSlug: r.product_slug, rating: r.rating, title: r.title, comment: r.comment, createdAt: r.created_at })) })
    }
    if (route === 'reviews' && method === 'POST') {
      const user = await getUser()
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      const body = await request.json()
      const row = { user_id: user.id, user_name: user.user_metadata?.name || user.email?.split('@')[0], product_slug: body.productSlug, rating: body.rating, title: body.title, comment: body.comment }
      const { data, error } = await db.from('reviews').insert(row).select().single()
      if (error) throw error
      return NextResponse.json({ review: { _id: data.id, ...row } })
    }

    // Admin: stats
    if (route === 'admin/stats' && method === 'GET') {
      const user = await getUser()
      if (!(await isAdmin(user))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      const [{ count: productCount }, { count: orderCount }, { count: userCount }, { count: newsletterCount }, { data: orders }] = await Promise.all([
        db.from('products').select('*', { count: 'exact', head: true }),
        db.from('orders').select('*', { count: 'exact', head: true }),
        db.from('profiles').select('*', { count: 'exact', head: true }),
        db.from('newsletter_subscribers').select('*', { count: 'exact', head: true }),
        db.from('orders').select('*').order('created_at', { ascending: false }),
      ])
      const totalRevenue = (orders || []).reduce((s, o) => s + Number(o.total || 0), 0)
      const recentOrders = (orders || []).slice(0, 5).map(o => ({ orderId: o.order_id, total: Number(o.total), status: o.status, createdAt: o.created_at, email: o.email }))
      return NextResponse.json({ productCount, orderCount, userCount, newsletterCount, totalRevenue, recentOrders })
    }

    if (route === 'admin/products' && method === 'GET') {
      const user = await getUser()
      if (!(await isAdmin(user))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      const { data } = await db.from('products').select('*')
      return NextResponse.json({ items: (data || []).map(productToApi) })
    }
    if (route === 'admin/products' && method === 'POST') {
      const user = await getUser()
      if (!(await isAdmin(user))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      const body = await request.json()
      if (!body.slug || !body.name) return NextResponse.json({ error: 'slug and name required' }, { status: 400 })
      const { data: existing } = await db.from('products').select('slug').eq('slug', body.slug).maybeSingle()
      if (existing) return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
      const row = productFromApi(body)
      row.images = row.images?.length ? row.images : ['https://images.unsplash.com/photo-1600003014637-ff82a275e191']
      const { data, error } = await db.from('products').insert(row).select().single()
      if (error) throw error
      return NextResponse.json({ product: productToApi(data) })
    }
    if (path[0] === 'admin' && path[1] === 'products' && path[2] && method === 'PUT') {
      const user = await getUser()
      if (!(await isAdmin(user))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      const body = await request.json()
      const row = productFromApi(body)
      delete row.slug
      const { error } = await db.from('products').update(row).eq('slug', path[2])
      if (error) throw error
      return NextResponse.json({ ok: true })
    }
    if (path[0] === 'admin' && path[1] === 'products' && path[2] && method === 'DELETE') {
      const user = await getUser()
      if (!(await isAdmin(user))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      await db.from('products').delete().eq('slug', path[2])
      return NextResponse.json({ ok: true })
    }

    // Admin: orders
    if (route === 'admin/orders' && method === 'GET') {
      const user = await getUser()
      if (!(await isAdmin(user))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      const { data } = await db.from('orders').select('*').order('created_at', { ascending: false })
      return NextResponse.json({ items: (data || []).map(orderToApi) })
    }
    if (path[0] === 'admin' && path[1] === 'orders' && path[2] && method === 'PUT') {
      const user = await getUser()
      if (!(await isAdmin(user))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      const body = await request.json()
      const row = {}
      if (body.status) row.status = body.status
      if (body.paymentStatus) row.payment_status = body.paymentStatus
      await db.from('orders').update(row).eq('order_id', path[2])
      return NextResponse.json({ ok: true })
    }

    // Coupons: public validate
    if (route === 'coupons/validate' && method === 'POST') {
      const { code, subtotal } = await request.json()
      const { data: coupon } = await db.from('coupons').select('*').eq('code', (code || '').toUpperCase()).maybeSingle()
      if (!coupon || coupon.active === false) return NextResponse.json({ error: 'Invalid coupon' }, { status: 404 })
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return NextResponse.json({ error: 'Coupon expired' }, { status: 400 })
      if (coupon.min_subtotal && subtotal < coupon.min_subtotal) return NextResponse.json({ error: `Minimum order ₹${Number(coupon.min_subtotal).toLocaleString('en-IN')} required` }, { status: 400 })
      if (coupon.usage_limit && (coupon.usage_count || 0) >= coupon.usage_limit) return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 })
      const discount = coupon.type === 'percent' ? Math.round((subtotal * coupon.value) / 100) : Number(coupon.value)
      return NextResponse.json({ coupon: { code: coupon.code, type: coupon.type, value: Number(coupon.value), discount: Math.min(discount, subtotal) } })
    }

    // Admin: coupons CRUD
    if (route === 'admin/coupons' && method === 'GET') {
      const user = await getUser()
      if (!(await isAdmin(user))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      const { data } = await db.from('coupons').select('*').order('created_at', { ascending: false })
      return NextResponse.json({ items: (data || []).map(couponToApi) })
    }
    if (route === 'admin/coupons' && method === 'POST') {
      const user = await getUser()
      if (!(await isAdmin(user))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      const body = await request.json()
      if (!body.code || !body.value) return NextResponse.json({ error: 'code and value required' }, { status: 400 })
      const code = body.code.toUpperCase()
      const { data: existing } = await db.from('coupons').select('id').eq('code', code).maybeSingle()
      if (existing) return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 })
      const row = { code, type: body.type === 'flat' ? 'flat' : 'percent', value: Number(body.value), min_subtotal: body.minSubtotal ? Number(body.minSubtotal) : 0, usage_limit: body.usageLimit ? Number(body.usageLimit) : 0, usage_count: 0, active: true, expires_at: body.expiresAt || null }
      const { data, error } = await db.from('coupons').insert(row).select().single()
      if (error) throw error
      return NextResponse.json({ coupon: couponToApi(data) })
    }
    if (path[0] === 'admin' && path[1] === 'coupons' && path[2] && method === 'PUT') {
      const user = await getUser()
      if (!(await isAdmin(user))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      const body = await request.json()
      const row = {}
      if (body.active !== undefined) row.active = body.active
      if (body.value !== undefined) row.value = Number(body.value)
      if (body.usageLimit !== undefined) row.usage_limit = Number(body.usageLimit)
      if (body.expiresAt !== undefined) row.expires_at = body.expiresAt
      await db.from('coupons').update(row).eq('id', path[2])
      return NextResponse.json({ ok: true })
    }
    if (path[0] === 'admin' && path[1] === 'coupons' && path[2] && method === 'DELETE') {
      const user = await getUser()
      if (!(await isAdmin(user))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      await db.from('coupons').delete().eq('id', path[2])
      return NextResponse.json({ ok: true })
    }

    // Blog: public
    if (route === 'blog' && method === 'GET') {
      const { data } = await db.from('blog_posts').select('*').eq('published', true).order('created_at', { ascending: false })
      return NextResponse.json({ items: (data || []).map(postToApi) })
    }
    if (path[0] === 'blog' && path[1] && method === 'GET') {
      const { data: post } = await db.from('blog_posts').select('*').eq('slug', path[1]).eq('published', true).maybeSingle()
      if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      return NextResponse.json({ post: postToApi(post) })
    }

    // Admin: blog CRUD
    if (route === 'admin/blog' && method === 'GET') {
      const user = await getUser()
      if (!(await isAdmin(user))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      const { data } = await db.from('blog_posts').select('*').order('created_at', { ascending: false })
      return NextResponse.json({ items: (data || []).map(postToApi) })
    }
    if (route === 'admin/blog' && method === 'POST') {
      const user = await getUser()
      if (!(await isAdmin(user))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      const body = await request.json()
      if (!body.title) return NextResponse.json({ error: 'title required' }, { status: 400 })
      const slug = (body.slug || body.title).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const { data: existing } = await db.from('blog_posts').select('id').eq('slug', slug).maybeSingle()
      if (existing) return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
      const row = { slug, title: body.title, excerpt: body.excerpt || '', content: body.content || '', cover_image: body.coverImage || '', author: body.author || 'Auverra Editorial', published: body.published !== false }
      const { data, error } = await db.from('blog_posts').insert(row).select().single()
      if (error) throw error
      return NextResponse.json({ post: postToApi(data) })
    }
    if (path[0] === 'admin' && path[1] === 'blog' && path[2] && method === 'PUT') {
      const user = await getUser()
      if (!(await isAdmin(user))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      const body = await request.json()
      const row = {}
      if (body.title !== undefined) row.title = body.title
      if (body.excerpt !== undefined) row.excerpt = body.excerpt
      if (body.content !== undefined) row.content = body.content
      if (body.coverImage !== undefined) row.cover_image = body.coverImage
      if (body.published !== undefined) row.published = body.published
      await db.from('blog_posts').update(row).eq('id', path[2])
      return NextResponse.json({ ok: true })
    }
    if (path[0] === 'admin' && path[1] === 'blog' && path[2] && method === 'DELETE') {
      const user = await getUser()
      if (!(await isAdmin(user))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      await db.from('blog_posts').delete().eq('id', path[2])
      return NextResponse.json({ ok: true })
    }

    // Admin: payment gateway settings
    if (route === 'admin/payments' && method === 'GET') {
      const user = await getUser()
      if (!(await isAdmin(user))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      const { data } = await db.from('payment_settings').select('*')
      const gateways = {}
      for (const row of data || []) gateways[row.gateway] = { enabled: row.enabled, mode: row.mode, fields: row.fields, updatedAt: row.updated_at }
      return NextResponse.json({ gateways })
    }
    if (route === 'admin/payments' && method === 'POST') {
      const user = await getUser()
      if (!(await isAdmin(user))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      const body = await request.json() // { gateway, enabled, mode, fields }
      await db.from('payment_settings').upsert({ gateway: body.gateway, enabled: !!body.enabled, mode: body.mode || 'test', fields: body.fields || {} })
      const { data } = await db.from('payment_settings').select('*')
      const gateways = {}
      for (const row of data || []) gateways[row.gateway] = { enabled: row.enabled, mode: row.mode, fields: row.fields }
      return NextResponse.json({ ok: true, gateways })
    }

    // Addresses
    if (route === 'addresses' && method === 'GET') {
      const user = await getUser()
      if (!user) return NextResponse.json({ items: [] })
      const { data } = await db.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false }).order('created_at', { ascending: false })
      return NextResponse.json({ items: (data || []).map(a => ({ _id: a.id, label: a.label, fullName: a.full_name, phone: a.phone, line1: a.line1, line2: a.line2, city: a.city, state: a.state, postalCode: a.postal_code, country: a.country, isDefault: a.is_default })) })
    }
    if (route === 'addresses' && method === 'POST') {
      const user = await getUser()
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      const body = await request.json()
      if (body.isDefault) await db.from('addresses').update({ is_default: false }).eq('user_id', user.id)
      const row = { user_id: user.id, label: body.label || 'Home', full_name: body.fullName, phone: body.phone, line1: body.line1, line2: body.line2 || '', city: body.city, state: body.state, postal_code: body.postalCode, country: body.country || 'India', is_default: !!body.isDefault }
      const { data, error } = await db.from('addresses').insert(row).select().single()
      if (error) throw error
      return NextResponse.json({ address: { _id: data.id } })
    }
    if (path[0] === 'addresses' && path[1] && method === 'PUT') {
      const user = await getUser()
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      const body = await request.json()
      if (body.isDefault) await db.from('addresses').update({ is_default: false }).eq('user_id', user.id)
      const row = {}
      const map = { label: 'label', fullName: 'full_name', phone: 'phone', line1: 'line1', line2: 'line2', city: 'city', state: 'state', postalCode: 'postal_code', country: 'country', isDefault: 'is_default' }
      for (const [k, v] of Object.entries(map)) if (body[k] !== undefined) row[v] = body[k]
      await db.from('addresses').update(row).eq('id', path[1]).eq('user_id', user.id)
      return NextResponse.json({ ok: true })
    }
    if (path[0] === 'addresses' && path[1] && method === 'DELETE') {
      const user = await getUser()
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      await db.from('addresses').delete().eq('id', path[1]).eq('user_id', user.id)
      return NextResponse.json({ ok: true })
    }

    // Account: update profile name
    if (route === 'account/profile' && method === 'PUT') {
      const user = await getUser()
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      const { name } = await request.json()
      await db.from('profiles').update({ name }).eq('id', user.id)
      const { error } = await db.auth.admin.updateUserById(user.id, { user_metadata: { ...user.user_metadata, name } })
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Not found', route }, { status: 404 })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const DELETE = handle
export const PATCH = handle
