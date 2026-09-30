import { Minus, Plus, Trash2 } from 'lucide-react'

export default function CartItem({ item, onQuantityChange, onRemove }) {
  return (
    <article className="flex flex-col gap-4 border-b border-[#e5ece7] py-5 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-white sm:h-28 sm:w-28">
          {item.image ? (
            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${item.accent ?? item.tint ?? 'from-[#dfeee1] to-[#b9d9c0]'}`}>
              <span className="text-3xl font-black text-white/80">{item.name.slice(0, 1)}</span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-[#777]">{item.category ?? 'Electronics'}</p>
          <h2 className="mt-1 font-semibold text-[#1d2f2a]">{item.name}</h2>
          {(item.color || item.size) && <p className="mt-1 text-xs text-[#777]">{[item.color, item.size && `Size ${item.size}`].filter(Boolean).join(' · ')}</p>}
          <p className="mt-2 font-semibold text-[#08613d]">${item.unitPrice.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <div className="flex items-center rounded-full border border-[#dfe8e1] bg-white">
          <button
            type="button"
            onClick={() => onQuantityChange(item.quantity - 1)}
            disabled={item.quantity <= 1}
            aria-label={`Decrease ${item.name} quantity`}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#345248] transition hover:bg-[#eef7f0] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-sm font-semibold text-[#26332d]">{item.quantity}</span>
          <button
            type="button"
            onClick={() => onQuantityChange(item.quantity + 1)}
            aria-label={`Increase ${item.name} quantity`}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#345248] transition hover:bg-[#eef7f0]"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <span className="w-24 text-right font-semibold text-[#1d2f2a]">${(item.unitPrice * item.quantity).toFixed(2)}</span>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${item.name} from cart`}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#8a9690] transition hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </article>
  )
}
