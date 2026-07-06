'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { useApp } from '@/app/providers'
import { Minus, Plus, X, ShoppingBag, ArrowRight, Shield, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const { cart, updateQty, removeFromCart, user } = useApp() || {}
  const [coupon, setCoupon] = useState('')
  const [appliedCode, setAppliedCode] = useState(null)
  const [discount, setDiscount] = useState(0)
  const [placing, setPlacing] = useState(false)
  const [applying, setApplying] = useState(false)
  const router = useRouter()

  const subtotal = cart?.reduce((s, i) => s + i.price * i.quantity, 0) || 0
  const shipping = subtotal > 500000 ? 0 : subtotal > 0 ? 2500 : 0
  const tax = Math.round(subtotal * 0.03)
  const total = subtotal + shipping + tax - discount

  const applyCoupon = async () => {
    if (!coupon) return
    setApplying(true)
    try {
      const res = await fetch('/api/coupons/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: coupon, subtotal }) })
      const data = await res.json()
      if (res.ok && data.coupon) {
        setDiscount(data.coupon.discount); setAppliedCode(data.coupon.code)
        toast.success(`Coupon applied: ${data.coupon.type === 'percent' ? data.coupon.value + '% off' : '₹' + data.coupon.value + ' off'}`)
      } else { setDiscount(0); setAppliedCode(null); toast.error(data.error || 'Invalid coupon') }
    } catch { toast.error('Could not validate coupon') }
    setApplying(false)
  }

  const checkout = async () => {
    if (!user) { router.push('/login?redirect=/cart'); return }
    if (cart.length === 0) return
    setPlacing(true)
    const shippingInfo = { name: user.name || user.email, email: user.email, address: 'To be entered at checkout', city: '-', country: 'India' }
    const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: cart, shipping: shippingInfo, subtotal, shippingCost: shipping, tax, total, paymentMethod: 'cod', couponCode: appliedCode, discount }) })
    const data = await res.json()
    setPlacing(false)
    if (data.order) { toast.success('Order placed! Order ID: ' + data.order.orderId); router.push('/account/orders') }
    else toast.error(data.error || 'Failed to place order')
  }

  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <div className="pt-32 pb-20">
        <div className="container-lux">
          <div className="text-center mb-12">
            <div className="divider-gold w-24 mx-auto mb-6" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4 block">Your Selection</span>
            <h1 className="text-5xl md:text-6xl font-serif text-gradient-gold">Shopping Bag</h1>
          </div>

          {!cart || cart.length === 0 ? (
            <div className="text-center py-20 max-w-md mx-auto">
              <ShoppingBag className="w-16 h-16 text-gold/30 mx-auto mb-6" />
              <p className="font-serif text-2xl text-platinum-light mb-4">Your bag awaits its first timepiece.</p>
              <p className="text-platinum-light/60 mb-8">Explore our collection and discover the piece that resonates with you.</p>
              <Link href="/shop" className="btn-gold">Explore Collection</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
              <div>
                <div className="divide-y divide-gold/10">
                  {cart.map((item, i) => (
                    <div key={i} className="py-6 flex gap-4 md:gap-6">
                      <Link href={`/product/${item.slug}`} className="flex-shrink-0 w-28 h-28 md:w-36 md:h-36 overflow-hidden bg-obsidian-700">
                        <img src={item.image + '?auto=format&fit=crop&w=400&q=80'} alt={item.name} className="w-full h-full object-cover" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-4 mb-2">
                          <div>
                            <Link href={`/product/${item.slug}`} className="font-serif text-lg text-platinum-light hover:text-gold">{item.name}</Link>
                            {item.variant?.dial && <div className="text-xs text-platinum-light/60 mt-1">Dial: {item.variant.dial.name}</div>}
                            {item.variant?.strap && <div className="text-xs text-platinum-light/60">Strap: {item.variant.strap.name}</div>}
                          </div>
                          <button onClick={() => removeFromCart(item.productId, item.variant)} className="text-platinum-light/40 hover:text-gold"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center border border-gold/30">
                            <button onClick={() => updateQty(item.productId, item.variant, item.quantity - 1)} className="p-2 hover:bg-gold/10"><Minus className="w-3 h-3" /></button>
                            <span className="px-4 text-sm">{item.quantity}</span>
                            <button onClick={() => updateQty(item.productId, item.variant, item.quantity + 1)} className="p-2 hover:bg-gold/10"><Plus className="w-3 h-3" /></button>
                          </div>
                          <div className="font-serif text-lg text-gradient-gold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <aside>
                <div className="glass border border-gold/20 p-8 rounded-sm sticky top-32">
                  <h3 className="font-serif text-2xl text-gold mb-6">Order Summary</h3>
                  <div className="space-y-3 text-sm mb-6">
                    <div className="flex justify-between"><span className="text-platinum-light/60">Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span className="text-platinum-light/60">Shipping</span><span>{shipping === 0 ? <span className="text-green-400">FREE</span> : `₹${shipping.toLocaleString('en-IN')}`}</span></div>
                    <div className="flex justify-between"><span className="text-platinum-light/60">Tax (GST)</span><span>₹{tax.toLocaleString('en-IN')}</span></div>
                    {discount > 0 && <div className="flex justify-between text-green-400"><span>Discount</span><span>-₹{discount.toLocaleString('en-IN')}</span></div>}
                  </div>

                  <div className="flex gap-2 mb-6">
                    <input value={coupon} onChange={e => setCoupon(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyCoupon()} placeholder="Coupon code" className="flex-1 bg-obsidian-700 border border-gold/20 px-3 py-2 text-sm outline-none focus:border-gold uppercase" />
                    <button disabled={applying} onClick={applyCoupon} className="px-4 border border-gold/40 text-gold text-xs uppercase tracking-widest hover:bg-gold/10 disabled:opacity-50">{applying ? '...' : 'Apply'}</button>
                  </div>

                  <div className="pt-4 border-t border-gold/10 flex justify-between items-baseline mb-6">
                    <span className="font-serif text-lg">Total</span>
                    <span className="font-serif text-2xl text-gradient-gold">₹{total.toLocaleString('en-IN')}</span>
                  </div>

                  <button onClick={checkout} disabled={placing} className="btn-gold w-full inline-flex items-center justify-center gap-2">
                    {placing ? 'Placing Order...' : <>Proceed to Checkout <ArrowRight className="w-4 h-4" /></>}
                  </button>

                  <div className="mt-6 space-y-2 text-xs text-platinum-light/60">
                    <div className="flex items-center gap-2"><Shield className="w-3 h-3 text-gold" /> Secure encrypted checkout</div>
                    <div className="flex items-center gap-2"><Truck className="w-3 h-3 text-gold" /> Free insured delivery</div>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
