'use client'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { MapPin, Phone } from 'lucide-react'

const BOUTIQUES = [
  { city: 'Mumbai', area: 'Musafir Khana', address: 'Musafir Khana, Mumbai 400001', phone: '+91 22 4000 1897' },
  { city: 'New Delhi', area: 'Connaught Place', address: 'Auverra Boutique, N-Block, Connaught Place, New Delhi 110001', phone: '+91 11 4000 1897' },
  { city: 'Bengaluru', area: 'UB City', address: 'Auverra Boutique, UB City Mall, Vittal Mallya Road, Bengaluru 560001', phone: '+91 80 4000 1897' },
  { city: 'La Chaux-de-Fonds', area: 'Switzerland', address: 'The Original Atelier, Rue de la Serre, La Chaux-de-Fonds, Switzerland', phone: '+41 32 000 1897' },
]

export default function BoutiquesPage() {
  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <div className="pt-32 pb-24">
        <div className="container-lux">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="divider-gold w-24 mx-auto mb-6" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4 block">Visit Us</span>
            <h1 className="text-5xl md:text-6xl font-serif text-gradient-gold">Our Boutiques</h1>
            <p className="text-platinum-light/60 mt-6">Experience the collection in person, and book a private consultation with our resident horologists.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {BOUTIQUES.map((b, i) => (
              <div key={i} className="glass border border-gold/15 p-8 rounded-sm luxury-card">
                <h3 className="font-serif text-2xl text-gold mb-1">{b.city}</h3>
                <div className="text-xs uppercase tracking-[0.25em] text-platinum-light/40 mb-4">{b.area}</div>
                <div className="flex items-start gap-3 mb-3 text-sm text-platinum-light/70"><MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />{b.address}</div>
                <div className="flex items-center gap-3 text-sm text-platinum-light/70"><Phone className="w-4 h-4 text-gold flex-shrink-0" />{b.phone}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}