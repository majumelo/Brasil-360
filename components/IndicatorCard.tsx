import type { Indicator, ClassificacaoConceito } from "../types";

interface IndicatorCardProps {
  indicator: Indicator;
  onClick: () => void;
}

const conceitoConfig: Record<ClassificacaoConceito, { color: string; bg: string; border: string }> = {
  Ótimo: { color: "#059669", bg: "#ecfdf5", border: "#6ee7b7" },
  Bom: { color: "#0d9488", bg: "#f0fdfa", border: "#99f6e4" },
  Suficiente: { color: "#d97706", bg: "#fffbeb", border: "#fcd34d" },
  Regular: { color: "#dc2626", bg: "#fef2f2", border: "#fca5a5" },
};

const tendenciaIcon: Record<string, string> = {
  subindo: "↑",
  descendo: "↓",
  estavel: "→",
};

const tendenciaColor: Record<string, string> = {
  subindo: "#10b981",
  descendo: "#ef4444",
  estavel: "#94a3b8",
};

function MiniSparkline({ data, color }: { data: { valor: number }[]; color: string }) {
  const max = Math.max(...data.map((d) => d.valor));
  const min = Math.min(...data.map((d) => d.valor));
  const range = max - min || 1;
  const w = 100;
  const h = 32;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((d.valor - min) / range) * h;
    return `${x},${y}`;
  });

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="sparkline" preserveAspectRatio="none">
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={pts[pts.length - 1].split(",")[0]}
        cy={pts[pts.length - 1].split(",")[1]}
        r="2.5"
        fill={color}
      />
    </svg>
  );
}

export default function IndicatorCard({ indicator, onClick }: IndicatorCardProps) {
  const cfg = conceitoConfig[indicator.conceito_atual];
  const quad = indicator.quadrimestres[0];

  return (
    <button className="indicator-card" onClick={onClick} aria-label={`Ver detalhes: ${indicator.nome}`}>
      {/* Top accent bar */}
      <div className="card-accent-bar" style={{ background: indicator.cor_acento }} />

      <div className="card-header">
        <div className="card-icon-wrap" style={{ background: `${indicator.cor_acento}18` }}>
          <span className="card-icon">{indicator.icone}</span>
        </div>
        <div className="card-code-badge">{indicator.codigo}</div>
      </div>

      <div className="card-name">{indicator.nome}</div>
      <div className="card-categoria">{indicator.categoria}</div>

      {/* Main value */}
      <div className="card-value-row">
        <div className="card-value" style={{ color: cfg.color }}>
          {indicator.valor_atual.toFixed(1)}%
        </div>
        <div className="card-tendencia" style={{ color: tendenciaColor[indicator.tendencia] }}>
          {tendenciaIcon[indicator.tendencia]}
        </div>
      </div>

      {/* Progress bar */}
      <div className="card-progress-track">
        <div
          className="card-progress-fill"
          style={{
            width: `${Math.min(indicator.valor_atual, 100)}%`,
            background: cfg.color,
          }}
        />
      </div>
      <div className="card-meta-row">
        <span className="card-meta-label">Meta: {indicator.meta}</span>
        <span
          className="card-conceito-chip"
          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
        >
          {indicator.conceito_atual}
        </span>
      </div>

      {/* Sparkline */}
      <div className="card-sparkline-wrap">
        <MiniSparkline data={indicator.historico} color={indicator.cor_acento} />
      </div>

      <div className="card-footer">
        <span className="card-peso">Peso {indicator.peso}</span>
        <span className="card-nota-final">Nota: {quad.notaFinal.toFixed(2)}</span>
      </div>

      {(indicator.pacientesCount ?? 0) > 0 && (
        <div className="card-pacientes-badge">
          👥 {indicator.pacientesCount} paciente{indicator.pacientesCount !== 1 ? "s" : ""} · dados reais
        </div>
      )}
    </button>
  );
}
