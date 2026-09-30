import { baseApi } from './baseApi'

export const wishlistApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWishlist: builder.query({
      query: () => '/wishlist',
      providesTags: ['Wishlist'],
    }),
    toggleWishlist: builder.mutation({
      query: (productId) => ({
        url: `/wishlist/${productId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Wishlist'],
    }),
  }),
})

export const { useGetWishlistQuery, useToggleWishlistMutation } = wishlistApi
