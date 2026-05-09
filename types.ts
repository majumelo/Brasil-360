export type ClassificacaoConceito = "Regular" | "Suficiente" | "Bom" | "Ótimo";

export interface Pergunta {
  id: string;
  texto: string;
}

export interface UBS {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
  ine: string;
}

export interface Paciente {
  id: string;
  cpf: string;
  nome: string;
  indicadorId: string;
  ubsId: string;
  respostas: Record<string, boolean>;
  dataCadastro: string;
}


export interface MonthData {
  mes: string;
  valor: number;
}
 
export interface QuadrimestralData {
  quadrimestre: string;
  meses: MonthData[];
  resultado: number;
  conceito: ClassificacaoConceito;
  nota: number;
  peso: number;
  notaFinal: number;
}
 
export interface Indicator {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  meta: string;
  fonte: string;
  peso: number;
  categoria: string;
  icone: string;
  valor_atual: number;
  conceito_atual: ClassificacaoConceito;
  historico: MonthData[];
  quadrimestres: QuadrimestralData[];
  tendencia: "subindo" | "descendo" | "estavel";
  cor_acento: string;
  pacientesCount?: number;
}
