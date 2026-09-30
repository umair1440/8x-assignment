import { useEffect, useState } from 'react'

const RATINGS_STORAGE_KEY = 'elite_product_ratings'
const RATING_CHANGE_EVENT = 'elite-product-rating-change'

function readRatings() {
  if (typeof window === 'undefined') return {}
  try {
    const ratings = JSON.parse(localStorage.getItem(RATINGS_STORAGE_KEY) ?? '{}')
    return ratings && typeof ratings === 'object' ? ratings : {}
  } catch {
    return {}
  }
}

function parseReviewCount(value) {
  if (typeof value === 'string' && value.toLowerCase().endsWith('k')) {
    return Math.round(Number.parseFloat(value) * 1000) || 0
  }
  return Number.parseInt(value, 10) || 0
}

function getRatingSummary(product, productId) {
  const ratings = readRatings()
  const baseRating = Math.max(0, Math.min(5, Number(product.rating) || 0))
  const baseCount = parseReviewCount(product.reviewCount) || (baseRating > 0 ? 100 : 0)
  const userRating = Number(ratings[productId]) || 0
  const reviewCount = baseCount + Number(userRating > 0)
  const average = reviewCount === 0 ? 0 : ((baseRating * baseCount) + userRating) / reviewCount

  return { average, reviewCount, userRating }
}

export function formatReviewCount(count) {
  if (count >= 1000) return `${Number((count / 1000).toFixed(1))}k`
  return String(count)
}

export function useProductRating(product) {
  const productId = String(product.id ?? product.slug ?? product.name)
  const baseRating = Number(product.rating) || 0
  const baseReviewCount = product.reviewCount
  const ratingProduct = { rating: baseRating, reviewCount: baseReviewCount }
  const [summary, setSummary] = useState(() => getRatingSummary(ratingProduct, productId))

  useEffect(() => {
    const syncRating = () => setSummary(getRatingSummary(ratingProduct, productId))
    window.addEventListener(RATING_CHANGE_EVENT, syncRating)
    window.addEventListener('storage', syncRating)
    syncRating()

    return () => {
      window.removeEventListener(RATING_CHANGE_EVENT, syncRating)
      window.removeEventListener('storage', syncRating)
    }
  }, [productId, baseRating, baseReviewCount])

  const rateProduct = (value) => {
    const rating = Math.max(1, Math.min(5, Math.round(Number(value))))
    const ratings = readRatings()
    ratings[productId] = rating
    localStorage.setItem(RATINGS_STORAGE_KEY, JSON.stringify(ratings))
    setSummary(getRatingSummary(ratingProduct, productId))
    window.dispatchEvent(new Event(RATING_CHANGE_EVENT))
  }

  return { ...summary, rateProduct }
}