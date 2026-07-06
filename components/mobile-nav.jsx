'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Watch, ShoppingBag, Heart, User } from 'lucide-react'
import { useApp } from '@/app/providers'

export function MobileNav() {
  const pathname = usePathname()
  const { cart, wishlist } = useApp() || {}

  if (pathname?.startsWith('/admin')) return null

  const cartCount = cart?.reduce((s, i) => s + i.quantity, 0) || 0
  const wishlistCount = wishlist?.length || 0

  const items = [
    { href: '/', label: 'Home', icon: Home, match: (p) => p === '/' },
    { href: '/shop', label: 'Shop', icon: Watch, match: (p) => p.startsWith('/shop') || p.startsWith('/product') },
    { href: '/cart', label: 'Cart', icon: ShoppingBag, match: (p) => p.startsWith('/cart'), count: cartCount },
    { href: '/account/wishlist', label: 'Wishlist', icon: Heart, match: (p) => p.startsWith('/account/wishlist'), count: wishlistCount },
    { href: '/account', label: 'Account', icon: User, match: (p) => p.startsWith('/account') && !p.startsWith('/account/wishlist') || p.startsWith('/login') || p.startsWith('/signup') },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-dark border-t border-gold/15" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="grid grid-cols-5">
        {items.map(item => {
          const active = item.match(pathname || '')
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-1 py-3 relative">
              <div className="relative">
                <item.icon className={`w-5 h-5 ${active ? 'text-gold' : 'text-platinum-light/50'}`} strokeWidth={active ? 2 : 1.5} />
                {item.count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gold text-obsidian text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{item.count}</span>
                )}
              </div>
              <span className={`text-[9px] uppercase tracking-wider ${active ? 'text-gold' : 'text-platinum-light/40'}`}>{item.label}</span>
              {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gold rounded-full" />}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
