const DATASET = 'warehouse-pibernat.Sesiom_Drawback_Novo';

export const BIGQUERY_CONFIG = {
  dataset: DATASET,

  tables: {
    resumoImportacao: 'powerbi_pbt_drawback_resumo_imp',
    resumoExportacao: 'powerbi_pbt_drawback_resumo_exp',
    drawback: 'powerbi_pbt_drawback',
    processosImportacao: 'powerbi_pbt_drawback_proc_imp',
    notasFiscais: 'powerbi_pbt_drawback_nf',
    importacao: 'powerbi_pbt_drawback',
  },
} as const;