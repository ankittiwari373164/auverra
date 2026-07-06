'use client'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

const TIPS = [
  { t: 'Winding & Wear', d: 'Automatic movements stay wound with regular wear (8+ hours daily). Left unworn, hand-wind gently 20–30 turns via the crown before storage.' },
  { t: 'Water Resistance', d: 'Never operate the crown or pushers underwater. Have gaskets checked annually — resistance ratings degrade with age and impact.' },
  { t: 'Cleaning', d: 'Wipe the case and bracelet with a soft, lint-free cloth after wear. Leather straps should avoid direct water and excessive sun exposure.' },
  { t: 'Storage', d: 'Store in the original case away from magnets, direct sunlight, and extreme temperature swings. A watch winder is recommended for automatics worn infrequently.' },
  { t: 'Servicing Cycle', d: 'We recommend a full movement service every 4–5 years to maintain accuracy, lubrication, and water resistance.' },
]

export default function CarePage() {
  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <div className="pt-32 pb-24">
        <div className="container-lux max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <div className="divider-gold w-24 mx-auto mb-6" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4 block">Longevity</span>
            <h1 className="text-5xl md:text-6xl font-serif text-gradient-gold">Watch Care Guide</h1>
            <p className="text-platinum-light/60 mt-6 leading-relaxed">A fine timepiece is a lifelong companion when properly cared for. Follow these guidelines to preserve your Auverra for generations.</p>
          </div>
          <div className="space-y-5">
            {TIPS.map((t, i) => (
              <div key={i} className="flex gap-5 glass border border-gold/15 p-6 rounded-sm">
                <div className="text-3xl font-serif text-gold/30 flex-shrink-0">{String(i + 1).padStart(2, '0')}</div>
                <div><h3 className="font-serif text-lg text-platinum-light mb-1">{t.t}</h3><p className="text-sm text-platinum-light/60 leading-relaxed">{t.d}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
