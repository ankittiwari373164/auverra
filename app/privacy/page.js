'use client'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

const SECTIONS = [
  { h: 'Information We Collect', p: 'We collect information you provide directly — name, email, shipping address, and order history — plus technical data such as device and browser type to improve your shopping experience.' },
  { h: 'How We Use Your Information', p: 'Your data is used to process orders, provide customer support, personalize recommendations, and send updates you\'ve opted into. We never sell your personal information to third parties.' },
  { h: 'Payment Security', p: 'Payment details are processed by PCI-DSS compliant gateways (Razorpay, Stripe, PayPal). Auverra does not store your full card numbers on its own servers.' },
  { h: 'Cookies', p: 'We use cookies to keep you signed in, remember your cart, and understand site usage. You can manage cookie preferences through your browser settings.' },
  { h: 'Your Rights', p: 'You may request access, correction, or deletion of your personal data at any time by contacting our support team.' },
  { h: 'Data Retention', p: 'Order and account data is retained as long as your account is active, and as required for legal and tax purposes thereafter.' },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <div className="pt-32 pb-24">
        <div className="container-lux max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <div className="divider-gold w-24 mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-serif text-gradient-gold">Privacy Policy</h1>
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