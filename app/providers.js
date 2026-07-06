'use client'

import { Toaster } from 'sonner'
import { createContext, useContext, useEffect, useState } from 'react'
import { MobileNav } from '@/components/mobile-nav'

const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

export function Providers({ children }) {
  const [user, setUser] = useState(null)
  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const refreshUser = async () => {
    try {
      const res = await fetch('/api/me', { cache: 'no-store' })
      const data = await res.json()
      setUser(data.user || null)
      if (data.user) {
        const c = await fetch('/api/cart', { cache: 'no-store' }).then(r => r.json())
        setCart(c.items || [])
        const w = await fetch('/api/wishlist', { cache: 'no-store' }).then(r => r.json())
        setWishlist(w.items || [])
      } else {
        const guestCart = JSON.parse(localStorage.getItem('auverra_cart') || '[]')
        setCart(guestCart)
      }
    } catch (e) { setUser(null) }
    setLoading(false)
  }

  useEffect(() => { refreshUser() }, [])

  const addToCart = async (product, variant = null, quantity = 1) => {
    const item = { productId: product._id || product.id, slug: product.slug, name: product.name, price: product.price, image: product.images?.[0], variant, quantity }
    if (user) {
      const res = await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) })
      const data = await res.json()
      setCart(data.items || [])
    } else {
      const existing = cart.find(c => c.productId === item.productId && JSON.stringify(c.variant) === JSON.stringify(variant))
      let newCart
      if (existing) { newCart = cart.map(c => c === existing ? { ...c, quantity: c.quantity + quantity } : c) }
      else { newCart = [...cart, item] }
      setCart(newCart)
      localStorage.setItem('auverra_cart', JSON.stringify(newCart))
    }
  }

  const removeFromCart = async (productId, variant = null) => {
    if (user) {
      const res = await fetch('/api/cart', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId, variant }) })
      const data = await res.json()
      setCart(data.items || [])
    } else {
      const newCart = cart.filter(c => !(c.productId === productId && JSON.stringify(c.variant) === JSON.stringify(variant)))
      setCart(newCart)
      localStorage.setItem('auverra_cart', JSON.stringify(newCart))
    }
  }

  const updateQty = async (productId, variant, quantity) => {
    if (quantity < 1) return removeFromCart(productId, variant)
    if (user) {
      const res = await fetch('/api/cart', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId, variant, quantity }) })
      const data = await res.json()
      setCart(data.items || [])
    } else {
      const newCart = cart.map(c => (c.productId === productId && JSON.stringify(c.variant) === JSON.stringify(variant)) ? { ...c, quantity } : c)
      setCart(newCart)
      localStorage.setItem('auverra_cart', JSON.stringify(newCart))
    }
  }

  const toggleWishlist = async (product) => {
    if (!user) { window.location.href = '/login?redirect=/shop'; return }
    const isIn = wishlist.some(w => w.productId === (product._id || product.id))
    const method = isIn ? 'DELETE' : 'POST'
    const res = await fetch('/api/wishlist', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: product._id || product.id, slug: product.slug, name: product.name, price: product.price, image: product.images?.[0] }) })
    const data = await res.json()
    setWishlist(data.items || [])
  }

  return (
    <AppContext.Provider value={{ user, cart, wishlist, loading, refreshUser, addToCart, removeFromCart, updateQty, toggleWishlist, setUser }}>
      {children}
      <MobileNav />
      <Toaster position="top-right" theme="light" toastOptions={{ style: { background: '#ffffff', border: '1px solid rgba(201,169,97,0.3)', color: '#1a1a1e' } }} />
    </AppContext.Provider>
  )
}