'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { WhatsAppReviews } from '@/components/whatsapp-reviews'
import { ArrowRight, Sparkles, Gift, Truck, Star, ChevronRight, ChevronLeft, MessageCircle, Heart } from 'lucide-react'

const WHATSAPP_LINK = 'https://wa.me/912249001897?text=' + encodeURIComponent("Hi Auverra Watches! I'm interested in your Rakhi Special watch gifts for my sibling.")
const maroon = '#5c1420'
const rakhiRed = '#8b1d2c'
const gold = '#ffd88a'
const cream = '#fdf3ea'

export function RakhiHome() {
  const [featured, setFeatured] = useState([])
  const [bestSellers, setBestSellers] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
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
      fetch('/api/testimonials').then(r => r.json()),
    ]).then(async ([f, b, n, t]) => {
      let featuredItems = f.items || []
      if (featuredItems.length === 0) {
        const all = await fetch('/api/products?sort=newest').then(r => r.json())
        featuredItems = (all.items || []).slice(0, 6)
      }
      setFeatured(featuredItems); setBestSellers(b.items || []); setNewArrivals(n.items || [])
      setTestimonials(t.items || [])
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
    <div className="min-h-screen overflow-hidden" style={{ background: cream }}>
      {/* FESTIVE ANNOUNCEMENT BAR */}
      <div className="py-2 text-center text-xs md:text-sm font-semibold tracking-wide text-white" style={{ background: `linear-gradient(90deg, ${rakhiRed}, ${maroon})` }}>
        🎉 Raksha Bandhan Special — Free Gift Wrapping on Every Order
      </div>

      <Navbar />

      {/* HERO */}
      <section className="relative pt-32 pb-20 overflow-hidden" style={{ background: `linear-gradient(160deg, ${rakhiRed} 0%, #b3452f 45%, #d97a3f 100%)` }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="container-lux relative z-10 text-center max-w-2xl mx-auto text-white">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/30 rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.25em] mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Raksha Bandhan Special
          </div>
          <h1 className="text-5xl md:text-6xl font-serif mb-6 leading-tight">A Gift as Lasting<br /><span className="italic" style={{ color: gold }}>as Their Promise</span></h1>
          <p className="text-white/85 text-lg leading-relaxed mb-10 max-w-xl mx-auto">This Rakhi, give your brother or sister a timepiece they'll wear every day and remember every time they check it — for the bond time can't undo.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/shop" className="inline-flex items-center gap-2 px-8 py-4 rounded-sm font-bold text-sm uppercase tracking-widest transition hover:-translate-y-0.5" style={{ background: gold, color: maroon }}>
              Shop Rakhi Gifts <ArrowRight className="w-4 h-4" />
            </Link>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-4 rounded-sm font-bold text-sm uppercase tracking-widest border-2 border-white/70 text-white hover:bg-white/10 transition">
              Ask Us on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* GIFT BENEFITS STRIP */}
      <section className="py-8" style={{ background: '#f7e2c8' }}>
        <div className="container-lux">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {[
              { icon: Gift, label: 'Free Gift Wrapping', sub: 'On every order' },
              { icon: Heart, label: 'Handpicked for Siblings', sub: 'Watches for any age' },
              { icon: Truck, label: 'Fast Dispatch', sub: "Order early, they'll get it in time" },
            ].map(({ icon: Icon, label, sub }, i) => (
              <div key={i} className="flex items-center gap-4 justify-center md:justify-start">
                <Icon className="w-8 h-8" style={{ color: rakhiRed }} strokeWidth={1.5} />
                <div>
                  <div className="font-serif text-lg" style={{ color: maroon }}>{label}</div>
                  <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: '#8b5a3c' }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED / RAKHI GIFT EDIT */}
      <section className="py-24 md:py-32 relative">
        <div className="container-lux">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="w-24 h-px mx-auto mb-6" style={{ background: rakhiRed }} />
            <span className="text-[10px] uppercase tracking-[0.4em] mb-4 block" style={{ color: rakhiRed }}>Curated for This Rakhi</span>
            <h2 className="text-4xl md:text-6xl font-serif mb-6" style={{ color: maroon }}>The Rakhi Gift Edit</h2>
            <p className="leading-relaxed" style={{ color: '#8b5a3c' }}>Six timepieces handpicked for the sibling who deserves something they'll actually wear — not just unwrap.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {featured.map((p, i) => <ProductCard key={p.slug} product={p} priority={i < 3} />)}
          </div>
          <div className="text-center mt-14">
            <Link href="/shop" className="inline-flex items-center gap-2 hover:gap-4 transition-all duration-500 text-sm uppercase tracking-[0.25em] font-semibold" style={{ color: rakhiRed }}>View All Timepieces <ChevronRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </section>

      {/* SHOP BY: FOR HIM / FOR HER / AUTOMATIC */}
      <section className="py-24 md:py-32 relative" style={{ background: 'linear-gradient(180deg, #fdf3ea, #f7e2c8)' }}>
        <div className="container-lux">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
            <div>
              <span className="text-[10px] uppercase tracking-[0.4em] mb-4 block" style={{ color: rakhiRed }}>Shop the Gift</span>
              <h2 className="text-4xl md:text-6xl font-serif" style={{ color: maroon }}>Gifts <span className="italic" style={{ color: rakhiRed }}>For Every Sibling</span></h2>
            </div>
            <p className="max-w-md mt-4 md:mt-0" style={{ color: '#8b5a3c' }}>Find exactly what suits them.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'For Him', tagline: 'Bold, precise, built to last', href: '/shop', image: '/watches3.jpg' },
              { label: 'For Her', tagline: 'Elegant timepieces for every moment', href: '/shop?category=ladies', image: '/ladies.jpg' },
              { label: 'Automatic', tagline: 'No battery, just craftsmanship', href: '/shop?search=automatic', image: '/watches2.jpg' },
            ].map((c, i) => (
              <Link key={c.label} href={c.href} className="group relative aspect-[3/4] overflow-hidden rounded-sm shadow-lg">
                <img src={c.image} alt={c.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-110" />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${maroon} 0%, rgba(92,20,32,0.4) 50%, transparent 100%)` }} />
                <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                  <span className="text-[10px] uppercase tracking-[0.4em] mb-3" style={{ color: gold }}>Gift {String(i+1).padStart(2, '0')}</span>
                  <h3 className="text-3xl md:text-4xl font-serif mb-2">{c.label}</h3>
                  <p className="italic mb-4 text-white/80">{c.tagline}</p>
                  <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] group-hover:gap-4 transition-all" style={{ color: gold }}>Discover <ArrowRight className="w-4 h-4" /></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* GIFTING MADE PERSONAL — PARALLAX */}
      <section className="relative py-32 md:py-48 overflow-hidden">
        <div className="absolute -inset-y-32 inset-x-0 overflow-hidden">
          <img src="/watches4.jpg" alt="" className="w-full h-full object-cover" style={{ transform: `translateY(${Math.max(-60, Math.min(60, (scrollY - 2000) * 0.08))}px)`, filter: 'brightness(0.4) saturate(1.1)' }} />
        </div>
        <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${maroon} 0%, rgba(92,20,32,0.6) 45%, transparent 80%)` }} />
        <div className="container-lux relative z-10">
          <div className="max-w-xl text-white">
            <span className="text-[10px] uppercase tracking-[0.4em] mb-6 block" style={{ color: gold }}>Gifting Made Personal</span>
            <h2 className="text-4xl md:text-6xl font-serif mb-8 leading-[1.05]">Free Wrapping, <span className="italic" style={{ color: gold }}>Every Order</span></h2>
            <p className="text-white/80 leading-relaxed mb-6 text-lg">Every Rakhi order comes gift-wrapped at no extra cost — ready to hand over the moment your sibling ties the thread.</p>
            <p className="text-white/80 leading-relaxed mb-10">Need it to arrive by a specific date? Message us on WhatsApp and we'll make sure it reaches in time.</p>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-4 rounded-sm font-bold text-sm uppercase tracking-widest border-2 border-white/70 hover:bg-white/10 transition">Ask About Delivery Dates</a>
          </div>
        </div>
      </section>

      {/* MOST GIFTED */}
      <section className="py-24 md:py-32" style={{ background: 'linear-gradient(180deg, #f7e2c8, #fdf3ea)' }}>
        <div className="container-lux">
          <div className="flex items-end justify-between mb-16">
            <div>
              <span className="text-[10px] uppercase tracking-[0.4em] mb-4 block" style={{ color: rakhiRed }}>Most Coveted</span>
              <h2 className="text-4xl md:text-5xl font-serif" style={{ color: maroon }}>Most Gifted <span className="italic" style={{ color: rakhiRed }}>This Rakhi</span></h2>
            </div>
            <Link href="/shop?sort=featured" className="hidden md:inline-flex items-center gap-2 hover:gap-4 transition-all text-sm uppercase tracking-[0.2em] font-semibold" style={{ color: rakhiRed }}>View All <ChevronRight className="w-4 h-4" /></Link>
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
                <span className="text-[10px] uppercase tracking-[0.4em] mb-4 block" style={{ color: rakhiRed }}>Latest Editions</span>
                <h2 className="text-4xl md:text-5xl font-serif" style={{ color: maroon }}>Fresh <span className="italic" style={{ color: rakhiRed }}>This Season</span></h2>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {newArrivals.map(p => <ProductCard key={p.slug} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      <section className="py-24 md:py-32 relative overflow-hidden" style={{ background: '#f7e2c8' }}>
        <div className="container-lux relative">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="w-24 h-px mx-auto mb-6" style={{ background: rakhiRed }} />
            <span className="text-[10px] uppercase tracking-[0.4em] mb-4 block" style={{ color: rakhiRed }}>Whispered in the Circle</span>
            <h2 className="text-4xl md:text-5xl font-serif" style={{ color: maroon }}>What Siblings Are Saying</h2>
          </div>
          <div className="relative">
            <div className="overflow-hidden">
              <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${testimonialPage * 100}%)` }}>
                {Array.from({ length: Math.ceil(testimonials.length / 2) }).map((_, page) => (
                  <div key={page} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 flex-shrink-0 w-full">
                    {testimonials.slice(page * 2, page * 2 + 2).map((t, i) => (
                      <div key={i} className="bg-white p-8 md:p-10 rounded-sm shadow-md">
                        <div className="flex gap-1 mb-5">{[...Array(t.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" style={{ color: rakhiRed }} />)}</div>
                        <p className="font-serif text-xl md:text-2xl italic leading-relaxed mb-6" style={{ color: maroon }}>"{t.text}"</p>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center font-serif text-lg text-white" style={{ background: `linear-gradient(135deg, ${gold}, ${rakhiRed})` }}>{t.name[0]}</div>
                          <div>
                            <div className="font-serif" style={{ color: maroon }}>{t.name}</div>
                            <div className="text-xs" style={{ color: '#8b5a3c' }}>{t.title}</div>
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
                <button onClick={() => setTestimonialPage(p => Math.max(0, p - 1))} disabled={testimonialPage === 0} className="w-10 h-10 border-2 rounded-full flex items-center justify-center disabled:opacity-30 transition" style={{ borderColor: rakhiRed, color: rakhiRed }}><ChevronLeft className="w-4 h-4" /></button>
                <div className="flex gap-2">
                  {Array.from({ length: Math.ceil(testimonials.length / 2) }).map((_, page) => (
                    <button key={page} onClick={() => setTestimonialPage(page)} className="h-2 rounded-full transition" style={{ width: testimonialPage === page ? '24px' : '8px', background: testimonialPage === page ? rakhiRed : '#d9b98a' }} />
                  ))}
                </div>
                <button onClick={() => setTestimonialPage(p => Math.min(Math.ceil(testimonials.length / 2) - 1, p + 1))} disabled={testimonialPage >= Math.ceil(testimonials.length / 2) - 1} className="w-10 h-10 border-2 rounded-full flex items-center justify-center disabled:opacity-30 transition" style={{ borderColor: rakhiRed, color: rakhiRed }}><ChevronRight className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        </div>
      </section>

      <WhatsAppReviews />

      {/* CTA */}
      <section className="py-24 md:py-32 relative">
        <div className="container-lux">
          <div className="rounded-sm p-12 md:p-20 text-center relative overflow-hidden text-white" style={{ background: `linear-gradient(135deg, ${rakhiRed}, ${maroon})` }}>
            <span className="text-[10px] uppercase tracking-[0.4em] mb-6 block" style={{ color: gold }}>Still Deciding?</span>
            <h2 className="text-4xl md:text-6xl font-serif mb-6">Not Sure What to Gift?</h2>
            <p className="max-w-xl mx-auto mb-10 text-lg text-white/85">Tell us a bit about your sibling on WhatsApp and we'll help you find the right watch — free gift wrapping included.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-4 rounded-sm font-bold text-sm uppercase tracking-widest transition hover:-translate-y-0.5" style={{ background: gold, color: maroon }}>
                <MessageCircle className="w-4 h-4" /> Chat With Us
              </a>
              <Link href="/shop" className="inline-flex items-center gap-2 px-8 py-4 rounded-sm font-bold text-sm uppercase tracking-widest border-2 border-white/70 hover:bg-white/10 transition">Browse All Watches</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}