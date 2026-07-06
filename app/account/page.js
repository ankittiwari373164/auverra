'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { useApp } from '@/app/providers'
import { useRouter } from 'next/navigation'
import { Package, Heart, MapPin, Settings, LogOut, LayoutDashboard } from 'lucide-react'

export default function AccountPage() {
  const { user, loading, setUser } = useApp() || {}
  const [orders, setOrders] = useState([])
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/login?redirect=/account')
  }, [user, loading])

  useEffect(() => {
    if (user) fetch('/api/orders').then(r => r.json()).then(d => setOrders(d.items || []))
  }, [user])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/')
  }

  if (loading || !user) return <div className="min-h-screen bg-obsidian"><Navbar /></div>

  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <div className="pt-32 pb-20">
        <div className="container-lux">
          <div className="text-center mb-12">
            <div className="divider-gold w-24 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-serif text-gradient-gold mb-3">Welcome, {user.name}</h1>
            <p className="text-platinum-light/60">{user.email}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {[
              { icon: Package, label: 'Orders', desc: `${orders.length} total`, href: '/account/orders' },
              { icon: Heart, label: 'Wishlist', desc: 'Saved pieces', href: '/account/wishlist' },
              { icon: MapPin, label: 'Addresses', desc: 'Shipping & billing', href: '/account/addresses' },
              { icon: Settings, label: 'Settings', desc: 'Profile & preferences', href: '/account/settings' },
              ...(user.role === 'admin' ? [{ icon: LayoutDashboard, label: 'Admin Panel', desc: 'Manage store', href: '/admin' }] : []),
            ].map((item, i) => (
              <Link key={i} href={item.href} className="glass border border-gold/20 p-8 rounded-sm luxury-card group">
                <item.icon className="w-8 h-8 text-gold mb-4" strokeWidth={1} />
                <h3 className="font-serif text-xl mb-1 group-hover:text-gold transition">{item.label}</h3>
                <p className="text-sm text-platinum-light/60">{item.desc}</p>
              </Link>
            ))}
            <button onClick={logout} className="glass border border-gold/20 p-8 rounded-sm luxury-card group text-left">
              <LogOut className="w-8 h-8 text-gold mb-4" strokeWidth={1} />
              <h3 className="font-serif text-xl mb-1 group-hover:text-gold transition">Sign Out</h3>
              <p className="text-sm text-platinum-light/60">Log out of your account</p>
            </button>
          </div>

          {orders.length > 0 && (
            <div>
              <h2 className="text-2xl font-serif mb-6 text-gold">Recent Orders</h2>
              <div className="space-y-3">
                {orders.slice(0, 3).map(o => (
                  <div key={o.orderId} className="glass border border-gold/10 p-6 rounded-sm flex flex-wrap justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-gold">{o.orderId}</div>
                      <div className="text-sm text-platinum-light/70">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-serif text-lg text-gradient-gold">₹{o.total?.toLocaleString('en-IN')}</div>
                      <div className="text-xs uppercase tracking-widest text-gold/70">{o.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
