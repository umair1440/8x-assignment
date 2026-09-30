import { ChevronLeft, ChevronRight } from 'lucide-react'

function getPages(page, pageCount) {
  if (pageCount <= 5) return Array.from({ length: pageCount }, (_, index) => index + 1)
  const pageSet = new Set([1, pageCount, page - 1, page, page + 1].filter((number) => number >= 1 && number <= pageCount))
  const pages = []
  let previous = 0

  for (const number of [...pageSet].sort((first, second) => first - second)) {
    if (number - previous > 1) pages.push(`ellipsis-${number}`)
    pages.push(number)
    previous = number
  }

  return pages
}

export default function Pagination({ page, pageCount, onPageChange }) {
  if (pageCount <= 1) return null

  return (
    <nav aria-label="Product pages" className="mt-8 flex items-center justify-center gap-1.5">
      <button type="button" onClick={() => onPageChange(page - 1)} disabled={page === 1} aria-label="Previous page" className="flex h-9 items-center gap-1 rounded-lg border border-[#dfe8e1] bg-white px-3 text-sm font-medium text-[#536058] transition hover:bg-[#f4f8f4] disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-4 w-4" /><span className="hidden sm:inline">Previous</span></button>
      {getPages(page, pageCount).map((item) => typeof item === 'number' ? (
        <button key={item} type="button" onClick={() => onPageChange(item)} aria-label={`Page ${item}`} aria-current={item === page ? 'page' : undefined} className={`h-9 min-w-9 rounded-lg px-2 text-sm font-semibold transition ${item === page ? 'bg-[#176a43] text-white' : 'border border-[#dfe8e1] bg-white text-[#536058] hover:bg-[#f4f8f4]'}`}>{item}</button>
      ) : <span key={item} className="px-1 text-sm text-[#87938a]" aria-hidden="true">…</span>)}
      <button type="button" onClick={() => onPageChange(page + 1)} disabled={page === pageCount} aria-label="Next page" className="flex h-9 items-center gap-1 rounded-lg border border-[#dfe8e1] bg-white px-3 text-sm font-medium text-[#536058] transition hover:bg-[#f4f8f4] disabled:cursor-not-allowed disabled:opacity-40"><span className="hidden sm:inline">Next</span><ChevronRight className="h-4 w-4" /></button>
    </nav>
  )
}
