
const PROJECT_ID = 'warehouse-pibernat';
const DATASET_ID = 'Sesiom_Drawback_Novo';

export const BIGQUERY_CONFIG = {
  projectId: PROJECT_ID,
  datasetId: DATASET_ID,

  tables: {
    resumoImportacao: 'powerbi_pbt_drawback_resumo_imp',
    resumoExportacao: 'powerbi_pbt_drawback_resumo_exp',
    drawback: 'powerbi_pbt_drawback',
    processosImportacao: 'powerbi_pbt_drawback_proc_imp',
    notasFiscais: 'powerbi_pbt_drawback_nf',
    importacao: 'powerbi_pbt_drawback_imp',
  },
} as const;
