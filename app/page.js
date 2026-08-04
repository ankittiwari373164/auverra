'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { WhatsAppReviews } from '@/components/whatsapp-reviews'
import { ArrowRight, Award, Sparkles, Shield, Truck, Star, ChevronRight, ChevronLeft } from 'lucide-react'

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [bestSellers, setBestSellers] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [collections, setCollections] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [testimonialPage, setTestimonialPage] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  const heroRef = useRef(null)
  const tiltRef = useRef(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })

  useEffect(() => {
    Promise.all([
      fetch('/api/products/featured').then(r => r.json()),
      fetch('/api/products/bestsellers').then(r => r.json()),
      fetch('/api/products/new').then(r => r.json()),
      fetch('/api/collections').then(r => r.json()),
      fetch('/api/testimonials').then(r => r.json()),
    ]).then(async ([f, b, n, c, t]) => {
      let featuredItems = f.items || []
      if (featuredItems.length === 0) {
        // No products marked "Featured" in admin yet — fall back to the
        // general catalog so this section is never empty.
        const all = await fetch('/api/products?sort=newest').then(r => r.json())
        featuredItems = (all.items || []).slice(0, 6)
      }
      setFeatured(featuredItems); setBestSellers(b.items || []); setNewArrivals(n.items || [])
      setCollections(c.items || []); setTestimonials(t.items || [])
    })
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleTiltMove = (e) => {
    const el = tiltRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ rx: (py * -14).toFixed(2), ry: (px * 18).toFixed(2) })
  }
  const resetTilt = () => setTilt({ rx: 0, ry: 0 })

  return (
    <div className="min-h-screen bg-obsidian overflow-hidden">
      <Navbar />

      {/* HERO */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden on-image">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1611353384046-8a02bac0f14d?auto=format&fit=crop&w=2400&q=90" alt="" className="w-full h-full object-cover" style={{ transform: `translateY(${scrollY * 0.4}px) scale(${1 + scrollY * 0.0003})`, filter: 'brightness(0.4) contrast(1.15)' }} />
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian/80 via-obsidian/50 to-obsidian" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/30 to-transparent" />
          <div className="glow-orb w-[500px] h-[500px] -top-40 -right-40 bg-gold/10" />
          <div className="glow-orb w-[400px] h-[400px] bottom-0 left-1/3 bg-platinum/5" />
        </div>

        <div className="container-lux relative z-10 pt-32 pb-20 grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-2xl" style={{ transform: `translateY(${scrollY * -0.15}px)`, opacity: 1 - scrollY * 0.002 }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-12 bg-gold" />
              <span className="text-[10px] uppercase tracking-[0.4em] text-gold">Est. 1897 • Handcrafted in Switzerland</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-serif leading-[0.95] mb-8">
              <span className="block text-platinum-light">Time,</span>
              <span className="block text-gradient-gold italic">Perfected.</span>
            </h1>
            <p className="text-lg md:text-xl text-platinum-light/70 font-light leading-relaxed mb-10 max-w-xl">
              Discover timepieces where every escapement, every jewel, and every hand-finished bridge tells a story of uncompromising Swiss craftsmanship.
            </p>
            <div className="flex flex-wrap gap-4 mb-12">
              <Link href="/shop" className="btn-gold sheen group inline-flex items-center gap-3">
                Explore the Collection
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
              <Link href="/shop?collection=celestial" className="btn-outline-gold">Céleste Tourbillon</Link>
            </div>
            <div className="flex flex-wrap gap-8">
              <div>
                <div className="text-2xl font-serif text-gradient-gold">4.9★</div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-platinum-light/50 mt-1">Collector Rating</div>
              </div>
            </div>
          </div>

          {/* 3D tilt metallic watch showcase */}
          <div className="hidden lg:flex items-center justify-center perspective">
            <div
              ref={tiltRef}
              onMouseMove={handleTiltMove}
              onMouseLeave={resetTilt}
              className="relative w-[420px] h-[420px]"
            >
              <div className="absolute inset-0 rounded-full metal-ring opacity-70 blur-[2px]" />
              <div className="absolute inset-3 rounded-full metal-ring opacity-40" style={{ animationDirection: 'reverse', animationDuration: '26s' }} />
              <div
                className={tilt.rx === 0 && tilt.ry === 0 ? 'tilt-3d tilt-3d-reset absolute inset-10 rounded-full overflow-hidden border border-gold/30 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]' : 'tilt-3d absolute inset-10 rounded-full overflow-hidden border border-gold/30 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]'}
                style={{ '--rx': `${tilt.rx}deg`, '--ry': `${tilt.ry}deg` }}
              >
                <img src="https://images.unsplash.com/photo-1600003014637-ff82a275e191?auto=format&fit=crop&w=900&q=90" alt="Auverra Chronos Titanium" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-obsidian/40" />
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 glass px-5 py-2 rounded-full border border-gold/20 whitespace-nowrap">
                <span className="text-[10px] uppercase tracking-[0.3em] text-gold">Chronos Titanium</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-60 animate-pulse">
          <span className="text-[9px] uppercase tracking-[0.4em] text-gold">Scroll to Discover</span>
          <div className="w-px h-12 bg-gradient-to-b from-gold to-transparent" />
        </div>
      </section>

      {/* MARQUEE / STATS BAR */}
      <section className="relative border-y border-gold/10 bg-obsidian-900/50 py-6 overflow-hidden">
        <div className="container-lux">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {[
              
              { icon: Sparkles, label: 'In-House', sub: 'Movements' },
              { icon: Shield, label: 'Authenticity', sub: 'Certified Pieces' },
              { icon: Truck, label: 'Free Insured', sub: 'Global Delivery' },
            ].map(({ icon: Icon, label, sub }, i) => (
              <div key={i} className="flex items-center gap-4 justify-center md:justify-start">
                <Icon className="w-8 h-8 text-gold" strokeWidth={1} />
                <div>
                  <div className="font-serif text-lg text-platinum-light">{label}</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-platinum-light/50">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-24 md:py-32 relative">
        <div className="container-lux">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="divider-gold w-24 mx-auto mb-6" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4 block">The Maison</span>
            <h2 className="text-4xl md:text-6xl font-serif mb-6 text-gradient-gold">Featured Timepieces</h2>
            <p className="text-platinum-light/60 leading-relaxed">Six timepieces that define the Auverra approach — traditional Haute Horlogerie techniques married with contemporary design vision.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {featured.map((p, i) => <ProductCard key={p.slug} product={p} priority={i < 3} />)}
          </div>
          <div className="text-center mt-14">
            <Link href="/shop" className="inline-flex items-center gap-2 text-gold hover:gap-4 transition-all duration-500 text-sm uppercase tracking-[0.25em]">View All Timepieces <ChevronRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </section>

      {/* SHOP BY: MEN / WOMEN / AUTOMATIC */}
      <section className="py-24 md:py-32 relative bg-gradient-to-b from-obsidian to-obsidian-900 section-tint">
        <div className="container-lux">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
            <div>
              <span className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4 block">Shop the Collection</span>
              <h2 className="text-4xl md:text-6xl font-serif text-platinum-light">Curated <span className="text-gradient-gold italic">For You</span></h2>
            </div>
            <p className="text-platinum-light/50 max-w-md mt-4 md:mt-0">Find exactly what you're looking for.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Men', tagline: 'Bold, precise, built to last', href: '/shop', image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d' },
              { label: 'Women', tagline: 'Elegant timepieces for every moment', href: '/shop?category=ladies', image: 'https://images.unsplash.com/photo-1548171915-e79a380a2a4b' },
              { label: 'Automatic', tagline: 'No battery, just craftsmanship', href: '/shop?search=automatic', image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa' },
            ].map((c, i) => (
              <Link key={c.label} href={c.href} className="group relative aspect-[3/4] overflow-hidden luxury-card rounded-sm on-image">
                <img src={c.image + '?auto=format&fit=crop&w=800&q=85'} alt={c.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-gold mb-3">Shop {String(i+1).padStart(2, '0')}</span>
                  <h3 className="text-3xl md:text-4xl font-serif text-platinum-light mb-2">{c.label}</h3>
                  <p className="text-platinum-light/70 italic mb-4">{c.tagline}</p>
                  <div className="inline-flex items-center gap-2 text-gold text-xs uppercase tracking-[0.25em] group-hover:gap-4 transition-all">Discover <ArrowRight className="w-4 h-4" /></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CRAFTSMANSHIP PARALLAX */}
      <section className="relative py-32 md:py-48 overflow-hidden on-image">
        <div className="absolute -inset-y-32 inset-x-0 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1568154106189-717dc85b0a3b?auto=format&fit=crop&w=2400&q=85" alt="" className="w-full h-full object-cover" style={{ transform: `translateY(${Math.max(-60, Math.min(60, (scrollY - 2000) * 0.08))}px)`, filter: 'brightness(0.35)' }} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/50 to-transparent" />
        <div className="container-lux relative z-10">
          <div className="max-w-xl">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold mb-6 block">The Auverra Atelier</span>
            <h2 className="text-4xl md:text-6xl font-serif mb-8 text-platinum-light leading-[1.05]">Where <span className="text-gradient-gold italic">Mastery</span> Meets Obsession</h2>
            <p className="text-platinum-light/70 leading-relaxed mb-6 text-lg">Each Auverra timepiece passes through the hands of a single master watchmaker. From the initial hairspring adjustment to the final case polish — 780 hours. Zero shortcuts.</p>
            <p className="text-platinum-light/70 leading-relaxed mb-10">Our atelier in La Chaux-de-Fonds employs the very same techniques used since 1897. Grand feu enamel dials, hand-engraved bridges, and mercury-gilded hands — arts nearly lost to time.</p>
            <Link href="/craftsmanship" className="btn-outline-gold">Discover the Atelier</Link>
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-obsidian-900 to-obsidian section-tint">
        <div className="container-lux">
          <div className="flex items-end justify-between mb-16">
            <div>
              <span className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4 block">Most Coveted</span>
              <h2 className="text-4xl md:text-5xl font-serif text-platinum-light">Best <span className="text-gradient-gold italic">Sellers</span></h2>
            </div>
            <Link href="/shop?sort=featured" className="hidden md:inline-flex items-center gap-2 text-gold hover:gap-4 transition-all text-sm uppercase tracking-[0.2em]">View All <ChevronRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {bestSellers.map(p => <ProductCard key={p.slug} product={p} />)}
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      {newArrivals.length > 0 && (
        <section className="py-24 md:py-32">
          <div className="container-lux">
            <div className="flex items-end justify-between mb-16">
              <div>
                <span className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4 block">Latest Editions</span>
                <h2 className="text-4xl md:text-5xl font-serif text-platinum-light">New <span className="text-gradient-gold italic">Arrivals</span></h2>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {newArrivals.map(p => <ProductCard key={p.slug} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      <section className="py-24 md:py-32 relative bg-obsidian-900 overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(201,169,97,0.15) 0%, transparent 60%)' }} />
        <div className="container-lux relative">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="divider-gold w-24 mx-auto mb-6" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4 block">Whispered in the Circle</span>
            <h2 className="text-4xl md:text-5xl font-serif text-gradient-gold">From Our Collectors</h2>
          </div>
          <div className="relative">
            <div className="overflow-hidden">
              <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${testimonialPage * 100}%)` }}>
                {Array.from({ length: Math.ceil(testimonials.length / 2) }).map((_, page) => (
                  <div key={page} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 flex-shrink-0 w-full">
                    {testimonials.slice(page * 2, page * 2 + 2).map((t, i) => (
                      <div key={i} className="glass p-8 md:p-10 rounded-sm luxury-card">
                        <div className="flex gap-1 mb-5">{[...Array(t.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-gold text-gold" />)}</div>
                        <p className="font-serif text-xl md:text-2xl italic text-platinum-light/90 leading-relaxed mb-6">“{t.text}”</p>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-obsidian font-serif text-lg">{t.name[0]}</div>
                          <div>
                            <div className="font-serif text-platinum-light">{t.name}</div>
                            <div className="text-xs text-platinum-light/50">{t.title}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            {testimonials.length > 2 && (
              <div className="flex items-center justify-center gap-6 mt-10">
                <button onClick={() => setTestimonialPage(p => Math.max(0, p - 1))} disabled={testimonialPage === 0} className="w-10 h-10 border border-gold/30 rounded-full flex items-center justify-center text-gold hover:bg-gold/10 disabled:opacity-30 transition"><ChevronLeft className="w-4 h-4" /></button>
                <div className="flex gap-2">
                  {Array.from({ length: Math.ceil(testimonials.length / 2) }).map((_, page) => (
                    <button key={page} onClick={() => setTestimonialPage(page)} className={`w-2 h-2 rounded-full transition ${testimonialPage === page ? 'bg-gold w-6' : 'bg-gold/30'}`} />
                  ))}
                </div>
                <button onClick={() => setTestimonialPage(p => Math.min(Math.ceil(testimonials.length / 2) - 1, p + 1))} disabled={testimonialPage >= Math.ceil(testimonials.length / 2) - 1} className="w-10 h-10 border border-gold/30 rounded-full flex items-center justify-center text-gold hover:bg-gold/10 disabled:opacity-30 transition"><ChevronRight className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        </div>
      </section>

      <WhatsAppReviews />

      {/* CTA */}
      <section className="py-24 md:py-32 relative">
        <div className="container-lux">
          <div className="glass border border-gold/20 rounded-sm p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at center, #c9a961, transparent 70%)' }} />
            <div className="relative">
              <span className="text-[10px] uppercase tracking-[0.4em] text-gold mb-6 block">Private Consultation</span>
              <h2 className="text-4xl md:text-6xl font-serif mb-6 text-gradient-gold">Your Timepiece Awaits</h2>
              <p className="text-platinum-light/70 max-w-xl mx-auto mb-10 text-lg">Book a private consultation with our master horologists. Discover the timepiece that resonates with your story.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/contact" className="btn-gold">Book Consultation</Link>
                <Link href="/shop" className="btn-outline-gold">Browse All Watches</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}