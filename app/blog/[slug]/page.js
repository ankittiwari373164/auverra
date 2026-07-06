'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ArrowLeft } from 'lucide-react'

export default function BlogDetailPage() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/blog/${slug}`).then(r => r.json()).then(d => { if (d.post) setPost(d.post); else setNotFound(true) })
  }, [slug])

  if (notFound) {
    return (
      <div className="min-h-screen bg-obsidian">
        <Navbar />
        <div className="pt-40 pb-24 text-center container-lux">
          <h1 className="font-serif text-4xl text-gold mb-4">Story Not Found</h1>
          <Link href="/blog" className="btn-outline-gold inline-flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Back to Journal</Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <article className="pt-32 pb-24">
        <div className="container-lux max-w-3xl mx-auto">
          <Link href="/blog" className="inline-flex items-center gap-2 text-gold text-xs uppercase tracking-[0.25em] mb-10 hover:gap-4 transition-all"><ArrowLeft className="w-4 h-4" /> Journal</Link>
          {post ? (
            <>
              <div className="text-[10px] uppercase tracking-[0.3em] text-gold mb-4">{post.author} • {new Date(post.createdAt).toLocaleDateString()}</div>
              <h1 className="text-4xl md:text-6xl font-serif text-platinum-light mb-8 leading-tight">{post.title}</h1>
              {post.coverImage && (
                <div className="aspect-[16/9] overflow-hidden mb-10 luxury-card rounded-sm">
                  <img src={post.coverImage + '?auto=format&fit=crop&w=1200&q=85'} alt={post.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="text-lg text-platinum-light/80 leading-relaxed whitespace-pre-line font-light">{post.content}</div>
            </>
          ) : (
            <div className="text-platinum-light/50">Loading story...</div>
          )}
        </div>
      </article>
      <Footer />
    </div>
  )
}
