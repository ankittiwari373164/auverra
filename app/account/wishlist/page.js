'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { useApp } from '@/app/providers'
import { Heart } from 'lucide-react'

export default function WishlistPage() {
  const { wishlist, user, loading, addToCart, toggleWishlist } = useApp() || {}

  if (loading) return <div className="min-h-screen bg-obsidian"><Navbar /></div>

  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <div className="pt-32 pb-20">
        <div className="container-lux">
          <div className="text-center mb-12">
            <div className="divider-gold w-24 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-serif text-gradient-gold">My Wishlist</h1>
          </div>
          {!user ? (
            <div className="text-center py-20"><Link href="/login" className="btn-gold">Sign in to view wishlist</Link></div>
          ) : !wishlist || wishlist.length === 0 ? (
            <div className="text-center py-20">
              <Heart className="w-16 h-16 text-gold/30 mx-auto mb-6" />
              <p className="font-serif text-2xl text-platinum-light mb-4">Your wishlist is empty</p>
              <Link href="/shop" className="btn-gold">Explore Timepieces</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlist.map(item => (
                <div key={item.productId} className="luxury-card p-4 rounded-sm">
                  <Link href={`/product/${item.slug}`} className="block aspect-square overflow-hidden bg-obsidian-700 mb-4">
                    <img src={item.image + '?auto=format&fit=crop&w=400&q=80'} alt={item.name} className="w-full h-full object-cover" />
                  </Link>
                  <h3 className="font-serif text-lg mb-2">{item.name}</h3>
                  <div className="text-gradient-gold font-serif mb-4">₹{item.price?.toLocaleString('en-IN')}</div>
                  <div className="flex gap-2">
                    <button onClick={() => addToCart(item)} className="flex-1 text-xs px-3 py-2 bg-gold text-obsidian uppercase tracking-widest hover:bg-gold-light">Add to Bag</button>
                    <button onClick={() => toggleWishlist({ _id: item.productId, ...item })} className="px-3 py-2 border border-gold/30 text-gold text-xs hover:bg-gold/10">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
