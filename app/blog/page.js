'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ArrowRight } from 'lucide-react'

export default function BlogPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/blog').then(r => r.json()).then(d => { setPosts(d.items || []); setLoading(false) })
  }, [])

  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <div className="pt-32 pb-24">
        <div className="container-lux">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="divider-gold w-24 mx-auto mb-6" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4 block">The Auverra Journal</span>
            <h1 className="text-5xl md:text-6xl font-serif text-gradient-gold mb-6">Stories in Time</h1>
            <p className="text-platinum-light/60 leading-relaxed">Notes on horology, craftsmanship, and the world of fine watchmaking — from our editorial desk and master watchmakers.</p>
          </div>

          {loading ? (
            <div className="text-center text-platinum-light/50 py-20">Loading stories...</div>
          ) : posts.length === 0 ? (
            <div className="text-center text-platinum-light/50 py-20">No stories published yet. Check back soon.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {posts.map(p => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="group luxury-card rounded-sm overflow-hidden">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={(p.coverImage || 'https://images.unsplash.com/photo-1568154106189-717dc85b0a3b') + '?auto=format&fit=crop&w=800&q=85'} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="p-6">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-gold mb-3">{p.author}</div>
                    <h3 className="font-serif text-xl text-platinum-light mb-3 group-hover:text-gold transition">{p.title}</h3>
                    <p className="text-sm text-platinum-light/60 leading-relaxed mb-4 line-clamp-2">{p.excerpt}</p>
                    <div className="inline-flex items-center gap-2 text-gold text-xs uppercase tracking-[0.2em] group-hover:gap-4 transition-all">Read Story <ArrowRight className="w-3 h-3" /></div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
