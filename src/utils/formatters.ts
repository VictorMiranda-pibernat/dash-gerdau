
export const moeda = (valor: number | null): string => {
  if (valor === null) return '—'

  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export const dataBR = (data: string): string => {
  if (!data) return '—'

  return new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR')
}
