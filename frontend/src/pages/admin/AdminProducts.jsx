import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ImagePlus, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { deleteAdminProduct } from '../../features/admin/adminDataSlice'

export default function AdminProducts() {
  const dispatch = useDispatch()
  const products = useSelector((state) => state.adminData.products)
  const [query, setQuery] = useState('')
  const filteredProducts = products.filter((product) => `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase().trim()))

  const handleDelete = (product) => {
    dispatch(deleteAdminProduct(product.id))
    toast.success(`${product.name} deleted`)
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#328051]">Catalog</p><h1 className="mt-1 text-2xl font-bold text-[#20352a]">Products</h1><p className="mt-1 text-sm text-[#738078]">Manage products available on the storefront.</p></div><Link to="/admin/products/new" className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#176a43] px-4 text-sm font-semibold text-white transition hover:bg-[#105735]"><Plus className="h-4 w-4" /> Add product</Link></div>
      <div className="flex h-10 max-w-sm items-center gap-2 rounded-lg border border-[#dbe6dc] bg-white px-3"><Search className="h-4 w-4 text-[#78867c]" /><input aria-label="Search products" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-[#929d95]" /></div>

      {filteredProducts.length === 0 ? <div className="rounded-xl border border-dashed border-[#cddbd0] bg-white px-5 py-14 text-center"><ImagePlus className="mx-auto h-7 w-7 text-[#6c9a79]" /><p className="mt-3 font-semibold text-[#435147]">No products found</p><p className="mt-1 text-sm text-[#87938a]">Try a different name or category.</p></div> : (
        <div className="overflow-hidden rounded-xl border border-[#dfe8e0] bg-white"><div className="hidden grid-cols-[minmax(0,1fr)_130px_100px_100px_100px] gap-4 border-b border-[#e9efea] bg-[#f8faf8] px-4 py-3 text-[0.68rem] font-bold uppercase tracking-wide text-[#7b877e] md:grid"><span>Product</span><span>Category</span><span>Price</span><span>Stock</span><span className="text-right">Actions</span></div>{filteredProducts.map((product) => <article key={product.id} className="grid grid-cols-[minmax(0,1fr)_76px] items-center gap-3 border-b border-[#edf1ed] px-4 py-4 last:border-0 md:grid-cols-[minmax(0,1fr)_130px_100px_100px_100px] md:gap-4"><div className="flex min-w-0 items-center gap-3">{product.image ? <img src={product.image} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" /> : <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#edf6ef] text-sm font-bold text-[#398456]">{product.name[0]}</div>}<div className="min-w-0"><p className="truncate text-sm font-semibold text-[#2a3b30]">{product.name}</p><p className="mt-1 text-xs text-[#849087] md:hidden">{product.category} · ${Number(product.price).toFixed(2)} · {product.stock} stock</p></div></div><span className="hidden text-sm text-[#667269] md:block">{product.category}</span><span className="hidden text-sm font-medium text-[#334238] md:block">${Number(product.price).toFixed(2)}</span><span className="hidden md:block">{product.stock <= 5 ? <span className="rounded-full bg-[#fff2db] px-2.5 py-1 text-xs font-semibold text-[#9b681d]">Low · {product.stock}</span> : <span className="text-sm text-[#536158]">{product.stock}</span>}</span><div className="flex justify-end gap-1"><Link to={`/admin/products/${product.id}/edit`} aria-label={`Edit ${product.name}`} className="flex h-9 w-9 items-center justify-center rounded-lg text-[#5c7162] hover:bg-[#eff6f0] hover:text-[#176a43]"><Pencil className="h-4 w-4" /></Link><button type="button" onClick={() => handleDelete(product)} aria-label={`Delete ${product.name}`} className="flex h-9 w-9 items-center justify-center rounded-lg text-[#87938a] hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div></article>)}</div>
      )}
    </section>
  )
}
