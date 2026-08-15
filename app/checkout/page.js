'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { useApp } from '@/app/providers'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { QrCode, CheckCircle2, ArrowLeft, Upload, Loader2, MessageCircle } from 'lucide-react'

// ⚠️ Replace with your real UPI ID before going live — this is what the QR
// code and payment link actually pay into. Customers pay the FULL order
// total here upfront; there is no cash-on-delivery option.
const UPI_ID = 'auverrawatches@upi'
const WHATSAPP_NUMBER = '912249001897'

const inputCls = "w-full bg-obsidian-700 border border-gold/20 px-3 py-2 text-sm outline-none focus:border-gold text-platinum-light"
const labelCls = "text-xs uppercase tracking-widest text-gold mb-1 block"

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-obsidian" />}>
      <CheckoutInner />
    </Suspense>
  )
}

function CheckoutInner() {
  const { cart, user, loading: userLoading } = useApp() || {}
  const router = useRouter()
  const searchParams = useSearchParams()
  const couponCode = searchParams.get('coupon') || null
  const discount = Number(searchParams.get('discount') || 0)

  const [step, setStep] = useState('address') // address -> payment -> success
  const [addresses, setAddresses] = useState([])
  const [selectedAddr, setSelectedAddr] = useState(null)
  const [form, setForm] = useState({ fullName: '', phone: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'India' })
  const [utr, setUtr] = useState('')
  const [screenshotPath, setScreenshotPath] = useState(null)
  const [screenshotPreview, setScreenshotPreview] = useState(null)
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [placedOrder, setPlacedOrder] = useState(null)

  const subtotal = cart?.reduce((s, i) => s + i.price * i.quantity, 0) || 0
  const total = Math.max(0, subtotal - discount)

  useEffect(() => {
    if (!userLoading && !user) router.push('/login?redirect=/checkout')
  }, [user, userLoading])

  useEffect(() => {
    if (!user) return
    fetch('/api/addresses').then(r => r.json()).then(d => {
      setAddresses(d.items || [])
      const def = (d.items || []).find(a => a.isDefault) || d.items?.[0]
      if (def) setSelectedAddr(def._id)
    })
  }, [user])

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-obsidian">
        <Navbar />
        <div className="pt-40 pb-24 text-center container-lux">
          <p className="text-platinum-light/60 mb-6">Your bag is empty.</p>
          <a href="/shop" className="btn-gold">Continue Shopping</a>
        </div>
        <Footer />
      </div>
    )
  }

  const getShippingInfo = () => {
    if (selectedAddr) {
      const a = addresses.find(x => x._id === selectedAddr)
      return { name: a.fullName, phone: a.phone, address: `${a.line1}${a.line2 ? ', ' + a.line2 : ''}`, city: a.city, state: a.state, postalCode: a.postalCode, country: a.country }
    }
    return { name: form.fullName, phone: form.phone, address: `${form.line1}${form.line2 ? ', ' + form.line2 : ''}`, city: form.city, state: form.state, postalCode: form.postalCode, country: form.country }
  }

  const confirmAddress = (e) => {
    e.preventDefault()
    if (!selectedAddr && (!form.fullName || !form.phone || !form.line1 || !form.city || !form.state || !form.postalCode)) {
      toast.error('Please fill in all required address fields'); return
    }
    setStep('payment')
  }

  // Pay the full order total via UPI — not a fixed confirmation fee.
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=Auverra%20Watches&am=${total}&cu=INR&tn=Order%20Payment`
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiLink)}`

  const handleScreenshot = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingScreenshot(true)
    setScreenshotPreview(URL.createObjectURL(file))
    const supabase = createClient()
    const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-]+/g, '-')}`
    const { error } = await supabase.storage.from('payment-proofs').upload(path, file, { upsert: false })
    setUploadingScreenshot(false)
    if (error) { toast.error('Failed to upload screenshot: ' + error.message); setScreenshotPreview(null); return }
    setScreenshotPath(path)
    toast.success('Screenshot uploaded')
  }

  const placeOrder = async () => {
    if (!utr || utr.trim().length < 6) { toast.error('Please enter the UTR / Transaction Reference ID after paying'); return }
    if (!screenshotPath) { toast.error('Please upload a screenshot of your payment'); return }
    setPlacing(true)
    const shippingInfo = { ...getShippingInfo(), upiUtr: utr.trim(), upiPaymentScreenshotPath: screenshotPath }
    const res = await fetch('/api/orders', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart, shipping: shippingInfo, subtotal, shippingCost: 0, tax: 0, total, paymentMethod: 'upi', couponCode, discount }),
    })
    const data = await res.json()
    setPlacing(false)
    if (data.order) { setPlacedOrder(data.order); setStep('success') }
    else toast.error(data.error || 'Failed to place order')
  }

  const whatsappOrderMessage = placedOrder ? encodeURIComponent(
    `Hi Auverra Watches! I've placed an order and paid ₹${total.toLocaleString('en-IN')} via UPI.\n\nOrder ID: ${placedOrder.orderId}\nItems: ${(cart || []).map(i => `${i.name} x${i.quantity}`).join(', ')}\nTotal Paid: ₹${total.toLocaleString('en-IN')}\nUTR: ${utr}\n\nI've also uploaded my payment screenshot on the site — please verify and confirm my order. Attaching the screenshot here too:`
  ) : ''

  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <div className="pt-32 pb-24">
        <div className="container-lux max-w-3xl mx-auto">
          <div className="mb-10">
            <div className="text-[10px] uppercase tracking-[0.4em] text-gold mb-3">Checkout</div>
            <h1 className="text-4xl md:text-5xl font-serif text-gradient-gold">{step === 'address' ? 'Delivery Address' : step === 'payment' ? 'Pay via UPI' : 'Order Placed'}</h1>
          </div>

          {step === 'address' && (
            <form onSubmit={confirmAddress} className="space-y-6">
              {addresses.length > 0 && (
                <div className="space-y-3">
                  <label className={labelCls}>Choose a saved address</label>
                  {addresses.map(a => (
                    <label key={a._id} className={`flex items-start gap-3 p-4 border rounded-sm cursor-pointer ${selectedAddr === a._id ? 'border-gold bg-gold/5' : 'border-gold/15'}`}>
                      <input type="radio" checked={selectedAddr === a._id} onChange={() => setSelectedAddr(a._id)} className="accent-gold mt-1" />
                      <div className="text-sm">
                        <div className="text-platinum-light">{a.fullName} · {a.phone}</div>
                        <div className="text-platinum-light/60">{a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} {a.postalCode}</div>
                      </div>
                    </label>
                  ))}
                  <button type="button" onClick={() => setSelectedAddr(null)} className={`text-sm ${!selectedAddr ? 'text-gold' : 'text-platinum-light/50 hover:text-gold'}`}>+ Use a different address</button>
                </div>
              )}

              {!selectedAddr && (
                <div className="glass border border-gold/15 p-6 rounded-sm space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelCls}>Full Name</label><input required value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} className={inputCls} /></div>
                    <div><label className={labelCls}>Phone</label><input required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} /></div>
                  </div>
                  <div><label className={labelCls}>Address Line 1</label><input required value={form.line1} onChange={e => setForm(f => ({ ...f, line1: e.target.value }))} className={inputCls} /></div>
                  <div><label className={labelCls}>Address Line 2 (optional)</label><input value={form.line2} onChange={e => setForm(f => ({ ...f, line2: e.target.value }))} className={inputCls} /></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div><label className={labelCls}>City</label><input required value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className={inputCls} /></div>
                    <div><label className={labelCls}>State</label><input required value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} className={inputCls} /></div>
                    <div><label className={labelCls}>Postal Code</label><input required value={form.postalCode} onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))} className={inputCls} /></div>
                  </div>
                </div>
              )}
              <button className="btn-gold w-full">Continue to Payment</button>
            </form>
          )}

          {step === 'payment' && (
            <div className="space-y-6">
              <button onClick={() => setStep('address')} className="inline-flex items-center gap-2 text-sm text-platinum-light/60 hover:text-gold"><ArrowLeft className="w-4 h-4" /> Back to address</button>

              <div className="glass border border-gold/20 p-8 rounded-sm text-center">
                <div className="inline-flex items-center gap-2 text-gold text-xs uppercase tracking-widest mb-4"><QrCode className="w-4 h-4" /> Pay via UPI</div>
                <p className="text-sm text-platinum-light/60 max-w-md mx-auto mb-2">Scan the QR code below to pay <span className="text-gold font-semibold">₹{total.toLocaleString('en-IN')}</span> — your full order total.</p>
                <p className="text-xs text-platinum-light/40 max-w-md mx-auto mb-6">We manually verify every payment before dispatch, usually within a few hours.</p>
                <img src={qrSrc} alt="UPI QR Code" className="mx-auto mb-4 border border-gold/20 rounded-sm" width={220} height={220} />
                <div className="text-platinum-light/50 text-sm mb-6">{UPI_ID}</div>

                <div className="max-w-sm mx-auto text-left space-y-4">
                  <div>
                    <label className={labelCls}>UTR / Transaction Reference ID</label>
                    <input value={utr} onChange={e => setUtr(e.target.value)} placeholder="e.g. 401422121258" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Upload Payment Screenshot</label>
                    {screenshotPreview ? (
                      <div className="flex items-center gap-3">
                        <img src={screenshotPreview} alt="Payment screenshot" className="w-16 h-16 object-cover rounded-sm border border-gold/20" />
                        <label className="text-xs text-gold hover:underline cursor-pointer">
                          {uploadingScreenshot ? 'Uploading...' : 'Change'}
                          <input type="file" accept="image/*" className="hidden" onChange={handleScreenshot} disabled={uploadingScreenshot} />
                        </label>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 border border-dashed border-gold/30 rounded-sm py-4 cursor-pointer hover:border-gold/60 hover:bg-gold/5 transition text-platinum-light/50 text-sm">
                        {uploadingScreenshot ? <Loader2 className="w-4 h-4 animate-spin text-gold" /> : <Upload className="w-4 h-4" />} Choose Screenshot
                        <input type="file" accept="image/*" className="hidden" onChange={handleScreenshot} disabled={uploadingScreenshot} />
                      </label>
                    )}
                    <p className="text-[11px] text-platinum-light/40 mt-2">Please ensure the amount has been deducted before confirming.</p>
                  </div>
                </div>
              </div>

              <div className="glass border border-gold/15 p-6 rounded-sm">
                <div className="flex justify-between text-sm mb-2"><span className="text-platinum-light/60">Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                {discount > 0 && <div className="flex justify-between text-sm mb-2"><span className="text-platinum-light/60">Discount</span><span className="text-green-400">-₹{discount.toLocaleString('en-IN')}</span></div>}
                <div className="flex justify-between text-sm mb-4"><span className="text-platinum-light/60">Shipping</span><span className="text-green-400">FREE</span></div>
                <div className="flex justify-between pt-4 border-t border-gold/10"><span className="font-serif text-lg">Total to Pay</span><span className="font-serif text-xl text-gradient-gold">₹{total.toLocaleString('en-IN')}</span></div>
              </div>

              <button onClick={placeOrder} disabled={placing || uploadingScreenshot} className="btn-gold w-full inline-flex items-center justify-center gap-2 disabled:opacity-50">
                <CheckCircle2 className="w-4 h-4" /> {placing ? 'Placing Order...' : "I've Paid — Submit Order"}
              </button>
            </div>
          )}

          {step === 'success' && placedOrder && (
            <div className="text-center space-y-6">
              <div className="glass border border-gold/20 p-10 rounded-sm">
                <CheckCircle2 className="w-14 h-14 text-green-400 mx-auto mb-4" />
                <h2 className="font-serif text-2xl text-platinum-light mb-2">Order {placedOrder.orderId} Placed!</h2>
                <p className="text-sm text-platinum-light/60 max-w-md mx-auto mb-8">Your payment screenshot is submitted for verification. Tap below to also send it to us directly on WhatsApp (attach the same screenshot there) so we can confirm and dispatch faster.</p>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappOrderMessage}`}
                  target="_blank" rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-bold py-4 px-8 rounded-sm inline-flex items-center justify-center gap-2 transition"
                >
                  <MessageCircle className="w-4 h-4" /> Send Payment Screenshot on WhatsApp
                </a>
              </div>
              <a href="/account/orders" className="text-sm text-platinum-light/50 hover:text-gold inline-block">View my orders →</a>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}