'use client'
import { useEffect, useState, use } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { useApp } from '@/app/providers'
import { toast } from 'sonner'
import { Heart, ShoppingBag, Truck, Shield, RotateCcw, Award, Minus, Plus, Star, Check, MessageCircle, Lock, ThumbsUp } from 'lucide-react'
import Link from 'next/link'

export default function ProductDetailPage({ params }) {
  const { slug } = use(params)
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedDial, setSelectedDial] = useState(null)
  const [selectedStrap, setSelectedStrap] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [tab, setTab] = useState('description')
  const [zoom, setZoom] = useState({ x: 50, y: 50, active: false })
  const [reviews, setReviews] = useState([])
  const [addingReview, setAddingReview] = useState(false)
  const [reviewData, setReviewData] = useState({ rating: 5, title: '', comment: '' })
  const { addToCart, toggleWishlist, wishlist, user } = useApp() || {}
  const [viewerCount, setViewerCount] = useState(null)

  useEffect(() => {
    // Stable-ish "people viewing" count seeded from the slug so it doesn't jump
    // around on every render, with a small periodic drift for realism.
    let seed = 0
    for (const c of slug) seed = (seed * 31 + c.charCodeAt(0)) % 1000
    const base = 8 + (seed % 33) // 8–40
    setViewerCount(base)
    const interval = setInterval(() => {
      setViewerCount(v => Math.max(6, Math.min(45, v + (Math.random() > 0.5 ? 1 : -1))))
    }, 8000)
    return () => clearInterval(interval)
  }, [slug])

  useEffect(() => {
    fetch(`/api/products/${slug}`).then(r => r.json()).then(d => {
      setProduct(d.product); setRelated(d.related || [])
      const colors = d.product?.variants?.dial || []
      setSelectedDial(colors.length === 1 ? 0 : null)
    })
    fetch(`/api/reviews/${slug}`).then(r => r.json()).then(d => setReviews(d.items || []))
  }, [slug])

  useEffect(() => { setSelectedImage(0) }, [selectedDial])

  if (!product) return <div className="min-h-screen bg-obsidian"><Navbar /><div className="pt-32 container-lux"><div className="aspect-square bg-obsidian-700 shimmer rounded-sm max-w-3xl" /></div></div>

  const inWishlist = wishlist?.some(w => w.productId === product._id)
  const colors = product.variants?.dial || []
  const activeColor = selectedDial != null ? colors[selectedDial] : null
  const galleryImages = activeColor?.images?.length ? activeColor.images : product.images
  const displayPrice = activeColor?.price ?? product.price
  const displayCompareAt = activeColor?.compareAtPrice ?? product.compareAtPrice
  const variant = {
    dial: activeColor ? { name: activeColor.name, hex: activeColor.hex } : undefined,
    strap: product.variants?.strap?.[selectedStrap],
  }

  const handleAdd = () => {
    if (colors.length > 1 && selectedDial == null) { toast.error('Please select a color'); return }
    const cartProduct = { ...product, price: displayPrice, compareAtPrice: displayCompareAt, images: galleryImages }
    addToCart(cartProduct, variant, quantity)
    toast.success(`${product.name} added to bag`)
  }

  const submitReview = async () => {
    if (!user) { toast.error('Please login to leave a review'); return }
    const res = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productSlug: slug, ...reviewData }) })
    if (res.ok) {
      toast.success('Review submitted')
      setAddingReview(false)
      fetch(`/api/reviews/${slug}`).then(r => r.json()).then(d => setReviews(d.items || []))
      setReviewData({ rating: 5, title: '', comment: '' })
    }
  }

  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <div className="pt-32 pb-20">
        <div className="container-lux">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-platinum-light/50 mb-8">
            <Link href="/" className="hover:text-gold">Home</Link> / <Link href="/shop" className="hover:text-gold">Shop</Link> / <span className="text-gold">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Image Gallery */}
            <div>
              <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-obsidian-700 to-obsidian-900 mb-4 group"
                onMouseMove={e => { const r = e.currentTarget.getBoundingClientRect(); setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, active: true }) }}
                onMouseLeave={() => setZoom({ ...zoom, active: false })}>
                <img src={galleryImages[selectedImage] + '?auto=format&fit=crop&w=1400&q=90'} alt={product.name} className="w-full h-full object-cover transition-transform duration-500" style={zoom.active ? { transform: `scale(2)`, transformOrigin: `${zoom.x}% ${zoom.y}%` } : {}} />
                {product.badges?.map((b, i) => <div key={i} className="absolute top-6 left-6 px-3 py-1 bg-gold text-obsidian text-[10px] uppercase tracking-[0.2em] font-bold">{b}</div>)}
              </div>
              <div className="grid grid-cols-4 gap-3">
                {galleryImages.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)} className={`relative aspect-square overflow-hidden border-2 transition ${selectedImage === i ? 'border-gold' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={img + '?auto=format&fit=crop&w=300&q=80'} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="lg:pt-4">
              <div className="text-[10px] uppercase tracking-[0.3em] text-gold mb-3">{product.category} • {product.collection}</div>
              <h1 className="text-4xl md:text-5xl font-serif text-gradient-gold mb-3">{product.name}</h1>
              <p className="text-lg italic text-platinum-light/70 mb-6">{product.tagline}</p>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex gap-1">{[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-gold text-gold' : 'text-platinum-light/30'}`} />)}</div>
                <span className="text-sm text-platinum-light/60">{product.rating} ({product.reviewCount} reviews)</span>
              </div>

              <div className="flex items-baseline gap-4 mb-8 pb-8 border-b border-gold/10">
                <span className="text-4xl font-serif text-gradient-gold">₹{displayPrice.toLocaleString('en-IN')}</span>
                {displayCompareAt && <span className="text-lg text-platinum-light/40 line-through">₹{displayCompareAt.toLocaleString('en-IN')}</span>}
                {displayCompareAt && <span className="text-xs text-rosegold uppercase tracking-widest">Save ₹{(displayCompareAt - displayPrice).toLocaleString('en-IN')}</span>}
              </div>

              {colors.length > 0 && (
                <div className="mb-6">
                  <div className="text-xs uppercase tracking-[0.25em] text-gold mb-3">
                    Color{activeColor ? <>: <span className="text-platinum-light/70 normal-case tracking-normal">{activeColor.name}</span></> : colors.length > 1 ? <span className="text-rosegold normal-case tracking-normal ml-1">— please select</span> : null}
                  </div>
                  <div className="flex gap-3">
                    {colors.map((d, i) => (
                      <button key={i} onClick={() => setSelectedDial(i)} title={d.name} className={`w-11 h-11 rounded-full border-2 transition ${selectedDial === i ? 'border-gold scale-110' : 'border-platinum-light/20 hover:border-gold/50'}`} style={{ background: d.hex }} />
                    ))}
                  </div>
                </div>
              )}

              {product.variants?.strap && (
                <div className="mb-8">
                  <div className="text-xs uppercase tracking-[0.25em] text-gold mb-3">Strap</div>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.strap.map((s, i) => (
                      <button key={i} onClick={() => setSelectedStrap(i)} className={`px-4 py-2 text-xs border transition ${selectedStrap === i ? 'border-gold bg-gold/10 text-gold' : 'border-platinum-light/20 text-platinum-light/70 hover:border-gold/50'}`}>{s.name}</button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-gold/30">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-gold/10 transition"><Minus className="w-3 h-3" /></button>
                  <span className="px-6 text-sm">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-gold/10 transition"><Plus className="w-3 h-3" /></button>
                </div>
                <div className="flex items-center gap-2 text-xs text-platinum-light/60">
                  <Check className="w-3 h-3 text-green-400" /> In stock — {product.stock} available
                </div>
              </div>

              {viewerCount != null && (
                <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 bg-gold/10 border border-gold/20 text-xs text-gold rounded-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> {viewerCount} people are viewing this product
                </div>
              )}

              <div className="flex gap-3 mb-3">
                <button onClick={handleAdd} className={`btn-gold flex-1 inline-flex items-center justify-center gap-2 ${colors.length > 1 && selectedDial == null ? 'opacity-60' : ''}`}><ShoppingBag className="w-4 h-4" /> Add to Bag</button>
                <button onClick={() => toggleWishlist?.(product)} className={`w-14 h-14 border ${inWishlist ? 'bg-gold border-gold text-obsidian' : 'border-gold/40 text-gold hover:bg-gold/10'} flex items-center justify-center transition`}><Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} /></button>
              </div>
              <a
                href={`https://wa.me/912249001897?text=${encodeURIComponent(`Hi Auverra Watches! I'm interested in the ${product.name}${activeColor ? ` (${activeColor.name})` : ''} — ₹${displayPrice.toLocaleString('en-IN')}. Is it available?`)}`}
                target="_blank" rel="noopener noreferrer"
                className="mb-8 w-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-bold py-3.5 rounded-sm inline-flex items-center justify-center gap-2 transition"
              >
                <MessageCircle className="w-4 h-4" /> Order on WhatsApp
              </a>

              <div className="grid grid-cols-2 gap-3 pt-8 border-t border-gold/10">
                {[
                  { icon: Truck, label: 'Fast & Free Shipping' },
                  { icon: RotateCcw, label: 'Easy Exchange on Defect' },
                  { icon: Lock, label: 'Secure Checkout' },
                  { icon: ThumbsUp, label: 'Satisfaction Guaranteed' },
                ].map(({ icon: Icon, label }, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-platinum-light/70">
                    <Icon className="w-4 h-4 text-gold" /> {label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-24">
            <div className="flex gap-8 border-b border-gold/10 mb-10 overflow-x-auto">
              {[['description', 'Description'], ['specs', 'Specifications'], ['features', 'Features'], ['reviews', `Reviews (${reviews.length})`]].map(([key, label]) => (
                <button key={key} onClick={() => setTab(key)} className={`pb-4 text-xs uppercase tracking-[0.25em] whitespace-nowrap transition ${tab === key ? 'text-gold border-b-2 border-gold' : 'text-platinum-light/50 hover:text-gold'}`}>{label}</button>
              ))}
            </div>

            {tab === 'description' && <p className="font-serif text-lg md:text-xl text-platinum-light/80 leading-relaxed max-w-3xl">{product.description}</p>}

            {tab === 'specs' && (
              <div className="max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(product.specs || {}).map(([k, v]) => (
                  <div key={k} className="flex justify-between py-3 border-b border-gold/10">
                    <span className="text-xs uppercase tracking-[0.2em] text-platinum-light/50">{k.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-sm text-platinum-light">{v}</span>
                  </div>
                ))}
              </div>
            )}

            {tab === 'features' && (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                {product.features?.map((f, i) => (
                  <li key={i} className="flex items-start gap-3"><Check className="w-4 h-4 text-gold mt-1 flex-shrink-0" /><span className="text-platinum-light/80">{f}</span></li>
                ))}
              </ul>
            )}

            {tab === 'reviews' && (
              <div className="max-w-3xl">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-4xl font-serif text-gradient-gold">{product.rating}</span>
                      <div className="flex gap-1">{[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-gold text-gold' : 'text-platinum-light/30'}`} />)}</div>
                    </div>
                    <span className="text-sm text-platinum-light/60">{product.reviewCount} verified reviews</span>
                  </div>
                  <button onClick={() => setAddingReview(!addingReview)} className="btn-outline-gold text-xs">Write a Review</button>
                </div>

                {addingReview && (
                  <div className="glass p-6 mb-8 rounded-sm">
                    <div className="flex gap-2 mb-4">
                      {[1,2,3,4,5].map(r => <button key={r} onClick={() => setReviewData({...reviewData, rating: r})}><Star className={`w-6 h-6 ${r <= reviewData.rating ? 'fill-gold text-gold' : 'text-platinum-light/30'}`} /></button>)}
                    </div>
                    <input value={reviewData.title} onChange={e => setReviewData({...reviewData, title: e.target.value})} placeholder="Title" className="w-full bg-obsidian-700 border border-gold/20 px-4 py-2 mb-3 text-sm outline-none focus:border-gold" />
                    <textarea value={reviewData.comment} onChange={e => setReviewData({...reviewData, comment: e.target.value})} placeholder="Your review..." rows={4} className="w-full bg-obsidian-700 border border-gold/20 px-4 py-2 mb-3 text-sm outline-none focus:border-gold" />
                    <div className="flex gap-3"><button onClick={submitReview} className="btn-gold text-xs">Submit</button><button onClick={() => setAddingReview(false)} className="btn-outline-gold text-xs">Cancel</button></div>
                  </div>
                )}

                <div className="space-y-6">
                  {reviews.length === 0 ? <p className="text-platinum-light/50">No reviews yet. Be the first.</p> : reviews.map(r => (
                    <div key={r._id} className="pb-6 border-b border-gold/10">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-obsidian text-sm font-bold">{r.userName?.[0]?.toUpperCase()}</div>
                        <div>
                          <div className="text-sm text-platinum-light">{r.userName}</div>
                          <div className="flex gap-1">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-gold text-gold' : 'text-platinum-light/20'}`} />)}</div>
                        </div>
                      </div>
                      <h4 className="font-serif text-lg mb-1">{r.title}</h4>
                      <p className="text-sm text-platinum-light/70">{r.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div className="mt-24">
              <h2 className="text-3xl md:text-4xl font-serif mb-10 text-center text-gradient-gold">You May Also Appreciate</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {related.map(p => <ProductCard key={p.slug} product={p} />)}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}