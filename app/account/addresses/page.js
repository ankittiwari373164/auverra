'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { useApp } from '@/app/providers'
import { toast } from 'sonner'
import { MapPin, Plus, Pencil, Trash2, X, Star } from 'lucide-react'

const inputCls = "w-full bg-obsidian-700 border border-gold/20 px-3 py-2 text-sm outline-none focus:border-gold text-platinum-light"
const labelCls = "text-xs uppercase tracking-widest text-gold mb-1 block"
const emptyForm = { label: 'Home', fullName: '', phone: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false }

export default function AddressesPage() {
  const { user, loading } = useApp() || {}
  const [addresses, setAddresses] = useState([])
  const [modal, setModal] = useState(null) // null | {} | address
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/login?redirect=/account/addresses')
  }, [user, loading])

  const refresh = () => fetch('/api/addresses').then(r => r.json()).then(d => setAddresses(d.items || []))
  useEffect(() => { if (user) refresh() }, [user])

  const save = async (form) => {
    const isEdit = !!form.__id
    const res = await fetch(isEdit ? `/api/addresses/${form.__id}` : '/api/addresses', {
      method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    if (res.ok) { toast.success(isEdit ? 'Address updated' : 'Address added'); setModal(null); refresh() }
    else toast.error('Failed to save address')
  }
  const remove = async (id) => {
    if (!confirm('Delete this address?')) return
    const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Address deleted'); refresh() } else toast.error('Failed to delete')
  }
  const makeDefault = async (a) => {
    const res = await fetch(`/api/addresses/${a._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isDefault: true }) })
    if (res.ok) refresh()
  }

  if (loading || !user) return <div className="min-h-screen bg-obsidian flex items-center justify-center"><div className="text-gold">Loading...</div></div>

  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <div className="pt-32 pb-24">
        <div className="container-lux max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="text-[10px] uppercase tracking-[0.4em] text-gold mb-3">Your Account</div>
              <h1 className="text-4xl md:text-5xl font-serif text-gradient-gold">Addresses</h1>
            </div>
            <button onClick={() => setModal({})} className="btn-gold text-xs inline-flex items-center gap-2"><Plus className="w-3 h-3" /> Add Address</button>
          </div>

          {addresses.length === 0 ? (
            <div className="text-center py-20 glass border border-gold/15 rounded-sm">
              <MapPin className="w-12 h-12 text-gold/30 mx-auto mb-4" />
              <p className="text-platinum-light/60 mb-6">No saved addresses yet.</p>
              <button onClick={() => setModal({})} className="btn-outline-gold">Add Your First Address</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {addresses.map(a => (
                <div key={a._id} className="glass border border-gold/15 p-6 rounded-sm luxury-card relative">
                  {a.isDefault && <span className="absolute top-4 right-4 text-[9px] uppercase tracking-widest text-gold border border-gold/40 px-2 py-0.5 flex items-center gap-1"><Star className="w-3 h-3 fill-gold" /> Default</span>}
                  <div className="text-xs uppercase tracking-[0.25em] text-gold mb-2">{a.label}</div>
                  <div className="font-serif text-lg text-platinum-light mb-1">{a.fullName}</div>
                  <div className="text-sm text-platinum-light/60 leading-relaxed mb-4">
                    {a.line1}{a.line2 ? `, ${a.line2}` : ''}<br />
                    {a.city}, {a.state} {a.postalCode}<br />
                    {a.country}{a.phone ? ` • ${a.phone}` : ''}
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    {!a.isDefault && <button onClick={() => makeDefault(a)} className="text-gold hover:underline">Set as Default</button>}
                    <button onClick={() => setModal({ ...a, __id: a._id })} className="inline-flex items-center gap-1 text-platinum-light/60 hover:text-gold"><Pencil className="w-3 h-3" /> Edit</button>
                    <button onClick={() => remove(a._id)} className="inline-flex items-center gap-1 text-platinum-light/60 hover:text-red-400"><Trash2 className="w-3 h-3" /> Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
      {modal && <AddressModal address={modal} onClose={() => setModal(null)} onSave={save} />}
    </div>
  )
}

function AddressModal({ address, onClose, onSave }) {
  const isEdit = !!address._id
  const [form, setForm] = useState({ ...emptyForm, ...address })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const submit = (e) => { e.preventDefault(); onSave({ ...form, __id: isEdit ? address._id : undefined }) }
  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-dark border border-gold/20 rounded-sm w-full max-w-xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gold/10 sticky top-0 bg-obsidian-900/95">
          <h3 className="font-serif text-xl text-gold">{isEdit ? 'Edit Address' : 'Add New Address'}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-platinum-light/60 hover:text-gold" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>Label</label>
              <select value={form.label} onChange={e => set('label', e.target.value)} className={inputCls}>
                <option>Home</option><option>Work</option><option>Other</option>
              </select>
            </div>
            <div><label className={labelCls}>Full Name</label><input required value={form.fullName} onChange={e => set('fullName', e.target.value)} className={inputCls} /></div>
          </div>
          <div><label className={labelCls}>Phone</label><input required value={form.phone} onChange={e => set('phone', e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Address Line 1</label><input required value={form.line1} onChange={e => set('line1', e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Address Line 2 (optional)</label><input value={form.line2} onChange={e => set('line2', e.target.value)} className={inputCls} /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className={labelCls}>City</label><input required value={form.city} onChange={e => set('city', e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>State</label><input required value={form.state} onChange={e => set('state', e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Postal Code</label><input required value={form.postalCode} onChange={e => set('postalCode', e.target.value)} className={inputCls} /></div>
          </div>
          <div><label className={labelCls}>Country</label><input value={form.country} onChange={e => set('country', e.target.value)} className={inputCls} /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isDefault} onChange={e => set('isDefault', e.target.checked)} className="accent-gold" />Set as default address</label>
          <button className="btn-gold w-full">{isEdit ? 'Save Changes' : 'Add Address'}</button>
        </form>
      </div>
    </div>
  )
}
