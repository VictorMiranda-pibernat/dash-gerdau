// Tipos relacionados ao Controle de Ganhos e Ganhos Mensais.
import type {
  OrigemAquisicao,
  ValorMonetario,
} from './common.types';

export type TipoGanho = 'Saving' | 'Cash' | 'ICMS';

export interface ComposicaoGanho {
  impostoImportacao: ValorMonetario;
  afrmm: ValorMonetario;
  ipi: ValorMonetario;
  pis: ValorMonetario;
  cofins: ValorMonetario;
}

export interface ResumoGanhos {
  saving: ValorMonetario;
  cash: ValorMonetario;
  icms: ValorMonetario;
  composicao: ComposicaoGanho;
}

export interface GanhoMensal {
  ano: number;
  mes: number;
  origem: OrigemAquisicao;
  saving: ValorMonetario;
  cash: ValorMonetario;
  icms: ValorMonetario;
}