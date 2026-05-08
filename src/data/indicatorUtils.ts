import type { Indicator, Paciente, ClassificacaoConceito } from "../../types";
import { calcularPontuacao } from "./patientQuestions";

function classificar(valor: number): ClassificacaoConceito {
  if (valor >= 90) return "Ótimo";
  if (valor >= 70) return "Bom";
  if (valor >= 50) return "Suficiente";
  return "Regular";
}

function notaDoConceito(c: ClassificacaoConceito): number {
  return c === "Ótimo" ? 1 : c === "Bom" ? 0.75 : c === "Suficiente" ? 0.5 : 0.25;
}

export function enriquecerIndicadores(
  indicators: Indicator[],
  pacientes: Paciente[]
): Indicator[] {
  return indicators.map((ind) => {
    const pacientesInd = pacientes.filter((p) => p.indicadorId === ind.id);

    if (pacientesInd.length === 0) {
      return { ...ind, pacientesCount: 0 };
    }

    const scores = pacientesInd.map((p) => calcularPontuacao(ind.id, p.respostas));
    const media = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const conceitoAtual = classificar(media);
    const nota = notaDoConceito(conceitoAtual);
    const notaFinal = parseFloat((nota * ind.peso).toFixed(2));

    // Build a month-by-month trend from registration dates (up to 6 points)
    const ordenados = [...pacientesInd].sort(
      (a, b) => new Date(a.dataCadastro).getTime() - new Date(b.dataCadastro).getTime()
    );
    const mesLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
    const historicoGerado = mesLabels.slice(0, Math.max(2, Math.min(6, ordenados.length + 1))).map(
      (mes, i) => {
        const slice = ordenados.slice(0, i + 1);
        if (slice.length === 0) return { mes, valor: 0 };
        const avg = Math.round(
          slice.map((p) => calcularPontuacao(ind.id, p.respostas)).reduce((a, b) => a + b, 0) /
            slice.length
        );
        return { mes, valor: avg };
      }
    );

    const tendencia: Indicator["tendencia"] =
      historicoGerado.length >= 2
        ? historicoGerado[historicoGerado.length - 1].valor >
          historicoGerado[historicoGerado.length - 2].valor
          ? "subindo"
          : historicoGerado[historicoGerado.length - 1].valor <
            historicoGerado[historicoGerado.length - 2].valor
          ? "descendo"
          : "estavel"
        : "estavel";

    return {
      ...ind,
      valor_atual: media,
      conceito_atual: conceitoAtual,
      tendencia,
      historico: historicoGerado,
      pacientesCount: pacientesInd.length,
      quadrimestres: [
        {
          ...ind.quadrimestres[0],
          resultado: media,
          conceito: conceitoAtual,
          nota,
          notaFinal,
        },
      ],
    };
  });
}

export function pacientesDoIndicador(pacientes: Paciente[], indicadorId: string): Paciente[] {
  return pacientes.filter((p) => p.indicadorId === indicadorId);
}
