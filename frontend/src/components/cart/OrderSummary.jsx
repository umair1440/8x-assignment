import { Link } from 'react-router-dom'

export default function OrderSummary({ subtotal, itemCount }) {
  const shipping = subtotal === 0 || subtotal >= 75 ? 0 : 6.99
  const total = subtotal + shipping

  return (
    <aside className="rounded-2xl border border-[#e2ebe4] bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold text-[#1d2f2a]">Order summary</h2>
      <div className="mt-5 space-y-3 text-sm text-[#65716b]">
        <div className="flex justify-between"><span>Items ({itemCount})</span><span>${subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
        <div className="border-t border-[#e5ece7] pt-3 text-base font-bold text-[#1d2f2a]">
          <div className="flex justify-between"><span>Total</span><span>${total.toFixed(2)}</span></div>
        </div>
      </div>

      <p className="mt-4 rounded-xl bg-[#f1f8f2] px-3 py-2 text-xs text-[#49745b]">
        {subtotal >= 75 ? 'Your order qualifies for free shipping.' : `Free shipping on orders over $75.00.`}
      </p>
      <Link
        to="/checkout"
        className="mt-5 flex w-full items-center justify-center rounded-full bg-[#0b7d52] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#086744]"
      >
        Continue to checkout
      </Link>
    </aside>
  )
}
