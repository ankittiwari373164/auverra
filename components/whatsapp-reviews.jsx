'use client'
import { useEffect, useState } from 'react'

const WHATSAPP_JOIN_LINK = 'https://chat.whatsapp.com/LCzcmWbEi4tHFWaTnK9hkG'

export function WhatsAppReviews() {
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    fetch('/api/whatsapp-reviews').then(r => r.json()).then(d => setReviews(d.items || []))
  }, [])

  // Nothing uploaded yet — don't show a placeholder/fake section, just skip it
  // until the admin adds real screenshots (Admin Panel → Reviews).
  if (reviews.length === 0) return null

  return (
    <section className="py-24 md:py-32 bg-obsidian-900">
      <div className="container-lux">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="divider-gold w-24 mx-auto mb-6" />
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4 block">Real Conversations</span>
          <h2 className="text-4xl md:text-5xl font-serif text-gradient-gold mb-4">What Customers Say on WhatsApp</h2>
          <p className="text-platinum-light/60">Genuine WhatsApp conversations from our customers about product quality, delivery, and overall experience.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {reviews.map(r => (
            <div key={r._id} className="rounded-sm overflow-hidden border border-gold/15 luxury-card">
              <img src={r.imageUrl} alt={r.caption || 'Customer review'} className="w-full aspect-[9/16] object-cover" />
              {r.caption && <div className="p-3 text-xs text-platinum-light/60 text-center">{r.caption}</div>}
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <a href={WHATSAPP_JOIN_LINK} target="_blank" rel="noopener noreferrer" className="btn-outline-gold">Join Our WhatsApp Community</a>
        </div>
      </div>
    </section>
  )
}