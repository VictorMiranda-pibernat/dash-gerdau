// Tipos para Aditivos, Controle Cambial e Vencimentos.
import type {
  DataISO,
  IdentificacaoDrawback,
  StatusControle,
} from './common.types';

export interface ControleAditivo extends IdentificacaoDrawback {
  numeroAditivo: string;
  dataSolicitacao: DataISO | null;
  dataAprovacao: DataISO | null;
  status: StatusControle;
}

export interface ControleCambial extends IdentificacaoDrawback {
  referencia: string;
  dataRegistro: DataISO | null;
  indiceCambial: number | null;
}

export interface ControleVencimento extends IdentificacaoDrawback {
  dataAbertura: DataISO | null;
  dataVencimento: DataISO;
  diasRestantes: number;
  status: StatusControle;
}