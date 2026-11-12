// Centraliza a identificação das plantas pelos CNPJs-base.
export interface Planta {
  codigo: string;
  nome: string;
  cnpjBase: string;
}

export const PLANTAS: Planta[] = [
  {
    codigo: 'BR10',
    nome: 'Aços Longos',
    cnpjBase: '07358761',
  },
  {
    codigo: 'BR12',
    nome: 'Açominas',
    cnpjBase: '17227422',
  },
  {
    codigo: 'BR14',
    nome: 'Gerdau S.A.',
    cnpjBase: '33611500',
  },
];

export const PLANTAS_POR_CODIGO = {
  BR10: 'Aços Longos',
  BR12: 'Açominas',
  BR14: 'Gerdau S.A.',
} as const;