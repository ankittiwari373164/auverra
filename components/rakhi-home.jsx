'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { Gift, Heart, ArrowRight, Sparkles } from 'lucide-react'

const WHATSAPP_LINK = 'https://wa.me/912249001897?text=' + encodeURIComponent("Hi Auverra Watches! I'm interested in your Rakhi Special watch gifts for my sibling.")

export function RakhiHome() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetch('/api/products?sort=featured').then(r => r.json()).then(d => setProducts((d.items || []).slice(0, 8)))
  }, [])

  return (
    <div className="min-h-screen" style={{ background: '#fdf3ea' }}>
      <Navbar />

      {/* HERO */}
      <section className="relative pt-32 pb-20 overflow-hidden" style={{ background: 'linear-gradient(160deg, #8b1d2c 0%, #b3452f 45%, #d97a3f 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="container-lux relative z-10 text-center max-w-2xl mx-auto text-white">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/30 rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.25em] mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Raksha Bandhan Special
          </div>
          <h1 className="text-5xl md:text-6xl font-serif mb-6 leading-tight">A Gift as Lasting<br /><span className="italic" style={{ color: '#ffd88a' }}>as Their Promise</span></h1>
          <p className="text-white/85 text-lg leading-relaxed mb-10 max-w-xl mx-auto">This Rakhi, give your brother or sister a timepiece they'll wear every day and remember every time they check it — for the bond time can't undo.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/shop" className="inline-flex items-center gap-2 px-8 py-4 rounded-sm font-bold text-sm uppercase tracking-widest transition hover:-translate-y-0.5" style={{ background: '#ffd88a', color: '#5c1420' }}>
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: Gift, label: 'Free Gift Wrapping', sub: 'On every Rakhi order' },
              { icon: Heart, label: 'Handpicked for Siblings', sub: 'Watches that suit any age' },
              { icon: Sparkles, label: 'Fast Dispatch', sub: "Order early, they'll have it in time" },
            ].map(({ icon: Icon, label, sub }, i) => (
              <div key={i} className="flex items-center justify-center gap-3">
                <Icon className="w-7 h-7" style={{ color: '#a3402c' }} />
                <div className="text-left">
                  <div className="font-serif text-lg" style={{ color: '#5c1420' }}>{label}</div>
                  <div className="text-xs" style={{ color: '#8b5a3c' }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="py-20 md:py-28">
        <div className="container-lux">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-[0.3em] font-semibold" style={{ color: '#a3402c' }}>Curated For This Rakhi</span>
            <h2 className="text-4xl md:text-5xl font-serif mt-3" style={{ color: '#5c1420' }}>Gifts They'll Actually Wear</h2>
          </div>
          {products.length === 0 ? (
            <p className="text-center" style={{ color: '#8b5a3c' }}>Loading gift ideas...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map(p => <ProductCard key={p.slug} product={p} />)}
            </div>
          )}
          <div className="text-center mt-14">
            <Link href="/shop" className="inline-flex items-center gap-2 font-semibold hover:gap-4 transition-all" style={{ color: '#a3402c' }}>
              Browse the Full Collection <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-16" style={{ background: 'linear-gradient(135deg, #5c1420, #8b1d2c)' }}>
        <div className="container-lux text-center text-white max-w-xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-serif mb-4">Not Sure What to Pick?</h3>
          <p className="text-white/80 mb-8">Message us on WhatsApp — tell us a bit about your sibling and we'll help you find the right watch.</p>
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-4 rounded-sm font-bold text-sm uppercase tracking-widest transition hover:-translate-y-0.5" style={{ background: '#ffd88a', color: '#5c1420' }}>
            Chat With Us
          </a>
        </div>
      </section>

      <Footer />
    </div>
  )
}