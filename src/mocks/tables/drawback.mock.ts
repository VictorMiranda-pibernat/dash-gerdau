
import type { DrawbackRow } from '../../types/bigquery';

export const drawbackMock: DrawbackRow[] = [
  {
    NUMERO_DRAWBACK: 'DBK-2026-001',
    CLIENTE: 'Gerdau S.A.',
    CLIENTE_CIDADE: 'Porto Alegre',
    CLIENTE_CNPJ: '33611500000100',
    MODALIDADE: 'Isenção',
    DATA_ABERTURA: '2026-01-15',
    DATA_VENCIMENTO: '2027-01-15',
    PROCEDENCIA: 'Importação',
    NRO_ITEM: '001',
    QUANTIDADE: 100000,
    VALOR: 250000,
    NCM_CODIGO: '72083990',
    NOME_COMERCIAL: 'Bobina de aço',
    UNID_ESTAT: 'KG',
    SITUACAO: 'Ativo',
  },
  {
    NUMERO_DRAWBACK: 'DBK-2026-002',
    CLIENTE: 'Aços Longos',
    CLIENTE_CIDADE: 'São Paulo',
    CLIENTE_CNPJ: '07358761000100',
    MODALIDADE: 'Isenção',
    DATA_ABERTURA: '2026-03-10',
    DATA_VENCIMENTO: '2027-03-10',
    PROCEDENCIA: 'Mercado Nacional',
    NRO_ITEM: '002',
    QUANTIDADE: 75000,
    VALOR: 180000,
    NCM_CODIGO: '72142000',
    NOME_COMERCIAL: 'Vergalhão de aço',
    UNID_ESTAT: 'KG',
    SITUACAO: 'Ativo',
  },
];
