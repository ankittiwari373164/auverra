'use client'
import { useEffect, useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { useApp } from '@/app/providers'
import Link from 'next/link'

export default function OrdersPage() {
  const { user, loading } = useApp() || {}
  const [orders, setOrders] = useState([])

  useEffect(() => { if (user) fetch('/api/orders').then(r => r.json()).then(d => setOrders(d.items || [])) }, [user])

  if (loading) return <div className="min-h-screen bg-obsidian"><Navbar /></div>
  if (!user) return <div className="min-h-screen bg-obsidian"><Navbar /><div className="pt-32 container-lux text-center"><Link href="/login" className="btn-gold">Please Sign In</Link></div></div>

  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <div className="pt-32 pb-20">
        <div className="container-lux">
          <div className="text-center mb-12">
            <div className="divider-gold w-24 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-serif text-gradient-gold">My Orders</h1>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-serif text-2xl text-platinum-light mb-4">No orders yet</p>
              <Link href="/shop" className="btn-gold">Start Shopping</Link>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4">
              {orders.map(o => (
                <div key={o.orderId} className="glass border border-gold/20 p-6 md:p-8 rounded-sm">
                  <div className="flex flex-wrap justify-between gap-4 mb-6 pb-4 border-b border-gold/10">
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-gold mb-1">Order {o.orderId}</div>
                      <div className="text-sm text-platinum-light/60">Placed {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-serif text-2xl text-gradient-gold">₹{o.total?.toLocaleString('en-IN')}</div>
                      <span className="inline-block mt-1 px-3 py-1 border border-gold/30 text-[10px] uppercase tracking-widest text-gold">{o.status}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {o.items?.map((it, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <img src={it.image + '?auto=format&fit=crop&w=200&q=80'} className="w-14 h-14 object-cover" />
                        <div className="flex-1">
                          <div className="font-serif text-platinum-light">{it.name}</div>
                          <div className="text-xs text-platinum-light/60">Qty: {it.quantity}</div>
                        </div>
                        <div className="text-sm">₹{(it.price * it.quantity).toLocaleString('en-IN')}</div>
                      </div>
                    ))}
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
