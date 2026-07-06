'use client'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

const FAQS = [
  { q: '14-Day Returns', a: 'Unworn timepieces in original packaging with all papers may be returned within 14 days of delivery for a full refund, minus any customization costs.' },
  { q: '2-Year International Warranty', a: 'Every Auverra watch carries a 2-year manufacturer warranty covering movement defects and manufacturing faults, honored at any authorized boutique worldwide.' },
  { q: 'What Isn\'t Covered', a: 'Warranty excludes water damage from beyond the rated resistance, battery/strap wear, and damage from unauthorized servicing.' },
  { q: 'Extended Care Plan', a: 'Ask your concierge about our optional 5-year Extended Care Plan, which adds annual servicing and accidental damage protection.' },
  { q: 'How to Initiate a Return', a: 'Contact us with your order ID; we\'ll arrange complimentary insured pickup and process refunds within 7 business days of inspection.' },
]

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <div className="pt-32 pb-24">
        <div className="container-lux max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <div className="divider-gold w-24 mx-auto mb-6" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4 block">Peace of Mind</span>
            <h1 className="text-5xl md:text-6xl font-serif text-gradient-gold">Returns & Warranty</h1>
          </div>
          <div className="space-y-4">
            {FAQS.map((f, i) => (
              <div key={i} className="glass border border-gold/15 p-6 rounded-sm">
                <h3 className="font-serif text-lg text-gold mb-2">{f.q}</h3>
                <p className="text-sm text-platinum-light/65 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
