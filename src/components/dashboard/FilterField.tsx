
import type { ReactNode } from 'react'

type FilterFieldProps = {
  label: string
  children: ReactNode
  className?: string
}

function FilterField({ label, children, className = '' }: FilterFieldProps) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</label>
      {children}
    </div>
  )
}

export default FilterField
