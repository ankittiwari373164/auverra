'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Search, ShoppingBag, Heart, User, Menu, X, LogOut, LayoutDashboard } from 'lucide-react'
import { useApp } from '@/app/providers'
import { useRouter, usePathname } from 'next/navigation'

const PHOTO_HERO_PAGES = ['/', '/about', '/craftsmanship']

export function Navbar() {
  const { user, cart, wishlist, setUser } = useApp() || {}
  const pathname = usePathname()
  const hasPhotoHero = PHOTO_HERO_PAGES.includes(pathname)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [q, setQ] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/')
    router.refresh()
  }

  const cartCount = cart?.reduce((s, i) => s + i.quantity, 0) || 0

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass-dark py-3 border-b border-gold/10' : `bg-transparent py-6 ${hasPhotoHero ? 'on-image' : ''}`}`}>
      <div className="container-lux flex items-center justify-between">
        <button onClick={() => setOpen(true)} className="lg:hidden text-platinum-light"><Menu className="w-6 h-6" /></button>

        <Link href="/" className="flex items-center gap-3 group">
          <img src="/logo.png" alt="Auverra Watches" className="w-12 h-12 md:w-13 md:h-13 drop-shadow-[0_0_12px_rgba(201,169,97,0.35)] group-hover:scale-105 transition-transform duration-500" />
          <span className="flex flex-col leading-none">
            <span className="text-xl md:text-2xl font-serif font-bold tracking-[0.2em] text-gradient-gold">AUVERRA</span>
            <span className="text-[8px] md:text-[9px] uppercase tracking-[0.45em] text-platinum-light/50 mt-1">Watches</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-10">
          {[
            { href: '/shop', label: 'Collections' },
            { href: '/shop?category=chronograph', label: 'Chronographs' },
            { href: '/shop?category=tourbillon', label: 'Tourbillons' },
            { href: '/shop?category=ladies', label: 'Ladies' },
            { href: '/blog', label: 'Journal' },
            { href: '/contact', label: 'Contact' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="text-[11px] uppercase tracking-[0.25em] text-platinum-light/80 hover:text-gold transition-colors duration-300 relative group">
              {l.label}
              <span className="absolute -bottom-2 left-0 w-0 h-px bg-gold group-hover:w-full transition-all duration-500"></span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 md:gap-5">
          <button onClick={() => setSearchOpen(!searchOpen)} className="text-platinum-light/80 hover:text-gold transition"><Search className="w-5 h-5" /></button>
          <Link href="/account/wishlist" className="text-platinum-light/80 hover:text-gold transition relative hidden sm:block">
            <Heart className="w-5 h-5" />
            {wishlist?.length > 0 && <span className="absolute -top-2 -right-2 bg-gold text-obsidian text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{wishlist.length}</span>}
          </Link>
          <Link href="/cart" className="text-platinum-light/80 hover:text-gold transition relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-gold text-obsidian text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
          </Link>
          <div className="relative">
            <button onClick={() => setProfileOpen(!profileOpen)} className="text-platinum-light/80 hover:text-gold transition"><User className="w-5 h-5" /></button>
            {profileOpen && (
              <div onMouseLeave={() => setProfileOpen(false)} className="absolute right-0 mt-3 w-56 glass-dark border border-gold/20 rounded-sm py-2">
                {user ? (
                  <>
                    <div className="px-4 py-2 border-b border-gold/10">
                      <div className="text-xs text-platinum-light/60">Signed in as</div>
                      <div className="text-sm text-gold truncate">{user.email}</div>
                    </div>
                    <Link href="/account" className="block px-4 py-2 text-sm hover:bg-gold/10 hover:text-gold transition">My Account</Link>
                    <Link href="/account/orders" className="block px-4 py-2 text-sm hover:bg-gold/10 hover:text-gold transition">Orders</Link>
                    <Link href="/account/wishlist" className="block px-4 py-2 text-sm hover:bg-gold/10 hover:text-gold transition">Wishlist</Link>
                    {user.role === 'admin' && <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-gold hover:bg-gold/10 transition"><LayoutDashboard className="w-4 h-4" /> Admin Panel</Link>}
                    <button onClick={logout} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm hover:bg-gold/10 hover:text-gold transition"><LogOut className="w-4 h-4" /> Logout</button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block px-4 py-2 text-sm hover:bg-gold/10 hover:text-gold transition">Login</Link>
                    <Link href="/signup" className="block px-4 py-2 text-sm hover:bg-gold/10 hover:text-gold transition">Create Account</Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className="absolute top-full left-0 right-0 glass-dark border-t border-gold/10 py-6 px-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <form onSubmit={(e) => { e.preventDefault(); router.push(`/shop?search=${encodeURIComponent(q)}`); setSearchOpen(false) }} className="max-w-3xl mx-auto flex items-center gap-4 border-b border-gold/30 pb-3">
            <Search className="w-5 h-5 text-gold" />
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search chronographs, tourbillons, collections..." className="flex-1 bg-transparent text-lg outline-none text-platinum-light placeholder:text-platinum-light/40 font-serif" />
            <button onClick={() => setSearchOpen(false)}><X className="w-5 h-5 text-platinum-light/60" /></button>
          </form>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-[60] glass-dark lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute top-6 right-6"><button onClick={() => setOpen(false)}><X className="w-6 h-6 text-platinum-light" /></button></div>
          <nav className="h-full flex flex-col items-center justify-center gap-8" onClick={e => e.stopPropagation()}>
            {['Collections', 'Chronographs', 'Tourbillons', 'Ladies', 'Journal', 'Contact'].map((l, i) => (
              <Link key={i} href={i === 0 ? '/shop' : i === 4 ? '/blog' : i === 5 ? '/contact' : `/shop?category=${l.toLowerCase()}`} onClick={() => setOpen(false)} className="text-2xl font-serif text-platinum-light hover:text-gold transition">{l}</Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}