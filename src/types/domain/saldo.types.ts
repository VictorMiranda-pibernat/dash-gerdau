// Tipos para o Controle de Saldo.
import type {
  IdentificacaoDrawback,
  Quantidade,
  ValorMonetario,
} from './common.types';

export interface SaldoDrawback extends IdentificacaoDrawback {
  item: string;
  ncm: string;
  quantidadeAutorizada: Quantidade;
  quantidadeUtilizada: Quantidade;
  quantidadeDisponivel: Quantidade;
  valorAutorizado: ValorMonetario;
  valorUtilizado: ValorMonetario;
  valorDisponivel: ValorMonetario;
}