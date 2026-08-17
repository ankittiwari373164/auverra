'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { useApp } from '@/app/providers'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, Package, ShoppingCart, Users, DollarSign, Mail, Settings, Bell, Search, Percent, FileText, CreditCard, Truck, Palette, Watch, Star, X, Pencil, Trash2, Plus, Upload, Loader2, MessageSquare, CheckCircle2, Image as ImageIcon, Menu } from 'lucide-react'

const GATEWAYS = [
  { key: 'upi', name: 'UPI (Checkout QR Code)', desc: 'The UPI ID used to generate the payment QR code at checkout — this is what customers actually pay into.', fields: ['UPI ID'] },
  { key: 'razorpay', name: 'Razorpay', desc: 'India’s leading payment gateway. Supports UPI, cards, netbanking.', fields: ['Key ID', 'Key Secret', 'Webhook Secret'] },
  { key: 'stripe', name: 'Stripe', desc: 'International cards, wallets, and 135+ currencies.', fields: ['Publishable Key', 'Secret Key', 'Webhook Signing Secret'] },
  { key: 'paypal', name: 'PayPal', desc: 'Global PayPal & PayPal Credit.', fields: ['Client ID', 'Client Secret'] },
  { key: 'cod', name: 'Cash on Delivery', desc: 'Accept cash upon delivery. India only.', fields: [] },
  { key: 'bank', name: 'Bank Transfer', desc: 'Direct NEFT / RTGS / IMPS.', fields: ['Bank Name', 'Account Number', 'IFSC'] },
]
const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-dark border border-gold/20 rounded-sm w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gold/10 sticky top-0 bg-obsidian-900/95">
          <h3 className="font-serif text-xl text-gold">{title}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-platinum-light/60 hover:text-gold" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

const inputCls = "w-full bg-obsidian-700 border border-gold/20 px-3 py-2 text-sm outline-none focus:border-gold text-platinum-light"
const labelCls = "text-xs uppercase tracking-widest text-gold mb-1 block"

function ReviewsTab({ reviews, refreshAll }) {
  const [uploading, setUploading] = useState(false)

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    const supabase = createClient()
    for (const file of files) {
      const path = `reviews/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name.replace(/[^a-zA-Z0-9.\-]+/g, '-')}`
      const { error } = await supabase.storage.from('review-screenshots').upload(path, file, { upsert: false })
      if (error) { toast.error(`Failed to upload ${file.name}: ${error.message}`); continue }
      const { data } = supabase.storage.from('review-screenshots').getPublicUrl(path)
      await fetch('/api/admin/whatsapp-reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageUrl: data.publicUrl }) })
    }
    setUploading(false)
    e.target.value = ''
    toast.success('Review screenshot(s) uploaded')
    refreshAll()
  }

  const togglePublish = async (r) => {
    await fetch(`/api/admin/whatsapp-reviews/${r._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ published: !r.published }) })
    refreshAll()
  }
  const remove = async (id) => {
    if (!confirm('Delete this review screenshot?')) return
    await fetch(`/api/admin/whatsapp-reviews/${id}`, { method: 'DELETE' })
    toast.success('Deleted'); refreshAll()
  }

  return (
    <div className="glass border border-gold/10 rounded-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-serif text-lg text-gold">Customer Review Screenshots</h3>
          <p className="text-xs text-platinum-light/50 mt-1">Upload real WhatsApp screenshots from customers — they'll show on the homepage's review section. Unpublish to hide without deleting.</p>
        </div>
        <label className="btn-gold text-xs inline-flex items-center gap-2 cursor-pointer">
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} Upload Screenshots
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} disabled={uploading} />
        </label>
      </div>
      {reviews.length === 0 ? (
        <div className="text-center py-12 text-platinum-light/40 text-sm">No review screenshots uploaded yet.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {reviews.map(r => (
            <div key={r._id} className="relative group">
              <img src={r.imageUrl} alt="" className={`w-full aspect-[9/16] object-cover rounded-sm border ${r.published ? 'border-gold/20' : 'border-red-500/40 opacity-40'}`} />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2">
                <button onClick={() => togglePublish(r)} className="text-[10px] uppercase tracking-widest bg-obsidian-900 border border-gold/30 text-gold px-2 py-1 rounded-sm">{r.published ? 'Unpublish' : 'Publish'}</button>
                <button onClick={() => remove(r._id)} className="text-[10px] uppercase tracking-widest bg-red-900/60 border border-red-500/40 text-red-300 px-2 py-1 rounded-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AdminLogin({ onSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) })
    setLoading(false)
    if (res.ok) onSuccess()
    else { const d = await res.json().catch(() => ({})); setError(d.error || 'Login failed') }
  }

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/logo.svg" alt="Auverra" className="w-12 h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-serif text-gradient-gold">Admin Login</h1>
          <p className="text-xs text-platinum-light/50 mt-2">Restricted access</p>
        </div>
        <form onSubmit={submit} className="glass border border-gold/15 p-8 rounded-sm space-y-4">
          <div>
            <label className={labelCls}>Username</label>
            <input required autoFocus value={username} onChange={e => setUsername(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Password</label>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputCls} />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button disabled={loading} className="btn-gold w-full disabled:opacity-50">{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(null) // null = checking, false = show login, true = show panel
  const [stats, setStats] = useState(null)
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [coupons, setCoupons] = useState([])
  const [posts, setPosts] = useState([])
  const [gateways, setGateways] = useState({})
  const [reviews, setReviews] = useState([])
  const [tab, setTab] = useState('dashboard')
  const [productModal, setProductModal] = useState(null) // null | {} | product
  const [couponModal, setCouponModal] = useState(null)
  const [postModal, setPostModal] = useState(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    fetch('/api/admin/me').then(r => r.json()).then(d => setAuthed(!!d.isAdmin))
  }, [])

  const refreshAll = () => {
    fetch('/api/admin/stats').then(r => r.json()).then(setStats)
    fetch('/api/admin/products').then(r => r.json()).then(d => setProducts(d.items || []))
    fetch('/api/admin/orders').then(r => r.json()).then(d => setOrders(d.items || []))
    fetch('/api/admin/coupons').then(r => r.json()).then(d => setCoupons(d.items || []))
    fetch('/api/admin/blog').then(r => r.json()).then(d => setPosts(d.items || []))
    fetch('/api/admin/payments').then(r => r.json()).then(d => setGateways(d.gateways || {}))
    fetch('/api/admin/whatsapp-reviews').then(r => r.json()).then(d => setReviews(d.items || []))
  }

  useEffect(() => { if (authed) refreshAll() }, [authed])

  const logoutAdmin = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    setAuthed(false)
  }

  if (authed === null) return <div className="min-h-screen bg-obsidian flex items-center justify-center"><div className="text-gold">Verifying access...</div></div>
  if (authed === false) return <AdminLogin onSuccess={() => setAuthed(true)} />

  const nav = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'products', label: 'Products', icon: Watch },
    { key: 'orders', label: 'Orders', icon: ShoppingCart },
    { key: 'reviews', label: 'Reviews', icon: MessageSquare },
    { key: 'coupons', label: 'Coupons', icon: Percent },
    { key: 'blog', label: 'Blog', icon: FileText },
    { key: 'payments', label: 'Payments', icon: CreditCard },
    { key: 'newsletter', label: 'Newsletter', icon: Mail },
    { key: 'settings', label: 'Settings', icon: Settings },
  ]

  // ---- Product CRUD ----
  const saveProduct = async (form) => {
    const isEdit = !!form.__editSlug
    const payload = { ...form }
    delete payload.__editSlug
    payload.price = Number(payload.price); payload.stock = Number(payload.stock)
    const res = await fetch(isEdit ? `/api/admin/products/${form.__editSlug}` : '/api/admin/products', {
      method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (res.ok) { toast.success(isEdit ? 'Product updated' : 'Product created'); setProductModal(null); refreshAll() }
    else toast.error(data.error || 'Failed')
  }
  const deleteProduct = async (slug) => {
    if (!confirm(`Delete product "${slug}"?`)) return
    const res = await fetch(`/api/admin/products/${slug}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Product deleted'); refreshAll() } else toast.error('Failed to delete')
  }

  // ---- Order status ----
  const updateOrderStatus = async (orderId, status) => {
    const res = await fetch(`/api/admin/orders/${orderId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    if (res.ok) { toast.success('Order status updated'); refreshAll() } else toast.error('Failed to update')
  }
  const approvePayment = async (orderId) => {
    const res = await fetch(`/api/admin/orders/${orderId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentStatus: 'verified' }) })
    if (res.ok) { toast.success('Payment approved — order confirmed, customer emailed'); refreshAll() } else toast.error('Failed to approve payment')
  }
  const rejectPayment = async (orderId) => {
    if (!confirm('Reject this payment? The order will be cancelled and the customer notified by email.')) return
    const res = await fetch(`/api/admin/orders/${orderId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentStatus: 'rejected' }) })
    if (res.ok) { toast.success('Payment rejected — order cancelled, customer emailed'); refreshAll() } else toast.error('Failed to reject payment')
  }

  // ---- Coupon CRUD ----
  const saveCoupon = async (form) => {
    const res = await fetch('/api/admin/coupons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    if (res.ok) { toast.success('Coupon created'); setCouponModal(null); refreshAll() } else toast.error(data.error || 'Failed')
  }
  const deleteCoupon = async (id) => {
    if (!confirm('Delete this coupon?')) return
    const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Coupon deleted'); refreshAll() } else toast.error('Failed')
  }
  const toggleCoupon = async (c) => {
    const res = await fetch(`/api/admin/coupons/${c._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !c.active }) })
    if (res.ok) refreshAll()
  }

  // ---- Blog CRUD ----
  const savePost = async (form) => {
    const isEdit = !!form.__editId
    const id = form.__editId
    const payload = { ...form }; delete payload.__editId
    const res = await fetch(isEdit ? `/api/admin/blog/${id}` : '/api/admin/blog', { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await res.json()
    if (res.ok) { toast.success(isEdit ? 'Post updated' : 'Post created'); setPostModal(null); refreshAll() } else toast.error(data.error || 'Failed')
  }
  const deletePost = async (id) => {
    if (!confirm('Delete this post?')) return
    const res = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Post deleted'); refreshAll() } else toast.error('Failed')
  }

  // ---- Payments ----
  const savePayment = async (gatewayKey, form) => {
    const res = await fetch('/api/admin/payments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ gateway: gatewayKey, ...form }) })
    if (res.ok) { toast.success('Payment settings saved'); refreshAll() } else toast.error('Failed to save')
  }

  return (
    <div className="min-h-screen bg-obsidian text-platinum-light flex">
      {mobileNavOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileNavOpen(false)} />}
      <aside className={`w-64 bg-obsidian-900 border-r border-gold/10 min-h-screen flex-shrink-0 fixed lg:static top-0 left-0 z-50 transition-transform duration-300 lg:translate-x-0 ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gold/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Auverra" className="w-8 h-8" />
            <div>
              <Link href="/" className="text-lg font-serif font-bold tracking-[0.15em] text-gradient-gold">AUVERRA</Link>
              <div className="text-[9px] uppercase tracking-[0.3em] text-platinum-light/40">Admin Panel</div>
            </div>
          </div>
          <button onClick={() => setMobileNavOpen(false)} className="lg:hidden text-platinum-light/60"><X className="w-5 h-5" /></button>
        </div>
        <nav className="p-3">
          {nav.map(item => (
            <button key={item.key} onClick={() => { setTab(item.key); setMobileNavOpen(false) }} className={`w-full flex items-center gap-3 px-4 py-3 mb-1 text-sm transition rounded-sm ${tab === item.key ? 'bg-gold/10 text-gold border-l-2 border-gold' : 'text-platinum-light/70 hover:bg-gold/5 hover:text-gold'}`}>
              <item.icon className="w-4 h-4" />{item.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="border-b border-gold/10 bg-obsidian-900/50 backdrop-blur px-8 py-5 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <button onClick={() => setMobileNavOpen(true)} className="lg:hidden text-gold p-2 -ml-2"><Menu className="w-5 h-5" /></button>
            <div>
              <h1 className="text-2xl font-serif text-gradient-gold capitalize">{tab}</h1>
              <div className="text-xs text-platinum-light/50 mt-1">Admin Panel</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs uppercase tracking-widest text-gold hover:underline">View Store</Link>
            <button onClick={logoutAdmin} className="text-xs uppercase tracking-widest text-platinum-light/50 hover:text-red-400 transition">Logout</button>
          </div>
        </header>

        <main className="p-8">
          {tab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: 'Total Revenue', value: `₹${((stats?.totalRevenue || 0) / 100000).toFixed(1)}L`, icon: DollarSign },
                  { label: 'Total Orders', value: stats?.orderCount || 0, icon: ShoppingCart },
                  { label: 'Products', value: stats?.productCount || 0, icon: Package },
                  { label: 'Subscribers', value: stats?.newsletterCount || 0, icon: Mail },
                ].map((s, i) => (
                  <div key={i} className="glass border border-gold/10 p-6 rounded-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-platinum-light/50 mb-2">{s.label}</div>
                        <div className="text-3xl font-serif text-gradient-gold">{s.value}</div>
                      </div>
                      <s.icon className="w-10 h-10 text-gold/40" strokeWidth={1} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass border border-gold/10 p-6 rounded-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-serif text-lg text-gold">Recent Orders</h3>
                    <button onClick={() => setTab('orders')} className="text-xs text-gold hover:underline">View All</button>
                  </div>
                  {stats?.recentOrders?.length ? (
                    <div className="space-y-3">
                      {stats.recentOrders.map(o => (
                        <div key={o.orderId} className="flex justify-between py-3 border-b border-gold/5 last:border-0">
                          <div><div className="text-sm text-platinum-light">{o.orderId}</div><div className="text-xs text-platinum-light/50">{o.email}</div></div>
                          <div className="text-right"><div className="text-sm text-gold">₹{o.total?.toLocaleString('en-IN')}</div><div className="text-[10px] uppercase tracking-widest text-platinum-light/50">{o.status}</div></div>
                        </div>
                      ))}
                    </div>
                  ) : <div className="text-sm text-platinum-light/50">No orders yet</div>}
                </div>

                <div className="glass border border-gold/10 p-6 rounded-sm">
                  <h3 className="font-serif text-lg text-gold mb-6">Top Products</h3>
                  <div className="space-y-3">
                    {products.slice(0, 5).map(p => (
                      <div key={p.slug} className="flex items-center gap-3 py-2">
                        <img src={p.images[0] + '?auto=format&fit=crop&w=100&q=80'} className="w-12 h-12 object-cover" />
                        <div className="flex-1 min-w-0"><div className="text-sm font-serif truncate">{p.name}</div><div className="text-xs text-platinum-light/50">Stock: {p.stock} • ★ {p.rating}</div></div>
                        <div className="text-sm text-gold">₹{(p.price / 1000).toFixed(0)}K</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="glass border border-gold/10 p-6 rounded-sm">
                <h3 className="font-serif text-lg text-gold mb-6">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Add Product', icon: Package, action: () => { setTab('products'); setProductModal({}) } },
                    { label: 'Configure Payment', icon: CreditCard, action: () => setTab('payments') },
                    { label: 'Create Coupon', icon: Percent, action: () => { setTab('coupons'); setCouponModal({}) } },
                    { label: 'Write Blog', icon: FileText, action: () => { setTab('blog'); setPostModal({}) } },
                  ].map((a, i) => (
                    <button key={i} onClick={a.action} className="p-4 border border-gold/20 hover:bg-gold/5 hover:border-gold/50 transition text-center">
                      <a.icon className="w-6 h-6 text-gold mx-auto mb-2" strokeWidth={1} />
                      <div className="text-xs uppercase tracking-widest">{a.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'products' && (
            <div className="glass border border-gold/10 rounded-sm overflow-hidden">
              <div className="p-6 flex justify-between items-center border-b border-gold/10">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-platinum-light/40" />
                  <input placeholder="Search products..." className="w-full bg-obsidian-700 border border-gold/10 pl-10 pr-4 py-2 text-sm outline-none focus:border-gold" />
                </div>
                <button onClick={() => setProductModal({})} className="btn-gold text-xs inline-flex items-center gap-2"><Plus className="w-3 h-3" /> Add Product</button>
              </div>
              <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gold/10 text-xs uppercase tracking-widest text-platinum-light/50">
                    <th className="text-left p-4">Product</th>
                    <th className="text-left p-4 hidden md:table-cell">Category</th>
                    <th className="text-left p-4">Price</th>
                    <th className="text-left p-4">Stock</th>
                    <th className="text-left p-4 hidden md:table-cell">Rating</th>
                    <th className="text-right p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.slug} className="border-b border-gold/5 hover:bg-obsidian-700/30">
                      <td className="p-4"><div className="flex items-center gap-3"><img src={p.images[0] + '?auto=format&fit=crop&w=100&q=80'} className="w-12 h-12 object-cover" /><div className="font-serif">{p.name}</div></div></td>
                      <td className="p-4 hidden md:table-cell text-sm text-platinum-light/70 capitalize">{p.category}</td>
                      <td className="p-4 text-sm text-gold">₹{p.price.toLocaleString('en-IN')}</td>
                      <td className="p-4 text-sm"><span className={p.stock < 5 ? 'text-rosegold' : 'text-green-400'}>{p.stock}</span></td>
                      <td className="p-4 hidden md:table-cell text-sm">★ {p.rating}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => setProductModal({ ...p, __editSlug: p.slug })} className="p-2 hover:text-gold"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => deleteProduct(p.slug)} className="p-2 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}

          {tab === 'orders' && (
            <div className="glass border border-gold/10 rounded-sm overflow-hidden">
              <div className="p-6 border-b border-gold/10"><h3 className="font-serif text-lg text-gold">All Orders ({orders.length})</h3></div>
              {orders.length === 0 ? <div className="p-8 text-center text-platinum-light/50">No orders yet</div> : (
                <div className="divide-y divide-gold/5">
                  {orders.map(o => (
                    <details key={o.orderId} className="group">
                      <summary className="p-4 flex flex-wrap items-center gap-4 cursor-pointer hover:bg-obsidian-700/30 list-none">
                        <span className="text-sm text-gold w-32 flex-shrink-0">{o.orderId}</span>
                        <span className="text-sm flex-1 min-w-[140px]">{o.email}</span>
                        <span className="text-sm text-platinum-light/70 w-28 flex-shrink-0">{new Date(o.createdAt).toLocaleDateString()}</span>
                        <span className="text-sm text-gold w-28 flex-shrink-0">₹{o.total?.toLocaleString('en-IN')}</span>
                        <select value={o.status} onClick={e => e.stopPropagation()} onChange={e => updateOrderStatus(o.orderId, e.target.value)} className="bg-obsidian-700 border border-gold/30 text-gold text-[11px] uppercase tracking-widest px-3 py-1 outline-none flex-shrink-0">
                          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <span className="text-[10px] uppercase tracking-widest text-platinum-light/40 flex-shrink-0 ml-auto group-open:hidden">Show items ▾</span>
                        <span className="text-[10px] uppercase tracking-widest text-platinum-light/40 flex-shrink-0 ml-auto hidden group-open:inline">Hide items ▴</span>
                      </summary>
                      <div className="px-4 pb-4 pt-1 bg-obsidian-700/20">
                        <div className="space-y-2 max-w-2xl">
                          {(o.items || []).map((it, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm">
                              {it.image && <img src={it.image + '?auto=format&fit=crop&w=100&q=80'} className="w-10 h-10 object-cover flex-shrink-0" />}
                              <div className="flex-1">
                                <div className="text-platinum-light">{it.name}</div>
                                {it.variant?.dial?.name && <div className="text-xs text-gold">Color: {it.variant.dial.name}</div>}
                                {it.variant?.strap?.name && <div className="text-xs text-platinum-light/50">Strap: {it.variant.strap.name}</div>}
                              </div>
                              <div className="text-platinum-light/60 flex-shrink-0">Qty {it.quantity}</div>
                              <div className="text-gold flex-shrink-0 w-24 text-right">₹{(it.price * it.quantity).toLocaleString('en-IN')}</div>
                            </div>
                          ))}
                        </div>
                        {o.shipping && (
                          <div className="mt-4 pt-4 border-t border-gold/10 text-xs text-platinum-light/60 max-w-2xl space-y-1">
                            <div><span className="text-gold uppercase tracking-widest mr-2">Ship to:</span>{o.shipping.name}, {o.shipping.address}, {o.shipping.city}, {o.shipping.state} {o.shipping.postalCode}, {o.shipping.country}</div>
                            {o.shipping.phone && <div><span className="text-gold uppercase tracking-widest mr-2">Phone:</span>{o.shipping.phone}</div>}
                            {o.shipping.upiUtr && <div><span className="text-gold uppercase tracking-widest mr-2">UPI UTR:</span>{o.shipping.upiUtr}</div>}
                          </div>
                        )}
                        {o.shipping?.upiPaymentScreenshotUrl && (
                          <div className="mt-4 pt-4 border-t border-gold/10 flex items-center gap-4">
                            <a href={o.shipping.upiPaymentScreenshotUrl} target="_blank" rel="noopener noreferrer" className="block">
                              <img src={o.shipping.upiPaymentScreenshotUrl} alt="Payment proof" className="w-20 h-20 object-cover border border-gold/20 rounded-sm hover:border-gold transition" />
                            </a>
                            <div className="text-xs text-platinum-light/50">
                              <div className="mb-2">
                                Payment screenshot submitted
                                {o.paymentStatus === 'verified' && <span className="text-green-400"> — verified ✅</span>}
                                {o.paymentStatus === 'rejected' && <span className="text-red-400"> — rejected ✕</span>}
                              </div>
                              {o.paymentStatus !== 'verified' && o.paymentStatus !== 'rejected' && (
                                <div className="flex gap-2">
                                  <button onClick={e => { e.stopPropagation(); approvePayment(o.orderId) }} className="inline-flex items-center gap-1.5 bg-green-600/20 border border-green-500/40 text-green-400 px-3 py-1.5 rounded-sm hover:bg-green-600/30 transition text-[11px] uppercase tracking-widest">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Confirm
                                  </button>
                                  <button onClick={e => { e.stopPropagation(); rejectPayment(o.orderId) }} className="inline-flex items-center gap-1.5 bg-red-600/20 border border-red-500/40 text-red-400 px-3 py-1.5 rounded-sm hover:bg-red-600/30 transition text-[11px] uppercase tracking-widest">
                                    <X className="w-3.5 h-3.5" /> Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'reviews' && <ReviewsTab reviews={reviews} refreshAll={refreshAll} />}

          {tab === 'coupons' && (
            <div className="glass border border-gold/10 rounded-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-xl text-gold">Coupons & Discounts</h3>
                <button onClick={() => setCouponModal({})} className="btn-gold text-xs inline-flex items-center gap-2"><Plus className="w-3 h-3" /> Create Coupon</button>
              </div>
              {coupons.length === 0 ? <div className="text-sm text-platinum-light/50 text-center py-8">No coupons yet. Create one to offer discounts.</div> : (
                <div className="space-y-3">
                  {coupons.map(c => (
                    <div key={c._id} className="flex items-center justify-between p-4 border border-gold/10">
                      <div>
                        <div className="font-serif text-lg text-gold">{c.code} {!c.active && <span className="text-xs text-platinum-light/40 uppercase ml-2">(disabled)</span>}</div>
                        <div className="text-xs text-platinum-light/60">{c.type === 'percent' ? `${c.value}% off` : `₹${c.value} off`} • Used {c.usageCount || 0}{c.usageLimit ? ` / ${c.usageLimit}` : ' / ∞'}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-xs text-platinum-light/50">{c.expiresAt ? `Expires ${new Date(c.expiresAt).toLocaleDateString()}` : 'No expiry'}</div>
                        <button onClick={() => toggleCoupon(c)} className="text-xs text-gold hover:underline">{c.active ? 'Disable' : 'Enable'}</button>
                        <button onClick={() => deleteCoupon(c._id)} className="p-1 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'blog' && (
            <div className="glass border border-gold/10 rounded-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-xl text-gold">Blog / Journal</h3>
                <button onClick={() => setPostModal({})} className="btn-gold text-xs inline-flex items-center gap-2"><Plus className="w-3 h-3" /> Write Post</button>
              </div>
              {posts.length === 0 ? <div className="text-sm text-platinum-light/50 text-center py-8">No posts yet.</div> : (
                <div className="space-y-3">
                  {posts.map(p => (
                    <div key={p._id} className="flex items-center justify-between p-4 border border-gold/10">
                      <div className="min-w-0">
                        <div className="font-serif text-lg text-platinum-light truncate">{p.title} {!p.published && <span className="text-xs text-platinum-light/40 uppercase ml-2">(draft)</span>}</div>
                        <div className="text-xs text-platinum-light/60 truncate">{p.excerpt}</div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <button onClick={() => setPostModal({ ...p, __editId: p._id })} className="p-2 hover:text-gold"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => deletePost(p._id)} className="p-2 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'payments' && (
            <div className="space-y-6">
              <div className="glass border border-gold/10 p-6 rounded-sm">
                <h3 className="font-serif text-xl text-gold mb-2">Payment Gateways</h3>
                <p className="text-sm text-platinum-light/60 mb-6">Configure your payment providers. Settings are saved to the database instantly.</p>
                <div className="space-y-4">
                  {GATEWAYS.map(pg => <GatewayRow key={pg.key} pg={pg} saved={gateways[pg.key]} onSave={(form) => savePayment(pg.key, form)} />)}
                </div>
              </div>
            </div>
          )}

          {['newsletter', 'settings'].includes(tab) && (
            <div className="glass border border-gold/10 p-12 rounded-sm text-center">
              <h3 className="font-serif text-2xl text-gold mb-4 capitalize">{tab}</h3>
              <p className="text-platinum-light/60 max-w-md mx-auto">This module is scaffolded and ready. Extend with full CRUD, filtering, and analytics as needed.</p>
            </div>
          )}
        </main>
      </div>

      {productModal && <ProductModal product={productModal} onClose={() => setProductModal(null)} onSave={saveProduct} />}
      {couponModal && <CouponModal onClose={() => setCouponModal(null)} onSave={saveCoupon} />}
      {postModal && <PostModal post={postModal} onClose={() => setPostModal(null)} onSave={savePost} />}
    </div>
  )
}

function GatewayRow({ pg, saved, onSave }) {
  const [open, setOpen] = useState(false)
  const [enabled, setEnabled] = useState(saved?.enabled || false)
  const [mode, setMode] = useState(saved?.mode || 'test')
  const [fields, setFields] = useState(saved?.fields || {})

  useEffect(() => { setEnabled(saved?.enabled || false); setMode(saved?.mode || 'test'); setFields(saved?.fields || {}) }, [saved])

  return (
    <details open={open} onToggle={e => setOpen(e.target.open)} className="border border-gold/10 rounded-sm">
      <summary className="p-4 flex items-center justify-between cursor-pointer hover:bg-obsidian-700/30">
        <div>
          <div className="font-serif text-lg flex items-center gap-2">{pg.name} {enabled && <span className="text-[10px] uppercase tracking-widest text-green-400 border border-green-400/30 px-2 py-0.5">Active</span>}</div>
          <div className="text-xs text-platinum-light/50">{pg.desc}</div>
        </div>
        <label className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <span className="text-xs text-platinum-light/60">Enable</span>
          <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} className="accent-gold" />
        </label>
      </summary>
      <div className="p-4 border-t border-gold/10 grid grid-cols-1 md:grid-cols-2 gap-4">
        {pg.fields.map(f => (
          <div key={f}>
            <label className={labelCls}>{f}</label>
            <input type={f === 'UPI ID' ? 'text' : 'password'} value={fields[f] || ''} onChange={e => setFields({ ...fields, [f]: e.target.value })} placeholder={f === 'UPI ID' ? 'e.g. auverrawatches@upi' : `Enter ${f}`} className={inputCls} />
          </div>
        ))}
        {pg.fields.length > 0 && (
          <div className="flex items-center gap-3 col-span-full">
            <label className="flex items-center gap-2 text-sm"><input type="radio" name={`mode-${pg.key}`} checked={mode === 'test'} onChange={() => setMode('test')} className="accent-gold" />Test Mode</label>
            <label className="flex items-center gap-2 text-sm"><input type="radio" name={`mode-${pg.key}`} checked={mode === 'live'} onChange={() => setMode('live')} className="accent-gold" />Live Mode</label>
          </div>
        )}
        <button onClick={() => onSave({ enabled, mode, fields })} className="btn-outline-gold text-xs col-span-full justify-self-start">Save Configuration</button>
      </div>
    </details>
  )
}

function ProductModal({ product, onClose, onSave }) {
  const isEdit = !!product.slug
  const [form, setForm] = useState({
    slug: product.slug || '', name: product.name || '', tagline: product.tagline || '',
    price: product.price || '', compareAtPrice: product.compareAtPrice || '', stock: product.stock ?? '',
    category: product.category || 'chronograph', collection: product.collection || 'heritage',
    description: product.description || '', images: product.images || [], videos: product.videos || [],
    featured: !!product.featured, bestSeller: !!product.bestSeller, newArrival: !!product.newArrival,
    features: product.features?.length ? product.features : [''],
    specs: product.specs && Object.keys(product.specs).length ? Object.entries(product.specs).map(([key, value]) => ({ key, value })) : [{ key: '', value: '' }],
    colors: product.variants?.dial?.length ? product.variants.dial.map(d => ({ name: d.name, hex: d.hex || '#c9a961', price: d.price ?? '', compareAtPrice: d.compareAtPrice ?? '', images: d.images || [] })) : [],
  })
  const [uploading, setUploading] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadingColorIdx, setUploadingColorIdx] = useState(null)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // ---- per-color image upload ----
  const handleColorFiles = async (e, colorIdx) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploadingColorIdx(colorIdx)
    const supabase = createClient()
    const uploaded = []
    for (const file of files) {
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name.replace(/[^a-zA-Z0-9.\-]+/g, '-')}`
      const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: false })
      if (error) { toast.error(`Failed to upload ${file.name}: ${error.message}`); continue }
      const { data } = supabase.storage.from('product-images').getPublicUrl(path)
      uploaded.push(data.publicUrl)
    }
    if (uploaded.length) {
      setForm(f => ({ ...f, colors: f.colors.map((c, i) => i === colorIdx ? { ...c, images: [...c.images, ...uploaded] } : c) }))
    }
    setUploadingColorIdx(null)
    e.target.value = ''
  }

  // ---- image upload ----
  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    const supabase = createClient()
    const uploaded = []
    for (const file of files) {
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name.replace(/[^a-zA-Z0-9.\-]+/g, '-')}`
      const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: false })
      if (error) { toast.error(`Failed to upload ${file.name}: ${error.message}`); continue }
      const { data } = supabase.storage.from('product-images').getPublicUrl(path)
      uploaded.push(data.publicUrl)
    }
    if (uploaded.length) set('images', [...form.images, ...uploaded])
    setUploading(false)
    e.target.value = ''
  }
  const removeImage = (idx) => set('images', form.images.filter((_, i) => i !== idx))

  // ---- video upload ----
  const handleVideoFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploadingVideo(true)
    const supabase = createClient()
    const uploaded = []
    for (const file of files) {
      if (file.size > 50 * 1024 * 1024) { toast.error(`${file.name} is over 50MB — please use a smaller clip`); continue }
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name.replace(/[^a-zA-Z0-9.\-]+/g, '-')}`
      const { error } = await supabase.storage.from('product-videos').upload(path, file, { upsert: false })
      if (error) { toast.error(`Failed to upload ${file.name}: ${error.message}`); continue }
      const { data } = supabase.storage.from('product-videos').getPublicUrl(path)
      uploaded.push(data.publicUrl)
    }
    if (uploaded.length) set('videos', [...form.videos, ...uploaded])
    setUploadingVideo(false)
    e.target.value = ''
  }
  const removeVideo = (idx) => set('videos', form.videos.filter((_, i) => i !== idx))

  // ---- dynamic list helpers ----
  const updateListItem = (key, idx, value) => set(key, form[key].map((it, i) => i === idx ? value : it))
  const addListItem = (key, empty) => set(key, [...form[key], empty])
  const removeListItem = (key, idx) => set(key, form[key].filter((_, i) => i !== idx))

  const submit = (e) => {
    e.preventDefault()
    if (!form.images.length) return toast.error('Add at least one product image')
    const specs = {}
    form.specs.forEach(({ key, value }) => { if (key.trim()) specs[key.trim()] = value })
    const payload = {
      ...form,
      features: form.features.map(f => f.trim()).filter(Boolean),
      specs,
      variants: form.colors.length ? { dial: form.colors.filter(c => c.name.trim()).map(c => ({ name: c.name, hex: c.hex, ...(c.price !== '' && c.price != null ? { price: Number(c.price) } : {}), ...(c.compareAtPrice !== '' && c.compareAtPrice != null ? { compareAtPrice: Number(c.compareAtPrice) } : {}), images: c.images || [] })) } : {},
      __editSlug: isEdit ? product.slug : undefined,
    }
    delete payload.colors
    onSave(payload)
  }

  return (
    <Modal title={isEdit ? `Edit ${product.name}` : 'Add New Product'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Name</label><input required value={form.name} onChange={e => set('name', e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Slug</label><input required disabled={isEdit} value={form.slug} onChange={e => set('slug', e.target.value)} className={inputCls + ' disabled:opacity-50'} placeholder="e.g. chronos-titanium" /></div>
        </div>
        <div><label className={labelCls}>Tagline</label><input value={form.tagline} onChange={e => set('tagline', e.target.value)} className={inputCls} /></div>
        <div className="grid grid-cols-3 gap-4">
          <div><label className={labelCls}>Price (₹)</label><input required type="number" value={form.price} onChange={e => set('price', e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Compare-at (₹)</label><input type="number" value={form.compareAtPrice} onChange={e => set('compareAtPrice', e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Stock</label><input required type="number" value={form.stock} onChange={e => set('stock', e.target.value)} className={inputCls} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)} className={inputCls}>
              {['quartz', 'automatic', 'digital', 'chronograph', 'ladies'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div><label className={labelCls}>Collection</label>
            <select value={form.collection} onChange={e => set('collection', e.target.value)} className={inputCls}>
              {['heritage', 'obsidian', 'celestial'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div><label className={labelCls}>Description</label><textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} className={inputCls} /></div>

        {/* Images */}
        <div>
          <label className={labelCls}>Product Images</label>
          <div className="grid grid-cols-4 gap-3 mb-3">
            {form.images.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-sm overflow-hidden border border-gold/20 group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 w-6 h-6 bg-black/70 text-white flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition"><X className="w-3.5 h-3.5" /></button>
              </div>
            ))}
            <label className="aspect-square rounded-sm border border-dashed border-gold/30 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-gold/60 hover:bg-gold/5 transition text-platinum-light/50">
              {uploading ? <Loader2 className="w-5 h-5 animate-spin text-gold" /> : <Upload className="w-5 h-5" />}
              <span className="text-[10px] uppercase tracking-widest">{uploading ? 'Uploading' : 'Upload'}</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} disabled={uploading} />
            </label>
          </div>
          <p className="text-[11px] text-platinum-light/40">Uploads go to your Supabase Storage bucket and are served from there — no external links needed.</p>
        </div>

        {/* Videos */}
        <div>
          <label className={labelCls}>Product Videos</label>
          <div className="grid grid-cols-4 gap-3 mb-3">
            {form.videos.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-sm overflow-hidden border border-gold/20 group bg-obsidian-700">
                <video src={url} className="w-full h-full object-cover" muted />
                <button type="button" onClick={() => removeVideo(i)} className="absolute top-1 right-1 w-6 h-6 bg-black/70 text-white flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition"><X className="w-3.5 h-3.5" /></button>
              </div>
            ))}
            <label className="aspect-square rounded-sm border border-dashed border-gold/30 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-gold/60 hover:bg-gold/5 transition text-platinum-light/50">
              {uploadingVideo ? <Loader2 className="w-5 h-5 animate-spin text-gold" /> : <Upload className="w-5 h-5" />}
              <span className="text-[10px] uppercase tracking-widest">{uploadingVideo ? 'Uploading' : 'Upload'}</span>
              <input type="file" accept="video/*" multiple className="hidden" onChange={handleVideoFiles} disabled={uploadingVideo} />
            </label>
          </div>
          <p className="text-[11px] text-platinum-light/40">Short product clips (unboxing, wrist shots, close-ups). Max 50MB per video — these show in the product gallery alongside photos.</p>
        </div>

        {/* Colors (dial variants) — each color can have its own images and price */}
        <div>
          <label className={labelCls}>Colors</label>
          <p className="text-[11px] text-platinum-light/40 mb-3">Add a color for every option customers can pick. Leave price blank to use the base price above. If you only add one color, customers won't be asked to choose — it's added automatically.</p>
          <div className="space-y-4">
            {form.colors.map((c, i) => (
              <div key={i} className="border border-gold/15 rounded-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <input type="color" value={c.hex} onChange={e => updateListItem('colors', i, { ...c, hex: e.target.value })} className="w-10 h-9 bg-obsidian-700 border border-gold/20 rounded-sm cursor-pointer flex-shrink-0" />
                  <input value={c.name} onChange={e => updateListItem('colors', i, { ...c, name: e.target.value })} placeholder="Color name, e.g. Obsidian Black" className={inputCls} />
                  <button type="button" onClick={() => removeListItem('colors', i)} className="p-2 text-platinum-light/40 hover:text-red-400 flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <input type="number" value={c.price} onChange={e => updateListItem('colors', i, { ...c, price: e.target.value })} placeholder={`Price override (default ₹${form.price || '—'})`} className={inputCls + ' text-xs'} />
                  <input type="number" value={c.compareAtPrice} onChange={e => updateListItem('colors', i, { ...c, compareAtPrice: e.target.value })} placeholder="Compare-at override (optional)" className={inputCls + ' text-xs'} />
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {c.images.map((url, imgI) => (
                    <div key={imgI} className="relative aspect-square rounded-sm overflow-hidden border border-gold/20 group">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => updateListItem('colors', i, { ...c, images: c.images.filter((_, x) => x !== imgI) })} className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/70 text-white flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                  <label className="aspect-square rounded-sm border border-dashed border-gold/30 flex flex-col items-center justify-center gap-0.5 cursor-pointer hover:border-gold/60 hover:bg-gold/5 transition text-platinum-light/50">
                    {uploadingColorIdx === i ? <Loader2 className="w-4 h-4 animate-spin text-gold" /> : <Upload className="w-4 h-4" />}
                    <span className="text-[8px] uppercase tracking-widest">Photo</span>
                    <input type="file" accept="image/*" multiple className="hidden" disabled={uploadingColorIdx !== null} onChange={e => handleColorFiles(e, i)} />
                  </label>
                </div>
                <p className="text-[10px] text-platinum-light/35 mt-2">{c.images.length ? `${c.images.length} photo${c.images.length > 1 ? 's' : ''} for this color` : "No photos yet — falls back to the main product images"}</p>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => addListItem('colors', { name: '', hex: '#c9a961', price: '', compareAtPrice: '', images: [] })} className="mt-3 text-xs text-gold hover:underline inline-flex items-center gap-1"><Plus className="w-3 h-3" /> Add Color</button>
        </div>

        {/* Specifications */}
        <div>
          <label className={labelCls}>Specifications</label>
          <div className="space-y-2">
            {form.specs.map((s, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <input value={s.key} onChange={e => updateListItem('specs', i, { ...s, key: e.target.value })} placeholder="e.g. Movement" className={inputCls} />
                <input value={s.value} onChange={e => updateListItem('specs', i, { ...s, value: e.target.value })} placeholder="e.g. Automatic AV-C7" className={inputCls} />
                <button type="button" onClick={() => removeListItem('specs', i)} className="p-2 text-platinum-light/40 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => addListItem('specs', { key: '', value: '' })} className="mt-2 text-xs text-gold hover:underline inline-flex items-center gap-1"><Plus className="w-3 h-3" /> Add Specification</button>
        </div>

        {/* Features */}
        <div>
          <label className={labelCls}>Features</label>
          <div className="space-y-2">
            {form.features.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <input value={f} onChange={e => updateListItem('features', i, e.target.value)} placeholder="e.g. 72-hour power reserve" className={inputCls} />
                <button type="button" onClick={() => removeListItem('features', i)} className="p-2 text-platinum-light/40 hover:text-red-400 flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => addListItem('features', '')} className="mt-2 text-xs text-gold hover:underline inline-flex items-center gap-1"><Plus className="w-3 h-3" /> Add Feature</button>
        </div>

        <div className="flex gap-6">
          {['featured', 'bestSeller', 'newArrival'].map(k => (
            <label key={k} className="flex items-center gap-2 text-sm capitalize"><input type="checkbox" checked={form[k]} onChange={e => set(k, e.target.checked)} className="accent-gold" />{k}</label>
          ))}
        </div>
        <button disabled={uploading} className="btn-gold w-full disabled:opacity-50">{isEdit ? 'Save Changes' : 'Create Product'}</button>
      </form>
    </Modal>
  )
}

function CouponModal({ onClose, onSave }) {
  const [form, setForm] = useState({ code: '', type: 'percent', value: '', minSubtotal: '', usageLimit: '', expiresAt: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const submit = (e) => { e.preventDefault(); onSave(form) }
  return (
    <Modal title="Create Coupon" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div><label className={labelCls}>Coupon Code</label><input required value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} className={inputCls} placeholder="e.g. WELCOME10" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Discount Type</label>
            <select value={form.type} onChange={e => set('type', e.target.value)} className={inputCls}>
              <option value="percent">Percent (%)</option>
              <option value="flat">Flat (₹)</option>
            </select>
          </div>
          <div><label className={labelCls}>Value</label><input required type="number" value={form.value} onChange={e => set('value', e.target.value)} className={inputCls} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Min. Subtotal (₹, optional)</label><input type="number" value={form.minSubtotal} onChange={e => set('minSubtotal', e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Usage Limit (optional)</label><input type="number" value={form.usageLimit} onChange={e => set('usageLimit', e.target.value)} className={inputCls} /></div>
        </div>
        <div><label className={labelCls}>Expiry Date (optional)</label><input type="date" value={form.expiresAt} onChange={e => set('expiresAt', e.target.value)} className={inputCls} /></div>
        <button className="btn-gold w-full">Create Coupon</button>
      </form>
    </Modal>
  )
}

function PostModal({ post, onClose, onSave }) {
  const isEdit = !!post._id
  const [form, setForm] = useState({ title: post.title || '', excerpt: post.excerpt || '', content: post.content || '', coverImage: post.coverImage || '', published: post.published ?? true })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const submit = (e) => { e.preventDefault(); onSave({ ...form, __editId: isEdit ? post._id : undefined }) }
  return (
    <Modal title={isEdit ? 'Edit Post' : 'Write New Post'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div><label className={labelCls}>Title</label><input required value={form.title} onChange={e => set('title', e.target.value)} className={inputCls} /></div>
        <div><label className={labelCls}>Cover Image URL</label><input value={form.coverImage} onChange={e => set('coverImage', e.target.value)} className={inputCls} placeholder="https://..." /></div>
        <div><label className={labelCls}>Excerpt</label><input value={form.excerpt} onChange={e => set('excerpt', e.target.value)} className={inputCls} /></div>
        <div><label className={labelCls}>Content</label><textarea rows={6} value={form.content} onChange={e => set('content', e.target.value)} className={inputCls} /></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.published} onChange={e => set('published', e.target.checked)} className="accent-gold" />Published</label>
        <button className="btn-gold w-full">{isEdit ? 'Save Changes' : 'Publish Post'}</button>
      </form>
    </Modal>
  )
}