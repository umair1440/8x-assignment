import { baseApi } from './baseApi'

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ page, limit, category, sort, query } = {}) => {
        const params = new URLSearchParams()

        if (page) params.set('page', String(page))
        if (limit) params.set('limit', String(limit))
        if (category) params.set('category', category)
        if (sort) params.set('sort', sort)
        if (query) params.set('q', query)

        return `/products${params.toString() ? `?${params.toString()}` : ''}`
      },
      providesTags: ['Product'],
    }),
    getProduct: builder.query({
      query: (slug) => `/products/${slug}`,
      providesTags: (_result, _error, slug) => [{ type: 'Product', id: slug }],
    }),
    getCategories: builder.query({
      query: () => '/products/categories',
      providesTags: ['Product'],
    }),
  }),
})

export const { useGetProductsQuery, useGetProductQuery, useGetCategoriesQuery } = productsApi
