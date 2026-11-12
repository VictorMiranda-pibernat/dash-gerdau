// Tipos compartilhados pelo projeto.
export type DataISO = string;

export type ValorMonetario = number;

export type Quantidade = number;

export type OrigemAquisicao = 'Importação' | 'Mercado Nacional';

export type ModalidadeDrawback = 'Isenção';

export type StatusControle =
  | 'Regular'
  | 'Atenção'
  | 'Crítico'
  | 'Pendente'
  | 'Concluído';

export interface Periodo {
  dataInicio: DataISO;
  dataFim: DataISO;
}

export interface IdentificacaoDrawback {
  numeroDrawback: string;
  cliente: string;
  clienteCnpj: string;
}