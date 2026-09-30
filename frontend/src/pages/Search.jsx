import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search as SearchIcon, SlidersHorizontal, X } from 'lucide-react'
import { useSelector } from 'react-redux'
import FilterSidebar from '../components/product/FilterSidebar'
import ProductCard from '../components/product/ProductCard'
import Pagination from '../components/ui/Pagination'
import { readAllSellerProducts } from '../features/seller/sellerCatalog'
import { toStorefrontProduct } from '../features/products/productCatalog'

const categoryOptions = ['Audio', 'Accessories', 'Gaming', 'Home', 'Fashion', 'Electronics', 'Audio & Video', 'Smartphones', 'Home Appliances', 'Health & Beauty']

const brands = ['JBL', 'Other']

function normalize(value) {
  return value.toLowerCase().trim()
}

function getProductBrand(name) {
  return brands.slice(0, -1).find((brand) => name.toLowerCase().startsWith(brand.toLowerCase())) ?? 'Other'
}

function getProductPrice(price) {
  return Number.parseFloat(String(price).replace(/[^\d.]/g, '')) || 0
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const adminProducts = useSelector((state) => state.adminData.products)
  const searchParamString = searchParams.toString()
  const searchQuery = searchParams.get('q') ?? ''
  const selectedCategory = searchParams.get('category') ?? 'All'
  const [query, setQuery] = useState(searchQuery)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const sort = searchParams.get('sort') ?? 'featured'
  const filters = {
    minPrice: searchParams.get('min') ?? '',
    maxPrice: searchParams.get('max') ?? '',
    rating: searchParams.get('rating') ?? '',
    brands: searchParams.getAll('brand'),
    inStockOnly: searchParams.get('stock') === '1',
  }
  const requestedPage = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const marketplaceProducts = [...adminProducts, ...readAllSellerProducts()].map(toStorefrontProduct)

  useEffect(() => setQuery(searchQuery), [searchQuery])

  useEffect(() => {
    setIsLoading(true)
    const timerId = window.setTimeout(() => setIsLoading(false), 140)
    return () => window.clearTimeout(timerId)
  }, [searchParamString])

  const updateSearchParams = (update, resetPage = true) => {
    const nextParams = new URLSearchParams(searchParams)
    update(nextParams)
    if (resetPage) nextParams.delete('page')
    setSearchParams(nextParams, { replace: true })
  }

  const submitSearch = (event) => {
    event.preventDefault()
    const nextParams = new URLSearchParams(searchParams)
    const trimmedQuery = query.trim()
    if (trimmedQuery) nextParams.set('q', trimmedQuery)
    else nextParams.delete('q')
    nextParams.delete('page')
    setSearchParams(nextParams)
  }

  const selectCategory = (category) => {
    updateSearchParams((params) => {
      if (category === 'All') params.delete('category')
      else params.set('category', category)
    })
  }

  const updateFilter = (key, value) => {
    const paramName = { minPrice: 'min', maxPrice: 'max', rating: 'rating', inStockOnly: 'stock' }[key]
    if (!paramName) return
    updateSearchParams((params) => {
      const hasValue = key === 'inStockOnly' ? value : value !== ''
      if (!hasValue) params.delete(paramName)
      else params.set(paramName, key === 'inStockOnly' ? '1' : value)
    })
  }

  const toggleBrand = (brand) => updateSearchParams((params) => {
    const selectedBrands = params.getAll('brand')
    params.delete('brand')
    const nextBrands = selectedBrands.includes(brand) ? selectedBrands.filter((item) => item !== brand) : [...selectedBrands, brand]
    nextBrands.forEach((item) => params.append('brand', item))
  })

  const resetFilters = () => {
    updateSearchParams((params) => {
      ;['category', 'min', 'max', 'rating', 'brand', 'stock'].forEach((key) => params.delete(key))
    })
  }

  const activeFilterCount = Number(selectedCategory !== 'All')
    + Number(filters.minPrice !== '')
    + Number(filters.maxPrice !== '')
    + Number(filters.rating !== '')
    + filters.brands.length
    + Number(filters.inStockOnly)

  const filteredProducts = marketplaceProducts.filter((product) => {
    const matchesQuery = !searchQuery || normalize(`${product.name} ${product.category}`).includes(normalize(searchQuery))
    const price = getProductPrice(product.price)
    const matchesMinPrice = filters.minPrice === '' || price >= Number(filters.minPrice)
    const matchesMaxPrice = filters.maxPrice === '' || price <= Number(filters.maxPrice)
    const matchesRating = filters.rating === '' || (product.rating ?? 4.5) >= Number(filters.rating)
    const matchesBrand = filters.brands.length === 0 || filters.brands.includes(getProductBrand(product.name))
    const matchesAvailability = !filters.inStockOnly || product.inStock !== false
    const normalizedCategory = normalize(selectedCategory)
    const matchesCategory = selectedCategory === 'All'
      || normalize(product.category) === normalizedCategory
      || (normalizedCategory === 'electronics' && product.category !== 'Fashion')
      || (normalizedCategory === 'audio & video' && product.category === 'Audio')
      || (normalizedCategory === 'smartphones' && product.category === 'Phones')
      || (normalizedCategory === 'home appliances' && product.category === 'Home')
      || (normalizedCategory === 'health & beauty' && product.category === 'Health & Beauty')

    return matchesQuery && matchesCategory && matchesMinPrice && matchesMaxPrice && matchesRating && matchesBrand && matchesAvailability
  }).sort((first, second) => {
    if (sort === 'price-low') return getProductPrice(first.price) - getProductPrice(second.price)
    if (sort === 'price-high') return getProductPrice(second.price) - getProductPrice(first.price)
    return 0
  })

  const pageSize = 8
  const pageCount = Math.ceil(filteredProducts.length / pageSize)
  const currentPage = Math.min(requestedPage, Math.max(pageCount, 1))
  const visibleProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  useEffect(() => {
    if (requestedPage <= Math.max(pageCount, 1)) return
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('page', String(Math.max(pageCount, 1)))
    setSearchParams(nextParams, { replace: true })
  }, [pageCount, requestedPage, searchParams, setSearchParams])

  const activeChips = []
  if (searchQuery) activeChips.push({ label: `Search: ${searchQuery}`, remove: () => updateSearchParams((params) => params.delete('q')) })
  if (selectedCategory !== 'All') activeChips.push({ label: selectedCategory, remove: () => selectCategory('All') })
  if (filters.minPrice || filters.maxPrice) activeChips.push({ label: `$${filters.minPrice || '0'} - ${filters.maxPrice ? `$${filters.maxPrice}` : 'Any'}`, remove: () => updateSearchParams((params) => { params.delete('min'); params.delete('max') }) })
  if (filters.rating) activeChips.push({ label: `${filters.rating}+ stars`, remove: () => updateFilter('rating', '') })
  filters.brands.forEach((brand) => activeChips.push({ label: brand, remove: () => toggleBrand(brand) }))
  if (filters.inStockOnly) activeChips.push({ label: 'In stock', remove: () => updateFilter('inStockOnly', false) })

  const changePage = (page) => {
    updateSearchParams((params) => params.set('page', String(page)), false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className="mx-auto max-w-7xl py-2 sm:py-5">
      <div className="mb-8 border-b border-[#dfeee1] pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1a7f52]">Find your next favorite</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1d2f2a]">{searchQuery ? `Results for “${searchQuery}”` : selectedCategory !== 'All' ? selectedCategory : 'Explore products'}</h1>
        <form role="search" onSubmit={submitSearch} className="mt-5 flex h-12 max-w-2xl items-center gap-3 rounded-full border border-[#dce6de] bg-white px-4 shadow-sm focus-within:border-[#8cbea0]">
          <SearchIcon className="h-5 w-5 shrink-0 text-[#1a7f52]" />
          <input aria-label="Search products" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by product or category" className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-[#8b948d]" />
          {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="text-[#8b948d] hover:text-[#1d2f2a]"><X className="h-4 w-4" /></button>}
          <button type="submit" className="rounded-full bg-[#1a7f52] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#126b44]">Search</button>
        </form>
      </div>

      {activeChips.length > 0 && <div className="mb-5 flex flex-wrap items-center gap-2" aria-label="Applied filters">
        <span className="mr-1 text-xs font-semibold text-[#748078]">Applied:</span>
        {activeChips.map((chip) => <span key={chip.label} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#dce8de] bg-[#f4f8f4] pl-3 pr-1.5 text-xs font-medium text-[#405047]">{chip.label}<button type="button" onClick={chip.remove} aria-label={`Remove ${chip.label} filter`} className="flex h-5 w-5 items-center justify-center rounded-full text-[#748078] hover:bg-white hover:text-[#1d2f2a]"><X className="h-3 w-3" /></button></span>)}
        {activeFilterCount > 0 && <button type="button" onClick={resetFilters} className="ml-1 text-xs font-semibold text-[#1a7f52] hover:underline">Clear filters</button>}
      </div>}

      <div className="mb-4 flex items-center justify-between gap-3 lg:mb-5">
        <button type="button" onClick={() => setIsFiltersOpen((current) => !current)} aria-expanded={isFiltersOpen} className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#dfe8e1] bg-white px-3 text-sm font-semibold text-[#344039] lg:hidden">
          <SlidersHorizontal className="h-4 w-4 text-[#1a7f52]" /> Filters{activeFilterCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#1a7f52] px-1 text-xs text-white">{activeFilterCount}</span>}
        </button>
        <p className="text-sm text-[#748078]">{filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}</p>
        <label className="flex shrink-0 items-center gap-2 text-sm text-[#68736c]">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="sr-only">Sort products</span>
          <select value={sort} onChange={(event) => updateSearchParams((params) => { if (event.target.value === 'featured') params.delete('sort'); else params.set('sort', event.target.value) })} className="rounded-lg border border-[#dfe8e1] bg-white px-3 py-2 text-sm text-[#344039] outline-none focus:border-[#8cbea0]">
            <option value="featured">Featured</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </label>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-6">
        <div className="hidden lg:block">
          <FilterSidebar
            category={selectedCategory}
            categories={categoryOptions}
            filters={filters}
            brands={brands}
            onCategoryChange={selectCategory}
            onFilterChange={updateFilter}
            onBrandToggle={toggleBrand}
            onReset={resetFilters}
            activeFilterCount={activeFilterCount}
          />
        </div>

        {isFiltersOpen && <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close filters" onClick={() => setIsFiltersOpen(false)} className="absolute inset-0 bg-[#17261d]/40 backdrop-blur-[1px]" />
          <div className="absolute inset-y-0 left-0 w-[min(380px,90vw)] overflow-y-auto bg-[#f6f9f6] p-4 shadow-2xl">
            <FilterSidebar category={selectedCategory} categories={categoryOptions} filters={filters} brands={brands} onCategoryChange={selectCategory} onFilterChange={updateFilter} onBrandToggle={toggleBrand} onReset={resetFilters} activeFilterCount={activeFilterCount} resultCount={filteredProducts.length} onClose={() => setIsFiltersOpen(false)} />
          </div>
        </div>}

        <div className="min-w-0 lg:col-start-2" aria-busy={isLoading}>
          {isLoading ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4">{Array.from({ length: pageSize }, (_, index) => <div key={index} className="animate-pulse rounded-[22px] bg-[#f3f3f3] p-2.5"><div className="aspect-[0.84] rounded-[15px] bg-[#e5ebe6]" /><div className="mt-3 h-4 w-3/4 rounded bg-[#e5ebe6]" /><div className="mt-2 h-3 w-1/2 rounded bg-[#e5ebe6]" /><div className="mt-4 h-8 rounded bg-[#e5ebe6]" /></div>)}</div> : filteredProducts.length ? (
          <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4">
            {visibleProducts.map((product) => <ProductCard key={product.id ?? product.slug ?? product.name} product={product} />)}
          </div>
          <Pagination page={currentPage} pageCount={pageCount} onPageChange={changePage} />
          </>
        ) : (
          <div className="rounded-xl border border-[#dfeee1] bg-white px-6 py-14 text-center shadow-sm">
            <SearchIcon className="mx-auto h-8 w-8 text-[#1a7f52]" />
            <h2 className="mt-4 text-lg font-bold text-[#1d2f2a]">No matching products</h2>
            <p className="mt-2 text-sm text-[#748078]">Try adjusting the filters or your search term.</p>
            <button type="button" onClick={() => { setQuery(''); updateSearchParams((params) => { ['q', 'category', 'min', 'max', 'rating', 'brand', 'stock', 'page'].forEach((key) => params.delete(key)) }) }} className="mt-5 rounded-full bg-[#1a7f52] px-5 py-2.5 text-sm font-semibold text-white">Clear search and filters</button>
          </div>
        )}
        </div>
      </div>
    </section>
  )
}
