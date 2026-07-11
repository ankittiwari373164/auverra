'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingBag, Eye } from 'lucide-react'
import { useApp } from '@/app/providers'
import { toast } from 'sonner'

export function ProductCard({ product, priority = false }) {
  const { addToCart, toggleWishlist, wishlist } = useApp() || {}
  const inWishlist = wishlist?.some(w => w.productId === product._id)
  const colors = product.variants?.dial || []
  const [selectedColor, setSelectedColor] = useState(colors.length === 1 ? 0 : null)

  const activeColor = selectedColor != null ? colors[selectedColor] : null
  const displayImage = activeColor?.images?.[0] || product.images[0]
  const displayPrice = activeColor?.price ?? product.price
  const displayCompareAt = activeColor?.compareAtPrice ?? product.compareAtPrice

  const onAdd = (e) => {
    e.preventDefault(); e.stopPropagation()
    if (colors.length > 1 && selectedColor == null) { toast.error('Please select a color'); return }
    const cartProduct = { ...product, price: displayPrice, compareAtPrice: displayCompareAt, images: [displayImage] }
    const variant = activeColor ? { dial: { name: activeColor.name, hex: activeColor.hex } } : null
    addToCart?.(cartProduct, variant, 1)
    toast.success(`${product.name} added to bag`)
  }
  const onWish = (e) => {
    e.preventDefault(); e.stopPropagation()
    toggleWishlist?.(product)
  }
  const onPickColor = (e, i) => {
    e.preventDefault(); e.stopPropagation()
    setSelectedColor(i)
  }

  return (
    <Link href={`/product/${product.slug}`} className="group luxury-card block rounded-sm">
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-b from-obsidian-700 to-obsidian-900">
        {product.badges?.[0] && (
          <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-gold text-obsidian text-[10px] uppercase tracking-[0.2em] font-bold">{product.badges[0]}</div>
        )}
        {displayCompareAt && (
          <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-rosegold text-white text-[10px] uppercase tracking-[0.2em] font-bold">Save ₹{((displayCompareAt - displayPrice)/1000).toFixed(0)}K</div>
        )}
        <img src={displayImage + '?auto=format&fit=crop&w=800&q=85'} alt={product.name} className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-110" loading={priority ? 'eager' : 'lazy'} />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent opacity-60" />
        {colors.length > 1 && (
          <div className="absolute bottom-16 left-4 right-4 flex gap-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
            {colors.map((c, i) => (
              <button key={i} onClick={e => onPickColor(e, i)} title={c.name} className={`w-6 h-6 rounded-full border-2 transition ${selectedColor === i ? 'border-gold scale-110' : 'border-white/50 hover:border-gold'}`} style={{ background: c.hex }} />
            ))}
          </div>
        )}
        <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
          <button onClick={onAdd} className="flex-1 bg-gold text-obsidian text-xs uppercase tracking-widest font-bold py-3 hover:bg-gold-light transition">{colors.length > 1 && selectedColor == null ? 'Select Color' : 'Add to Bag'}</button>
          <button onClick={onWish} className={`w-11 h-11 border ${inWishlist ? 'bg-gold border-gold text-obsidian' : 'border-gold/40 text-gold hover:bg-gold/10'} flex items-center justify-center transition`}>
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
      <div className="p-5 md:p-6">
        <div className="text-[10px] uppercase tracking-[0.25em] text-gold/70 mb-2">{product.category}</div>
        <h3 className="font-serif text-lg md:text-xl mb-1 text-platinum-light group-hover:text-gold transition">{product.name}</h3>
        <p className="text-xs text-platinum-light/50 italic mb-3">{product.tagline}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-serif text-gradient-gold">₹{displayPrice.toLocaleString('en-IN')}</span>
          {displayCompareAt && <span className="text-xs text-platinum-light/40 line-through">₹{displayCompareAt.toLocaleString('en-IN')}</span>}
        </div>
      </div>
    </Link>
  )
}