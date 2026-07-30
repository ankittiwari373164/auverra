'use client'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <section className="relative pt-32 pb-24 overflow-hidden on-image">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1568154106189-717dc85b0a3b?auto=format&fit=crop&w=2400&q=85" className="w-full h-full object-cover" style={{ filter: 'brightness(0.35)' }} />
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian/70 to-obsidian" />
        </div>
        <div className="container-lux relative z-10 text-center max-w-3xl mx-auto">
          <div className="divider-gold w-24 mx-auto mb-6" />
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4 block">Our Story</span>
          <h1 className="text-5xl md:text-7xl font-serif text-gradient-gold mb-6">About Auverra Watches</h1>
          <p className="text-lg text-platinum-light/70 leading-relaxed">Auverra Watches was built around one idea: exceptional timepieces should be easy to find, easy to trust, and easy to bring home. We curate a wide selection of watches for men and women across styles and budgets, and back every order with real customer support — reachable directly on WhatsApp.</p>
        </div>
      </section>

      <section className="py-24 bg-obsidian-900">
        <div className="container-lux text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-serif text-gradient-gold mb-6">Uncompromising Craftsmanship</h2>
          <p className="text-platinum-light/70 leading-relaxed mb-10">Every watch we list is chosen for genuine quality and value. We work directly with our customers over WhatsApp to answer questions before you order, so you always know exactly what you're getting.</p>
          <Link href="/shop" className="btn-gold">Explore Timepieces</Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}