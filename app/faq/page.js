'use client'
import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Plus, Minus } from 'lucide-react'

const FAQS = [
  { q: 'Are Auverra watches authentic and warranted?', a: 'Every Auverra timepiece is handcrafted at our atelier in La Chaux-de-Fonds, Switzerland, and comes with a 2-year international warranty. Each watch is delivered with a signed certificate of authenticity and a numbered pedigree card.' },
  { q: 'What is your shipping and delivery policy?', a: 'We offer complimentary insured worldwide delivery on all orders. Domestic orders within India ship within 3-5 business days. International orders take 7-10 business days. Every parcel is signature-required.' },
  { q: 'Do you offer returns or exchanges?', a: 'Yes. You may return an unworn timepiece within 30 days for a full refund. Custom-engraved or personalized pieces are non-refundable. Please contact our concierge for a return authorization.' },
  { q: 'How do I service my Auverra watch?', a: 'We recommend servicing every 4-5 years. Contact our concierge to arrange collection. All servicing is performed at our atelier by master watchmakers using original parts.' },
  { q: 'Can I customize a watch?', a: 'Absolutely. Auverra offers bespoke commissions — from custom dials to engraved case backs. Contact our concierge for a private consultation. Bespoke pieces take 6-8 months.' },
  { q: 'What payment methods do you accept?', a: 'We accept Razorpay (UPI, cards, netbanking), Stripe (international cards), PayPal, Cash on Delivery (India only), and Bank Transfer for orders above ₹5 lakh. All transactions are secure.' },
  { q: 'Do you offer financing?', a: 'Yes, we partner with select banks for interest-free EMI options up to 24 months on orders above ₹1 lakh. Financing terms are shown at checkout.' },
  { q: 'How do I care for my watch?', a: 'Wipe your watch with a soft cloth after wearing. Avoid strong magnetic fields and extreme temperatures. Never expose to solvents or perfumes. See our full Watch Care Guide for details.' },
]

export default function FaqPage() {
  const [open, setOpen] = useState(0)

  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <div className="pt-32 pb-20">
        <div className="container-lux max-w-3xl">
          <div className="text-center mb-16">
            <div className="divider-gold w-24 mx-auto mb-6" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4 block">Answers</span>
            <h1 className="text-5xl md:text-6xl font-serif text-gradient-gold mb-4">Frequently Asked</h1>
          </div>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <div key={i} className="border border-gold/15 rounded-sm overflow-hidden">
                <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full p-6 flex items-center justify-between text-left hover:bg-gold/5 transition">
                  <span className="font-serif text-lg text-platinum-light pr-4">{f.q}</span>
                  {open === i ? <Minus className="w-5 h-5 text-gold flex-shrink-0" /> : <Plus className="w-5 h-5 text-gold flex-shrink-0" />}
                </button>
                {open === i && <div className="px-6 pb-6 text-platinum-light/70 leading-relaxed border-t border-gold/10 pt-4">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
