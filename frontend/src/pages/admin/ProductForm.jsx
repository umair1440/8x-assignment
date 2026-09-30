import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { addAdminProduct, updateAdminProduct } from '../../features/admin/adminDataSlice'

const categories = ['Audio', 'Accessories', 'Electronics', 'Fashion', 'Gaming', 'Home', 'Phones']
const emptyForm = { name: '', category: 'Electronics', price: '', stock: '', image: '', description: '' }

function createProductId() {
  return globalThis.crypto?.randomUUID?.() ?? `admin-product-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export default function ProductForm() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { id } = useParams()
  const product = useSelector((state) => state.adminData.products.find((item) => String(item.id) === String(id)))
  const [form, setForm] = useState(emptyForm)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) {
      setForm(emptyForm)
      setNotFound(false)
      return
    }
    if (!product) {
      setNotFound(true)
      return
    }
    setNotFound(false)
    setForm({ name: product.name, category: product.category, price: String(product.price), stock: String(product.stock), image: product.image ?? '', description: product.description ?? '', rating: product.rating ?? 0, accent: product.accent ?? '' })
  }, [id, product])

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const handleSubmit = (event) => {
    event.preventDefault()
    const updates = { ...form, price: Number(form.price), stock: Number.parseInt(form.stock, 10), inStock: Number(form.stock) > 0 }
    if (id) {
      dispatch(updateAdminProduct({ id, ...updates }))
      toast.success('Product updated')
    } else {
      dispatch(addAdminProduct({ ...updates, id: createProductId(), status: 'Active', source: 'admin', createdAt: new Date().toISOString() }))
      toast.success('Product added to storefront')
    }
    navigate('/admin/products')
  }

  if (notFound) return <div className="rounded-xl border border-[#dfe8e0] bg-white p-8 text-center"><h1 className="text-lg font-bold text-[#20352a]">Product not found</h1><Link to="/admin/products" className="mt-4 inline-flex text-sm font-semibold text-[#176a43]">Back to products</Link></div>

  return (
    <section className="mx-auto max-w-215 space-y-6">
      <div><Link to="/admin/products" className="inline-flex items-center gap-2 text-sm font-semibold text-[#176a43]"><ArrowLeft className="h-4 w-4" /> Products</Link><p className="mt-5 text-xs font-bold uppercase tracking-[0.15em] text-[#328051]">Catalog management</p><h1 className="mt-1 text-2xl font-bold text-[#20352a]">{id ? 'Edit product' : 'Add product'}</h1></div>
      <form onSubmit={handleSubmit} className="rounded-xl border border-[#dfe8e0] bg-white p-5 shadow-sm sm:p-7"><div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-semibold text-[#435147] sm:col-span-2">Product name<input name="name" required minLength={2} maxLength={100} value={form.name} onChange={updateField} className="mt-2 h-11 w-full rounded-lg border border-[#dce5de] px-3 font-normal outline-none focus:border-[#398456]" /></label>
        <label className="text-sm font-semibold text-[#435147]">Category<select name="category" value={form.category} onChange={updateField} className="mt-2 h-11 w-full rounded-lg border border-[#dce5de] bg-white px-3 font-normal">{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
        <label className="text-sm font-semibold text-[#435147]">Price<input name="price" type="number" min="0.01" step="0.01" required value={form.price} onChange={updateField} className="mt-2 h-11 w-full rounded-lg border border-[#dce5de] px-3 font-normal" /></label>
        <label className="text-sm font-semibold text-[#435147]">Stock<input name="stock" type="number" min="0" step="1" required value={form.stock} onChange={updateField} className="mt-2 h-11 w-full rounded-lg border border-[#dce5de] px-3 font-normal" /></label>
        <label className="text-sm font-semibold text-[#435147]">Image URL<input name="image" type="url" value={form.image} onChange={updateField} placeholder="https://…" className="mt-2 h-11 w-full rounded-lg border border-[#dce5de] px-3 font-normal" /></label>
        <label className="text-sm font-semibold text-[#435147] sm:col-span-2">Description<textarea name="description" maxLength={1000} rows={4} value={form.description} onChange={updateField} className="mt-2 w-full rounded-lg border border-[#dce5de] px-3 py-2.5 font-normal" /></label>
      </div><div className="mt-6 flex justify-end border-t border-[#edf1ed] pt-5"><button type="submit" className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#176a43] px-5 text-sm font-semibold text-white hover:bg-[#105735]"><Save className="h-4 w-4" /> {id ? 'Save changes' : 'Create product'}</button></div></form>
    </section>
  )
}
