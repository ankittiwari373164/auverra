'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'

function ShopContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [collections, setCollections] = useState([])
  const [brands, setBrands] = useState([])
  const [filterOpen, setFilterOpen] = useState(false)
  const [priceRange, setPriceRange] = useState([0, Number(searchParams.get('maxPrice')) || 2000000])
  const [sort, setSort] = useState(searchParams.get('sort') || 'featured')

  const category = searchParams.get('category') || ''
  const collection = searchParams.get('collection') || ''
  const brand = searchParams.get('brand') || ''
  const search = searchParams.get('search') || ''

  useEffect(() => {
    setLoading(true)
    const q = new URLSearchParams()
    if (category) q.set('category', category)
    if (collection) q.set('collection', collection)
    if (brand && brand !== 'all') q.set('brand', brand)
    if (search) q.set('search', search)
    q.set('sort', sort)
    q.set('minPrice', priceRange[0])
    q.set('maxPrice', priceRange[1])
    fetch(`/api/products?${q}`).then(r => r.json()).then(d => { setProducts(d.items || []); setLoading(false) })
  }, [category, collection, brand, search, sort, priceRange])

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.items || []))
    fetch('/api/collections').then(r => r.json()).then(d => setCollections(d.items || []))
    fetch('/api/products').then(r => r.json()).then(d => setBrands([...new Set((d.items || []).map(p => p.brand).filter(Boolean))].sort()))
  }, [])

  const setFilter = (key, value) => {
    const p = new URLSearchParams(searchParams.toString())
    if (value) p.set(key, value); else p.delete(key)
    router.push(`/shop?${p.toString()}`)
  }

  const activeCat = categories.find(c => c.slug === category)
  const activeCol = collections.find(c => c.slug === collection)

  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />

      {/* Header */}
      <div className="relative pt-32 pb-16 border-b border-gold/10 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(ellipse at top, rgba(201,169,97,0.3) 0%, transparent 60%)' }} />
        <div className="container-lux relative">
          <div className="text-center">
            <div className="divider-gold w-24 mx-auto mb-6" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4 block">The Collection</span>
            <h1 className="text-5xl md:text-7xl font-serif text-gradient-gold mb-4">
              {activeCol?.name || activeCat?.name || (search ? `"${search}"` : 'All Timepieces')}
            </h1>
            <p className="text-platinum-light/60 max-w-xl mx-auto">{activeCol?.tagline || activeCat?.description || 'Every Auverra timepiece is handcrafted with obsessive attention to detail.'}</p>
          </div>
        </div>
      </div>

      <div className="container-lux py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-12">
          {/* Sidebar */}
          <aside className={`${filterOpen ? 'fixed inset-0 z-50 bg-obsidian p-6 overflow-y-auto lg:relative lg:p-0 lg:overflow-visible' : 'hidden lg:block'}`}>
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <h3 className="text-lg font-serif text-gold">Filters</h3>
              <button onClick={() => setFilterOpen(false)}><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-gold mb-4">Categories</h3>
                <ul className="space-y-2">
                  <li><button onClick={() => setFilter('category', '')} className={`text-sm ${!category ? 'text-gold' : 'text-platinum-light/70 hover:text-gold'}`}>All Categories</button></li>
                  {categories.map(c => (
                    <li key={c.slug}><button onClick={() => setFilter('category', c.slug)} className={`text-sm ${category === c.slug ? 'text-gold' : 'text-platinum-light/70 hover:text-gold'}`}>{c.name}</button></li>
                  ))}
                </ul>
              </div>

              {brands.length > 0 && (
                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.3em] text-gold mb-4">Brand</h3>
                  <ul className="space-y-2">
                    <li><button onClick={() => setFilter('brand', '')} className={`text-sm ${!brand ? 'text-gold' : 'text-platinum-light/70 hover:text-gold'}`}>All Brands</button></li>
                    {brands.map(b => (
                      <li key={b}><button onClick={() => setFilter('brand', b)} className={`text-sm ${brand === b ? 'text-gold' : 'text-platinum-light/70 hover:text-gold'}`}>{b}</button></li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-gold mb-4">Collections</h3>
                <ul className="space-y-2">
                  <li><button onClick={() => setFilter('collection', '')} className={`text-sm ${!collection ? 'text-gold' : 'text-platinum-light/70 hover:text-gold'}`}>All Collections</button></li>
                  {collections.map(c => (
                    <li key={c.slug}><button onClick={() => setFilter('collection', c.slug)} className={`text-sm ${collection === c.slug ? 'text-gold' : 'text-platinum-light/70 hover:text-gold'}`}>{c.name}</button></li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-gold mb-4">Price Range</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-platinum-light/70">
                    <span>₹{(priceRange[0]/100000).toFixed(1)}L</span>
                    <span>₹{(priceRange[1]/100000).toFixed(1)}L</span>
                  </div>
                  <input type="range" min="0" max="2000000" step="50000" value={priceRange[1]} onChange={e => setPriceRange([0, parseInt(e.target.value)])} className="w-full accent-gold" />
                </div>
              </div>
            </div>
          </aside>

          {/* Products */}
          <main>
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => setFilterOpen(true)} className="lg:hidden flex items-center gap-2 text-sm text-gold">
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
              <div className="text-sm text-platinum-light/60">{products.length} timepieces</div>
              <div className="relative">
                <select value={sort} onChange={e => setSort(e.target.value)} className="appearance-none bg-obsidian-700 border border-gold/20 pl-4 pr-10 py-2 text-sm text-platinum-light focus:outline-none focus:border-gold">
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gold pointer-events-none" />
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => <div key={i} className="aspect-[4/5] bg-obsidian-700 shimmer rounded-sm" />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-serif text-2xl text-platinum-light mb-4">No timepieces found</p>
                <p className="text-platinum-light/60 mb-8">Try adjusting your filters</p>
                <button onClick={() => router.push('/shop')} className="btn-outline-gold">Reset Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map(p => <ProductCard key={p.slug} product={p} />)}
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default function ShopPage() {
  return <Suspense fallback={<div className="min-h-screen bg-obsidian" />}><ShopContent /></Suspense>
}