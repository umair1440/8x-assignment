import { Link } from 'react-router-dom'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import CartItem from '../components/cart/CartItem'
import OrderSummary from '../components/cart/OrderSummary'
import { clearCart, removeCartItem, setCartItemQuantity } from '../features/cart/cartSlice'

export default function Cart() {
  const dispatch = useDispatch()
  const items = useSelector((state) => state.cart.items)
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)
  const subtotal = items.reduce((total, item) => total + item.unitPrice * item.quantity, 0)

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0b7d52]">Your selection</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1d2f2a]">Shopping cart <span className="text-lg font-medium text-[#7b8780]">({itemCount})</span></h1>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={() => dispatch(clearCart())}
            className="text-sm font-semibold text-[#7b8780] transition hover:text-red-600"
          >
            Clear cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-[#e2ebe4] bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eff8f1] text-[#0b7d52]">
            <ShoppingBag className="h-8 w-8" strokeWidth={1.6} />
          </div>
          <h2 className="mt-5 text-xl font-bold text-[#1d2f2a]">Your cart is empty</h2>
          <p className="mt-2 text-sm text-[#748078]">Add something you love and it will show up here.</p>
          <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0b7d52] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#086744]">
            <ArrowLeft className="h-4 w-4" />
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
          <section className="rounded-2xl border border-[#e2ebe4] bg-white px-4 shadow-sm sm:px-6">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onQuantityChange={(quantity) => dispatch(setCartItemQuantity({ id: item.id, quantity }))}
                onRemove={() => dispatch(removeCartItem(item.id))}
              />
            ))}
            <Link to="/" className="inline-flex items-center gap-2 py-5 text-sm font-semibold text-[#0b7d52] hover:text-[#075d3d]">
              <ArrowLeft className="h-4 w-4" />
              Continue shopping
            </Link>
          </section>
          <OrderSummary subtotal={subtotal} itemCount={itemCount} />
        </div>
      )}
    </div>
  )
}
