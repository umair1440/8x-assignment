import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ImagePlus, PackagePlus } from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { readSellerProduct, saveSellerProduct, updateSellerProduct } from '../../features/seller/sellerCatalog'

const categories = ['Audio', 'Accessories', 'Electronics', 'Fashion', 'Gaming', 'Home', 'Phones']
const emptyForm = { name: '', category: 'Electronics', price: '', stock: '', image: '', description: '' }

function createProductId() {
  return globalThis.crypto?.randomUUID?.() ?? `product-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export default function SellerAddProduct() {
  const seller = useSelector((state) => state.sellerAuth.seller)
  const navigate = useNavigate()
  const { id } = useParams()
  const existingProduct = id ? readSellerProduct(seller.id, id) : null
  const [form, setForm] = useState(() => existingProduct ? { ...existingProduct, price: String(existingProduct.price), stock: String(existingProduct.stock) } : emptyForm)
  const [productNotFound, setProductNotFound] = useState(Boolean(id && !existingProduct))

  useEffect(() => {
    const product = id ? readSellerProduct(seller.id, id) : null
    setForm(product ? { ...product, price: String(product.price), stock: String(product.stock) } : emptyForm)
    setProductNotFound(Boolean(id && !product))
  }, [id, seller.id])

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const handleSubmit = (event) => {
    event.preventDefault()
    const product = { ...form, sellerId: seller.id, sellerName: seller.storeName, price: Number(form.price).toFixed(2), stock: Number.parseInt(form.stock, 10), updatedAt: new Date().toISOString() }
    if (id) {
      updateSellerProduct(seller.id, id, product)
      toast.success('Product updated')
    } else {
      saveSellerProduct({ ...product, id: createProductId(), createdAt: new Date().toISOString() })
      toast.success('Product added to your store')
    }
    navigate('/seller/products')
  }

  if (productNotFound) return <div className="rounded-xl border border-[#e1e9e2] bg-white p-8 text-center"><h1 className="text-xl font-bold text-[#203128]">Product not found</h1><p className="mt-2 text-sm text-[#748078]">This listing is not part of your store.</p><Link to="/seller/products" className="mt-5 inline-flex rounded-lg bg-[#176a43] px-4 py-2.5 text-sm font-semibold text-white">Back to products</Link></div>

  return (
    <div className="space-y-7">
      <div><Link to="/seller/products" className="inline-flex items-center gap-2 text-sm font-semibold text-[#176a43]"><ArrowLeft className="h-4 w-4" /> Products</Link><p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[#398456]">Catalog</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-[#203128]">{id ? 'Edit product' : 'Add a product'}</h1><p className="mt-2 text-sm text-[#748078]">{id ? 'Update this listing in your store.' : `Create a listing for ${seller.storeName}.`}</p></div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-[#e1e9e2] bg-white p-5 shadow-sm sm:p-7">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="text-sm font-semibold text-[#435147]">Product name<input name="name" required minLength={2} maxLength={100} value={form.name} onChange={updateField} placeholder="e.g. Wireless studio headphones" className="mt-2 h-11 w-full rounded-lg border border-[#dce5de] px-3 font-normal outline-none focus:border-[#398456] focus:ring-2 focus:ring-[#398456]/10" /></label>
          <label className="text-sm font-semibold text-[#435147]">Category<select name="category" value={form.category} onChange={updateField} className="mt-2 h-11 w-full rounded-lg border border-[#dce5de] bg-white px-3 font-normal outline-none focus:border-[#398456]">{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
          <label className="text-sm font-semibold text-[#435147]">Price<input name="price" type="number" required min="0.01" step="0.01" value={form.price} onChange={updateField} placeholder="0.00" className="mt-2 h-11 w-full rounded-lg border border-[#dce5de] px-3 font-normal outline-none focus:border-[#398456]" /></label>
          <label className="text-sm font-semibold text-[#435147]">Available stock<input name="stock" type="number" required min="0" step="1" value={form.stock} onChange={updateField} placeholder="0" className="mt-2 h-11 w-full rounded-lg border border-[#dce5de] px-3 font-normal outline-none focus:border-[#398456]" /></label>
          <label className="text-sm font-semibold text-[#435147] md:col-span-2">Product image URL <span className="font-normal text-[#87938a]">(optional)</span><div className="relative mt-2"><ImagePlus className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#87938a]" /><input name="image" type="url" value={form.image} onChange={updateField} placeholder="https://…" className="h-11 w-full rounded-lg border border-[#dce5de] pl-10 pr-3 font-normal outline-none focus:border-[#398456]" /></div></label>
          <label className="text-sm font-semibold text-[#435147] md:col-span-2">Description<textarea name="description" required minLength={10} maxLength={1000} rows={4} value={form.description} onChange={updateField} placeholder="Describe the product, key features, and what makes it useful." className="mt-2 w-full resize-y rounded-lg border border-[#dce5de] px-3 py-2.5 font-normal outline-none focus:border-[#398456]" /></label>
        </div>
        <div className="mt-6 flex justify-end border-t border-[#edf1ed] pt-5"><button type="submit" className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#176a43] px-5 text-sm font-semibold text-white transition hover:bg-[#105735]"><PackagePlus className="h-4 w-4" /> {id ? 'Save changes' : 'Save product'}</button></div>
      </form>
    </div>
  )
}