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
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4 block">Since 1897</span>
          <h1 className="text-5xl md:text-7xl font-serif text-gradient-gold mb-6">Our Story</h1>
          <p className="text-lg text-platinum-light/70 leading-relaxed">Auverra was founded in the winter of 1897 by master watchmaker Alexandre Verrier in La Chaux-de-Fonds — the beating heart of Swiss horology. What began as a single-artisan workshop remains, five generations later, a family-owned atelier obsessed with the same singular pursuit: the perfect timepiece.</p>
        </div>
      </section>

      <section className="py-24">
        <div className="container-lux">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { year: '1897', title: 'Foundation', text: 'Alexandre Verrier opens his workshop in La Chaux-de-Fonds.' },
              { year: '1934', title: 'First Chronograph', text: 'The pioneering AV-C1 caliber sets a new precision standard.' },
              { year: '1968', title: 'Tourbillon Era', text: 'Auverra introduces its first flying tourbillon.' },
              { year: '1997', title: 'Centennial Edition', text: 'Limited-edition 100th anniversary piece; 100 numbered watches.' },
              { year: '2019', title: 'Digital Craftsmanship', text: 'Traditional artistry meets cutting-edge metallurgy.' },
              { year: '2025', title: 'India Boutique', text: 'Flagship Maison opens in Mumbai’s Kala Ghoda.' },
            ].map((m, i) => (
              <div key={i} className="glass border border-gold/15 p-8 rounded-sm luxury-card">
                <div className="text-4xl font-serif text-gradient-gold mb-3">{m.year}</div>
                <div className="text-lg font-serif text-platinum-light mb-2">{m.title}</div>
                <div className="text-sm text-platinum-light/60">{m.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-obsidian-900">
        <div className="container-lux text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-serif text-gradient-gold mb-6">Uncompromising Craftsmanship</h2>
          <p className="text-platinum-light/70 leading-relaxed mb-10">Every Auverra timepiece is the product of 780 hours of hand-finishing. From côtes de Genève engraving to mercury gilding, we refuse shortcuts.</p>
          <Link href="/shop" className="btn-gold">Explore Timepieces</Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
