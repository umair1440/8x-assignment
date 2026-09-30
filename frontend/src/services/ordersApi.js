import { baseApi } from './baseApi'

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    checkout: builder.mutation({
      query: (body) => ({
        url: '/orders/checkout',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Order', 'Cart'],
    }),
    getOrders: builder.query({
      query: () => '/orders',
      providesTags: ['Order'],
    }),
    getOrder: builder.query({
      query: (id) => `/orders/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Order', id }],
    }),
  }),
})

export const { useCheckoutMutation, useGetOrdersQuery, useGetOrderQuery } = ordersApi
