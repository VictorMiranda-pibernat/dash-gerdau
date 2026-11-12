// Aqui ficam as regras de cálculo já validadas.
export const CALCULOS_CONFIG = {
  saving: {
    importacao: ['II', 'AFRMM'],
    mercadoNacional: ['II'],
  },

  cash: ['IPI', 'PIS', 'COFINS'],

  icms: {
    separadoDosDemaisIndicadores: true,
    aliquota: null as number | null,
    formula: 'ICMS_SEM_DRAWBACK - ICMS_COM_DRAWBACK',
    produtosSemGanho: ['ANTRACITA'],
  },

  afrmm: {
    aliquota: 0.08,
    utilizarValorDaViewQuandoDisponivel: true,
  },
} as const;