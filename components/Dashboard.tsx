import type { Indicator } from "../types";
import IndicatorCard from "./IndicatorCard";
import ScoreGauge from "./ScoreGauge";

interface DashboardProps {
  indicators: Indicator[];
  onSelectIndicator: (ind: Indicator) => void;
}

function getConceito(valor: number) {
  if (valor >= 90) return { label: "Ótimo", color: "#10b981", bg: "#d1fae5" };
  if (valor >= 70) return { label: "Bom", color: "#0d9488", bg: "#ccfbf1" };
  if (valor >= 50) return { label: "Suficiente", color: "#f59e0b", bg: "#fef3c7" };
  return { label: "Regular", color: "#ef4444", bg: "#fee2e2" };
}

function calcNotaFinal(indicators: Indicator[]) {
  return indicators.reduce((sum, ind) => sum + ind.quadrimestres[0].notaFinal, 0);
}

export default function Dashboard({ indicators, onSelectIndicator }: DashboardProps) {
  const notaFinal = calcNotaFinal(indicators);
  const maxNota = indicators.reduce((sum, ind) => sum + ind.peso, 0);
  const percentual = (notaFinal / maxNota) * 100;
  const conceito = getConceito(percentual);

  const otimos = indicators.filter((i) => i.conceito_atual === "Ótimo").length;
  const bons = indicators.filter((i) => i.conceito_atual === "Bom").length;
  const suficientes = indicators.filter((i) => i.conceito_atual === "Suficiente").length;
  const regulares = indicators.filter((i) => i.conceito_atual === "Regular").length;

  return (
    <div className="dashboard">
      {/* Summary Row */}
      <div className="summary-row">
        <div className="summary-score-card">
          <div className="score-left">
            <div className="score-label">Nota Final do Quadrimestre</div>
            <div className="score-number">{notaFinal.toFixed(2)}</div>
            <div className="score-max">de {maxNota} pontos possíveis</div>
            <div
              className="score-conceito-badge"
              style={{ backgroundColor: conceito.bg, color: conceito.color }}
            >
              {conceito.label}
            </div>
          </div>
          <div className="score-right">
            <ScoreGauge value={percentual} color={conceito.color} />
          </div>
        </div>

        <div className="summary-stats">
          <div className="stat-item" style={{ "--accent": "#10b981" } as React.CSSProperties}>
            <div className="stat-value">{otimos}</div>
            <div className="stat-label">Ótimo</div>
            <div className="stat-bar" style={{ width: `${(otimos / 7) * 100}%`, background: "#10b981" }} />
          </div>
          <div className="stat-item" style={{ "--accent": "#0d9488" } as React.CSSProperties}>
            <div className="stat-value">{bons}</div>
            <div className="stat-label">Bom</div>
            <div className="stat-bar" style={{ width: `${(bons / 7) * 100}%`, background: "#0d9488" }} />
          </div>
          <div className="stat-item" style={{ "--accent": "#f59e0b" } as React.CSSProperties}>
            <div className="stat-value">{suficientes}</div>
            <div className="stat-label">Suficiente</div>
            <div className="stat-bar" style={{ width: `${(suficientes / 7) * 100}%`, background: "#f59e0b" }} />
          </div>
          <div className="stat-item" style={{ "--accent": "#ef4444" } as React.CSSProperties}>
            <div className="stat-value">{regulares}</div>
            <div className="stat-label">Regular</div>
            <div className="stat-bar" style={{ width: `${(regulares / 7) * 100}%`, background: "#ef4444" }} />
          </div>
        </div>

        <div className="summary-meta-card">
          <div className="meta-title">Informações da Equipe</div>
          <div className="meta-item">
            <span className="meta-key">Tipo</span>
            <span className="meta-val">eSF / eAP</span>
          </div>
          <div className="meta-item">
            <span className="meta-key">Período</span>
            <span className="meta-val">Jan – Abr 2025</span>
          </div>
          <div className="meta-item">
            <span className="meta-key">Fonte</span>
            <span className="meta-val">SISAB / SIAPS</span>
          </div>
          <div className="meta-item">
            <span className="meta-key">Indicadores</span>
            <span className="meta-val">7 / 7 avaliados</span>
          </div>
          <div className="progress-bar-wrap">
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${percentual}%`, background: conceito.color }}
              />
            </div>
            <span className="progress-label">{percentual.toFixed(0)}% do máximo</span>
          </div>
        </div>
      </div>

      {/* Section title */}
      <div className="section-header">
        <h2 className="section-title">Indicadores eSF / eAP</h2>
        <span className="section-subtitle">1º Quadrimestre · 2025 · Clique para detalhar</span>
      </div>

      {/* Indicators Grid */}
      <div className="indicators-grid">
        {indicators.map((ind) => (
          <IndicatorCard
            key={ind.id}
            indicator={ind}
            onClick={() => onSelectIndicator(ind)}
          />
        ))}
      </div>
    </div>
  );
}
