'use client'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

const SECTIONS = [
  { h: 'Orders & Pricing', p: 'All prices are listed in INR and inclusive of applicable GST unless stated otherwise. Auverra reserves the right to correct pricing errors and cancel affected orders with full refund.' },
  { h: 'Payment', p: 'We accept payment via the methods enabled at checkout (cards, UPI, netbanking, PayPal, bank transfer, or cash on delivery where available). Orders are confirmed only after successful payment authorization.' },
  { h: 'Limited Editions', p: 'Limited edition and made-to-order pieces are non-cancellable once production begins, except as required by law.' },
  { h: 'Intellectual Property', p: 'All designs, imagery, and content on this site are the property of Auverra Watches and may not be reproduced without written consent.' },
  { h: 'Limitation of Liability', p: 'Auverra is not liable for indirect or consequential damages arising from product use beyond the remedies stated in our Exchange & Refund Policy.' },
  { h: 'Governing Law', p: 'These terms are governed by the laws of India, with courts in Mumbai having exclusive jurisdiction.' },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <div className="pt-32 pb-24">
        <div className="container-lux max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <div className="divider-gold w-24 mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-serif text-gradient-gold">Terms & Conditions</h1>
            <p className="text-platinum-light/50 mt-4 text-sm">Last updated July 2026</p>
          </div>
          <div className="space-y-8">
            {SECTIONS.map((s, i) => (
              <div key={i}>
                <h3 className="font-serif text-xl text-gold mb-2">{s.h}</h3>
                <p className="text-sm text-platinum-light/65 leading-relaxed">{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}