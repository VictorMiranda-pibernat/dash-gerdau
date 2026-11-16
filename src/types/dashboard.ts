import type { ReactNode } from 'react'

export type SelectOption = {
  label: string
  value: string
}

export type KpiVariant = 'blue' | 'green' | 'amber' | 'red'

export type KpiItem = {
  titulo: string
  valor: string
  descricao?: string
  variante: KpiVariant
}

export type DataTableColumn<T> = {
  key: keyof T
  label: string
  align?: 'left' | 'center' | 'right'
  render?: (value: T[keyof T], row: T) => ReactNode
}