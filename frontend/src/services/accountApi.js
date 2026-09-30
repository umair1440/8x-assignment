import { baseApi } from './baseApi'

export const accountApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => '/account/profile',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (body) => ({
        url: '/account/profile',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    getAddresses: builder.query({
      query: () => '/account/addresses',
      providesTags: ['Address'],
    }),
    addAddress: builder.mutation({
      query: (body) => ({
        url: '/account/addresses',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Address'],
    }),
    updateAddress: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/account/addresses/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Address'],
    }),
    deleteAddress: builder.mutation({
      query: (id) => ({
        url: `/account/addresses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Address'],
    }),
    getPayments: builder.query({
      query: () => '/account/payments',
      providesTags: ['Payment'],
    }),
    addPayment: builder.mutation({
      query: (body) => ({
        url: '/account/payments',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Payment'],
    }),
    deletePayment: builder.mutation({
      query: (id) => ({
        url: `/account/payments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Payment'],
    }),
  }),
})

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useGetPaymentsQuery,
  useAddPaymentMutation,
  useDeletePaymentMutation,
} = accountApi
