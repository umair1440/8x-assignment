import { RotateCcw, X } from 'lucide-react'

export default function FilterSidebar({
  category,
  categories,
  filters,
  brands,
  onCategoryChange,
  onFilterChange,
  onBrandToggle,
  onReset,
  onClose,
  resultCount,
  activeFilterCount,
}) {
  return (
    <aside className="rounded-xl border border-[#e2eae3] bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {onClose && <button type="button" onClick={onClose} aria-label="Close filters" className="-ml-2 flex h-8 w-8 items-center justify-center rounded-lg text-[#68736c] hover:bg-[#f1f5f1] lg:hidden"><X className="h-4 w-4" /></button>}
          <h2 className="text-base font-bold text-[#1d2f2a]">Filters</h2>
        </div>
        {activeFilterCount > 0 && <button type="button" onClick={onReset} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1a7f52] hover:text-[#126b44]"><RotateCcw className="h-3.5 w-3.5" /> Clear all</button>}
      </div>

      <fieldset className="border-t border-[#edf1ed] py-4">
        <legend className="mb-3 text-sm font-semibold text-[#344039]">Category</legend>
        <select value={category} onChange={(event) => onCategoryChange(event.target.value)} className="h-10 w-full rounded-lg border border-[#dfe8e1] bg-white px-3 text-sm text-[#45534a] outline-none focus:border-[#8cbea0]">
          <option value="All">All categories</option>
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </fieldset>

      <fieldset className="border-t border-[#edf1ed] py-4">
        <legend className="mb-3 text-sm font-semibold text-[#344039]">Price range</legend>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-[#7a857d]">Min
            <div className="mt-1 flex h-10 items-center rounded-lg border border-[#dfe8e1] px-2.5 focus-within:border-[#8cbea0]"><span className="text-sm text-[#7a857d]">$</span><input type="number" min="0" value={filters.minPrice} onChange={(event) => onFilterChange('minPrice', event.target.value)} placeholder="0" className="w-full min-w-0 border-0 bg-transparent pl-1 text-sm text-[#344039] outline-none" /></div>
          </label>
          <label className="text-xs text-[#7a857d]">Max
            <div className="mt-1 flex h-10 items-center rounded-lg border border-[#dfe8e1] px-2.5 focus-within:border-[#8cbea0]"><span className="text-sm text-[#7a857d]">$</span><input type="number" min="0" value={filters.maxPrice} onChange={(event) => onFilterChange('maxPrice', event.target.value)} placeholder="Any" className="w-full min-w-0 border-0 bg-transparent pl-1 text-sm text-[#344039] outline-none" /></div>
          </label>
        </div>
      </fieldset>

      <fieldset className="border-t border-[#edf1ed] py-4">
        <legend className="mb-3 text-sm font-semibold text-[#344039]">Customer rating</legend>
        <div className="space-y-2.5">
          {[{ value: '', label: 'Any rating' }, { value: '4', label: '4 stars & up' }, { value: '4.5', label: '4.5 stars & up' }].map((rating) => (
            <label key={rating.value || 'any'} className="flex cursor-pointer items-center gap-2.5 text-sm text-[#58645c]">
              <input type="radio" name="rating-filter" value={rating.value} checked={filters.rating === rating.value} onChange={() => onFilterChange('rating', rating.value)} className="accent-[#1a7f52]" />
              {rating.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="border-t border-[#edf1ed] py-4">
        <legend className="mb-3 text-sm font-semibold text-[#344039]">Brand</legend>
        <div className="space-y-2.5">
          {brands.map((brand) => (
            <label key={brand} className="flex cursor-pointer items-center gap-2.5 text-sm text-[#58645c]">
              <input type="checkbox" checked={filters.brands.includes(brand)} onChange={() => onBrandToggle(brand)} className="h-4 w-4 rounded border-[#cdd8ce] accent-[#1a7f52]" />
              {brand}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex cursor-pointer items-center gap-2.5 border-t border-[#edf1ed] py-4 text-sm text-[#58645c]">
        <input type="checkbox" checked={filters.inStockOnly} onChange={(event) => onFilterChange('inStockOnly', event.target.checked)} className="h-4 w-4 rounded border-[#cdd8ce] accent-[#1a7f52]" />
        In stock only
      </label>

      {onClose && <div className="sticky bottom-0 -mx-5 mt-1 flex items-center justify-between gap-3 border-t border-[#edf1ed] bg-white px-5 pb-1 pt-4 lg:hidden"><span className="text-sm text-[#748078]">{resultCount} results</span><button type="button" onClick={onClose} className="h-10 rounded-lg bg-[#1a7f52] px-5 text-sm font-semibold text-white">Show results</button></div>}
    </aside>
  )
}
