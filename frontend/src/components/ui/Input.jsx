import { forwardRef } from 'react'
import { cn } from '../../lib/cn'

const Input = forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200',
        className,
      )}
      {...props}
    />
  )
})

export default Input
