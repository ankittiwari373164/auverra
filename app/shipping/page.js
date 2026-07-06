'use client'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Truck, ShieldCheck, Clock, Globe } from 'lucide-react'

const ITEMS = [
  { icon: Truck, t: 'Free Insured Delivery', d: 'Complimentary fully-insured shipping on all orders above ₹5,00,000. Orders below ship for a flat ₹2,500.' },
  { icon: Clock, t: 'Dispatch Timelines', d: 'In-stock pieces ship within 2 business days. Made-to-order and limited editions ship in 3–6 weeks; you\'ll receive tracking as soon as it leaves the atelier.' },
  { icon: Globe, t: 'Domestic & International', d: 'We currently ship across India via secure courier, and internationally to select countries on request — contact us for a quote.' },
  { icon: ShieldCheck, t: 'Signature Required', d: 'Every Auverra shipment requires an adult signature on delivery and travels in a tamper-evident, GPS-tracked case.' },
]

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <div className="pt-32 pb-24">
        <div className="container-lux max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="divider-gold w-24 mx-auto mb-6" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4 block">Logistics</span>
            <h1 className="text-5xl md:text-6xl font-serif text-gradient-gold">Shipping & Delivery</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ITEMS.map((it, i) => (
              <div key={i} className="glass border border-gold/15 p-8 rounded-sm">
                <it.icon className="w-8 h-8 text-gold mb-4" strokeWidth={1} />
                <h3 className="font-serif text-xl text-platinum-light mb-2">{it.t}</h3>
                <p className="text-sm text-platinum-light/60 leading-relaxed">{it.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-sm text-platinum-light/50 leading-relaxed">
            Order tracking is available from your <a href="/account/orders" className="text-gold hover:underline">account dashboard</a> once your piece has shipped. For any delivery queries, our concierge team is reachable via the <a href="/contact" className="text-gold hover:underline">contact page</a>.
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
