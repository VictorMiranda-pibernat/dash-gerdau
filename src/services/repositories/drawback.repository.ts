
import type {
  DrawbackResumoImpRow,
  DrawbackResumoExpRow,
  DrawbackRow,
  DrawbackProcImpRow,
  DrawbackNfRow,
  DrawbackImpRow,
} from '../../types/bigquery';

export interface DrawbackRepository {
  getResumoImportacao(): Promise<DrawbackResumoImpRow[]>;

  getResumoExportacao(): Promise<DrawbackResumoExpRow[]>;

  getDrawbacks(): Promise<DrawbackRow[]>;

  getProcessosImportacao(): Promise<DrawbackProcImpRow[]>;

  getNotasFiscais(): Promise<DrawbackNfRow[]>;

  getImportacoes(): Promise<DrawbackImpRow[]>;
}
