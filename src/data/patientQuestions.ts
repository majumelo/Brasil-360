import type { Pergunta } from "../../types";

export const perguntasPorIndicador: Record<string, Pergunta[]> = {
  "1": [
    { id: "1_consulta", texto: "Realizou consulta programada nos últimos 6 meses?" },
    { id: "1_retorno", texto: "Possui retorno agendado na UBS?" },
    { id: "1_cadastro", texto: "Cadastro ativo e atualizado na equipe?" },
    { id: "1_demanda", texto: "Demanda espontânea foi acolhida quando necessário?" },
  ],
  "2": [
    { id: "2_vacina", texto: "Cartão de vacinação em dia conforme calendário infantil?" },
    { id: "2_pezinho", texto: "Triagem neonatal (pezinho, olhinho, orelhinha) realizada?" },
    { id: "2_puericultura", texto: "Consultas de puericultura em dia conforme faixa etária?" },
    { id: "2_antropometria", texto: "Peso e altura aferidos e registrados na última consulta?" },
    { id: "2_desenvolvimento", texto: "Avaliação do desenvolvimento neuropsicomotor realizada?" },
  ],
  "3": [
    { id: "3_captacao", texto: "Pré-natal iniciado no 1º trimestre de gestação?" },
    { id: "3_consultas", texto: "Mínimo de 6 consultas de pré-natal realizadas?" },
    { id: "3_exames", texto: "Exames básicos do pré-natal realizados (hemograma, glicemia, VDRL, HIV)?" },
    { id: "3_puerperal", texto: "Consulta puerperal realizada nos primeiros 42 dias pós-parto?" },
    { id: "3_odonto", texto: "Consulta odontológica durante a gestação realizada?" },
  ],
  "4": [
    { id: "4_hba1c", texto: "Hemoglobina glicada (HbA1c) solicitada nos últimos 6 meses?" },
    { id: "4_pes", texto: "Exame dos pés (avaliação sensorial e vascular) realizado?" },
    { id: "4_consulta", texto: "Consulta de acompanhamento realizada nos últimos 6 meses?" },
    { id: "4_medicacao", texto: "Medicação em uso regular conforme prescrição?" },
    { id: "4_pa", texto: "Pressão arterial aferida e registrada?" },
  ],
  "5": [
    { id: "5_pa", texto: "Pressão arterial aferida e registrada nos últimos 6 meses?" },
    { id: "5_retorno", texto: "Consulta de retorno agendada e realizada?" },
    { id: "5_medicacao", texto: "Medicação anti-hipertensiva em uso regular?" },
    { id: "5_exames", texto: "Exames laboratoriais de controle realizados (creatinina, potássio, EAS)?" },
    { id: "5_risco", texto: "Estratificação de risco cardiovascular realizada?" },
  ],
  "6": [
    { id: "6_influenza", texto: "Vacinação contra influenza em dia?" },
    { id: "6_avaliacao", texto: "Avaliação multidimensional do idoso realizada?" },
    { id: "6_consulta", texto: "Consulta periódica realizada nos últimos 6 meses?" },
    { id: "6_quedas", texto: "Rastreamento de risco de quedas realizado?" },
    { id: "6_cognitivo", texto: "Avaliação cognitiva (memória, orientação) realizada?" },
  ],
  "7": [
    { id: "7_papanicolau", texto: "Citopatológico (Papanicolau) em dia? (mulheres 25–64 anos)" },
    { id: "7_mamografia", texto: "Mamografia em dia? (mulheres 50–69 anos)" },
    { id: "7_orientacao", texto: "Orientação sobre fatores de risco para câncer realizada?" },
    { id: "7_colorretal", texto: "Rastreamento de câncer colorretal realizado? (50+ anos)" },
  ],
};

export function calcularPontuacao(indicadorId: string, respostas: Record<string, boolean>): number {
  const perguntas = perguntasPorIndicador[indicadorId] ?? [];
  if (perguntas.length === 0) return 0;
  const sim = perguntas.filter((p) => respostas[p.id]).length;
  return Math.round((sim / perguntas.length) * 100);
}

export function conceito(score: number): { texto: string; cor: string; bg: string } {
  if (score >= 90) return { texto: "Ótimo", cor: "#0d9488", bg: "#ccfbf1" };
  if (score >= 70) return { texto: "Bom", cor: "#2563eb", bg: "#dbeafe" };
  if (score >= 50) return { texto: "Suficiente", cor: "#d97706", bg: "#fef3c7" };
  return { texto: "Regular", cor: "#dc2626", bg: "#fee2e2" };
}

export function formatarCpf(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}
