import { Link } from 'react-router-dom'
import { PackagePlus, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { deleteSellerProduct, readSellerProducts } from '../../features/seller/sellerCatalog'

export default function SellerProducts() {
  const seller = useSelector((state) => state.sellerAuth.seller)
  const [products, setProducts] = useState(() => readSellerProducts(seller.id))

  const handleDelete = (id) => {
    deleteSellerProduct(seller.id, id)
    setProducts((current) => current.filter((product) => product.id !== id))
    toast.success('Product removed from your store')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#398456]">Catalog</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-[#203128]">Products</h1><p className="mt-2 text-sm text-[#748078]">Manage listings for {seller.storeName}.</p></div><Link to="/seller/products/new" className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#176a43] px-4 text-sm font-semibold text-white hover:bg-[#105735]"><PackagePlus className="h-4 w-4" /> Add product</Link></div>
      {products.length === 0 ? <div className="rounded-xl border border-dashed border-[#cddbd0] bg-white px-5 py-12 text-center"><PackagePlus className="mx-auto h-7 w-7 text-[#699878]" /><p className="mt-3 text-sm font-semibold text-[#435147]">No products in your catalog</p><p className="mt-1 text-xs text-[#87938a]">Create a listing to start building your store.</p><Link to="/seller/products/new" className="mt-4 inline-flex rounded-lg bg-[#176a43] px-4 py-2.5 text-sm font-semibold text-white">Add your first product</Link></div> : (
        <div className="overflow-hidden rounded-xl border border-[#e1e9e2] bg-white shadow-sm"><div className="hidden grid-cols-[minmax(0,1fr)_130px_100px_90px_90px] gap-4 border-b border-[#edf1ed] bg-[#f8faf8] px-4 py-3 text-xs font-bold uppercase tracking-wide text-[#78847c] sm:grid"><span>Product</span><span>Category</span><span>Price</span><span>Stock</span><span className="text-right">Actions</span></div>{products.map((product) => <article key={product.id} className="grid grid-cols-[minmax(0,1fr)_76px] items-center gap-3 border-b border-[#edf1ed] px-4 py-4 last:border-0 sm:grid-cols-[minmax(0,1fr)_130px_100px_90px_90px] sm:gap-4"><div className="flex min-w-0 items-center gap-3">{product.image ? <img src={product.image} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" /> : <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#edf6ef] text-sm font-bold text-[#398456]">{product.name[0]}</div>}<div className="min-w-0"><p className="truncate text-sm font-semibold text-[#29392f]">{product.name}</p><p className="mt-1 text-xs text-[#87938a] sm:hidden">{product.category} · ${product.price} · {product.stock} in stock</p></div></div><span className="hidden text-sm text-[#657168] sm:block">{product.category}</span><span className="hidden text-sm font-semibold text-[#29392f] sm:block">${product.price}</span><span className="hidden text-sm text-[#657168] sm:block">{product.stock}</span><div className="flex justify-end gap-1"><Link to={`/seller/products/${product.id}/edit`} aria-label={`Edit ${product.name}`} className="flex h-9 w-9 items-center justify-center rounded-lg text-[#5c7162] transition hover:bg-[#eff6f0] hover:text-[#176a43]"><Pencil className="h-4 w-4" /></Link><button type="button" onClick={() => handleDelete(product.id)} aria-label={`Delete ${product.name}`} className="flex h-9 w-9 items-center justify-center rounded-lg text-[#87938a] transition hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div></article>)}</div>
      )}
    </div>
  )
}