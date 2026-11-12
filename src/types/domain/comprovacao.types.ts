// Tipos para Comprovação de Insumo e Comprovação de Produto.
import type {
  IdentificacaoDrawback,
  Quantidade,
  StatusControle,
} from './common.types';

export interface ComprovacaoInsumo extends IdentificacaoDrawback {
  item: string;
  ncm: string;
  quantidadeImportada: Quantidade;
  quantidadeComprovada: Quantidade;
  quantidadePendente: Quantidade;
  status: StatusControle;
}

export interface ComprovacaoProduto extends IdentificacaoDrawback {
  due: string;
  itemAtoConcessorio: string;
  ncm: string;
  quantidadeExportada: Quantidade;
  quantidadeComprovada: Quantidade;
  quantidadePendente: Quantidade;
  status: StatusControle;
}