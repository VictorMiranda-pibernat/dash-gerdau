export interface ModuloDashboard {
  id: string;
  titulo: string;
  descricao: string;
  ativo: boolean;
}

export const MODULOS_DASHBOARD: ModuloDashboard[] = [
  {
    id: 'controle-ganhos',
    titulo: 'Controle de Ganhos',
    descricao: 'Acompanhamento dos ganhos relacionados ao Drawback.',
    ativo: true,
  },
  {
    id: 'ganhos-mensais',
    titulo: 'Ganhos Mensais',
    descricao: 'Evolução mensal dos ganhos de importação.',
    ativo: true,
  },
  {
    id: 'ganhos-provisionados',
    titulo: 'Ganhos Provisionados',
    descricao: 'Acompanhamento dos ganhos provisionados.',
    ativo: true,
  },
  {
    id: 'controle-saldo',
    titulo: 'Controle de Saldo',
    descricao: 'Acompanhamento dos saldos dos atos concessórios.',
    ativo: true,
  },
  {
    id: 'comprovacao-insumo',
    titulo: 'Comprovação de Insumo',
    descricao: 'Acompanhamento da comprovação dos insumos.',
    ativo: true,
  },
  {
    id: 'comprovacao-produto',
    titulo: 'Comprovação de Produto',
    descricao: 'Acompanhamento das exportações e comprovações.',
    ativo: true,
  },
  {
    id: 'controle-aditivos',
    titulo: 'Controle de Aditivos',
    descricao: 'Acompanhamento dos aditivos dos atos concessórios.',
    ativo: true,
  },
  {
    id: 'controle-cambial',
    titulo: 'Controle Cambial',
    descricao: 'Acompanhamento dos índices e informações cambiais.',
    ativo: true,
  },
  {
    id: 'controle-vencimentos',
    titulo: 'Controle de Vencimentos',
    descricao: 'Acompanhamento dos prazos dos atos concessórios.',
    ativo: true,
  },
];