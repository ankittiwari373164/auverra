'use client'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import Link from 'next/link'

const STAGES = [
  { n: '01', t: 'Movement Assembly', d: 'Each AV-caliber movement is hand-assembled by a single watchmaker across 6 to 9 days, from mainplate to escapement.' },
  { n: '02', t: 'Case Machining', d: 'Grade-5 titanium and 18k gold cases are milled to a tolerance of 2 microns, then hand-polished in three finishing passes.' },
  { n: '03', t: 'Dial Craft', d: 'Grand feu enamel and mother-of-pearl dials are fired, hand-lacquered, and indexed with individually applied markers.' },
  { n: '04', t: 'Regulation', d: 'Every movement is regulated in six positions across 15 days to guarantee chronometer-grade accuracy.' },
  { n: '05', t: 'Final Assembly', d: 'Case, dial, and movement are married by the same watchmaker who began the piece — a signature of single-artisan accountability.' },
  { n: '06', t: 'Quality Control', d: 'A 200-point inspection, water-resistance testing, and a 48-hour wear simulation precede every shipment.' },
]

export default function CraftsmanshipPage() {
  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <section className="relative pt-32 pb-24 overflow-hidden on-image">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1568154106189-717dc85b0a3b?auto=format&fit=crop&w=2400&q=85" className="w-full h-full object-cover" style={{ filter: 'brightness(0.32)' }} />
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian/70 to-obsidian" />
        </div>
        <div className="container-lux relative z-10 text-center max-w-3xl mx-auto">
          <div className="divider-gold w-24 mx-auto mb-6" />
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4 block">The Atelier</span>
          <h1 className="text-5xl md:text-7xl font-serif text-gradient-gold mb-6">Craftsmanship</h1>
          <p className="text-lg text-platinum-light/70 leading-relaxed">780 hours. Zero shortcuts. Every Auverra timepiece passes through the hands of a single master watchmaker in our La Chaux-de-Fonds atelier — the same techniques practiced since 1897.</p>
        </div>
      </section>

      <section className="py-24">
        <div className="container-lux">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {STAGES.map(s => (
              <div key={s.n} className="glass border border-gold/15 p-8 rounded-sm luxury-card">
                <div className="text-5xl font-serif text-gold/30 mb-4">{s.n}</div>
                <h3 className="font-serif text-xl text-platinum-light mb-3">{s.t}</h3>
                <p className="text-sm text-platinum-light/60 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-obsidian-900">
        <div className="container-lux text-center max-w-xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif text-gradient-gold mb-6">Experience It Yourself</h2>
          <p className="text-platinum-light/60 mb-8">Explore the collection born from this obsession with precision.</p>
          <Link href="/shop" className="btn-gold">Browse Timepieces</Link>
        </div>
      </section>
      <Footer />
    </div>
  )
}
