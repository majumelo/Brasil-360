import type { Indicator, Paciente, ClassificacaoConceito } from "../types";
import { calcularPontuacao, conceito, perguntasPorIndicador } from "../src/data/patientQuestions";

interface IndicatorDetailProps {
  indicator: Indicator;
  pacientes: Paciente[];
  onBack: () => void;
  onIrParaRelatorios: () => void;
}

const conceitoConfig: Record<ClassificacaoConceito, { color: string; bg: string }> = {
  Ótimo: { color: "#059669", bg: "#ecfdf5" },
  Bom: { color: "#0d9488", bg: "#f0fdfa" },
  Suficiente: { color: "#d97706", bg: "#fffbeb" },
  Regular: { color: "#dc2626", bg: "#fef2f2" },
};

function BarChart({ data, color }: { data: { mes: string; valor: number }[]; color: string }) {
  const max = Math.max(...data.map((d) => d.valor), 100);
  return (
    <div className="bar-chart">
      {data.map((d) => (
        <div key={d.mes} className="bar-col">
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ height: `${(d.valor / max) * 100}%`, background: color }}
            />
          </div>
          <div className="bar-label">{d.mes}</div>
          <div className="bar-value">{d.valor}%</div>
        </div>
      ))}
    </div>
  );
}

export default function IndicatorDetail({ indicator, pacientes, onBack, onIrParaRelatorios }: IndicatorDetailProps) {
  const quad = indicator.quadrimestres[0];
  const cfg = conceitoConfig[indicator.conceito_atual];
  const perguntas = perguntasPorIndicador[indicator.id] ?? [];
  const temPacientes = pacientes.length > 0;

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={onBack}>← Voltar ao Dashboard</button>

      {/* Hero */}
      <div className="detail-hero" style={{ borderLeftColor: indicator.cor_acento }}>
        <div className="detail-hero-left">
          <div className="detail-icon-lg" style={{ background: `${indicator.cor_acento}20` }}>
            {indicator.icone}
          </div>
          <div>
            <div className="detail-codigo">{indicator.codigo} · {indicator.categoria}</div>
            <h1 className="detail-nome">{indicator.nome}</h1>
            <p className="detail-descricao">{indicator.descricao}</p>
            {temPacientes && (
              <div className="detail-fonte-badge">
                👥 Valor calculado a partir de {pacientes.length} paciente{pacientes.length !== 1 ? "s" : ""} cadastrado{pacientes.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        </div>
        <div className="detail-hero-right">
          <div className="detail-main-value" style={{ color: indicator.cor_acento }}>
            {indicator.valor_atual.toFixed(1)}%
          </div>
          <div className="detail-conceito" style={{ background: cfg.bg, color: cfg.color }}>
            {indicator.conceito_atual}
          </div>
          <div className="detail-meta">Meta: {indicator.meta}</div>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="detail-grid">
        <div className="detail-card">
          <div className="detail-card-title">Resultado do Quadrimestre</div>
          <div className="detail-card-body">
            <div className="detail-quad-table">
              <div className="quad-row quad-header">
                <span>Mês</span><span>Resultado</span>
              </div>
              {quad.meses.map((m) => (
                <div key={m.mes} className="quad-row">
                  <span>{m.mes}</span>
                  <span
                    className="quad-pill"
                    style={{
                      background: m.valor >= 70 ? "#d1fae5" : m.valor >= 50 ? "#fef3c7" : "#fee2e2",
                      color: m.valor >= 70 ? "#059669" : m.valor >= 50 ? "#d97706" : "#dc2626",
                    }}
                  >
                    {m.valor}%
                  </span>
                </div>
              ))}
              <div className="quad-row quad-total">
                <span>Média Quadrimestral</span>
                <span style={{ color: indicator.cor_acento, fontWeight: 700 }}>
                  {quad.resultado.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-card-title">Cálculo da Nota</div>
          <div className="detail-card-body">
            <div className="calc-step">
              <span className="calc-label">Conceito Obtido</span>
              <span className="calc-badge" style={{ background: cfg.bg, color: cfg.color }}>
                {quad.conceito}
              </span>
            </div>
            <div className="calc-step">
              <span className="calc-label">Nota do Conceito</span>
              <span className="calc-value">{quad.nota}</span>
            </div>
            <div className="calc-step">
              <span className="calc-label">Peso do Indicador</span>
              <span className="calc-value">{quad.peso}</span>
            </div>
            <div className="calc-divider" />
            <div className="calc-step calc-final">
              <span className="calc-label">Nota Final</span>
              <span className="calc-value-big" style={{ color: indicator.cor_acento }}>
                {quad.notaFinal.toFixed(2)}
              </span>
            </div>
            <div className="calc-formula">
              ({quad.nota} × {quad.peso} = {quad.notaFinal.toFixed(2)})
            </div>
          </div>
        </div>

        <div className="detail-card detail-card-wide">
          <div className="detail-card-title">Evolução Mensal</div>
          <div className="detail-card-body">
            <BarChart data={indicator.historico} color={indicator.cor_acento} />
          </div>
        </div>

        {/* Pacientes cadastrados */}
        {temPacientes ? (
          <div className="detail-card detail-card-wide">
            <div className="detail-card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Pacientes Cadastrados ({pacientes.length})</span>
              <button className="detail-link-btn" onClick={onIrParaRelatorios}>
                + Gerenciar pacientes →
              </button>
            </div>
            <div className="detail-card-body">
              <div className="detail-pacientes-list">
                {pacientes.map((p) => {
                  const score = calcularPontuacao(indicator.id, p.respostas);
                  const c = conceito(score);
                  return (
                    <div key={p.id} className="detail-paciente-row">
                      <div className="detail-paciente-avatar">{p.nome.charAt(0).toUpperCase()}</div>
                      <div className="detail-paciente-info">
                        <div className="detail-paciente-nome">{p.nome}</div>
                        <div className="detail-paciente-cpf">{p.cpf}</div>
                      </div>
                      <div className="detail-paciente-criterios">
                        {perguntas.map((q) => (
                          <span
                            key={q.id}
                            className="detail-criterio-dot"
                            title={q.texto}
                            style={{ background: p.respostas[q.id] ? c.cor : "#e2e8f0" }}
                          />
                        ))}
                      </div>
                      <div className="detail-paciente-score">
                        <span className="detail-paciente-pct" style={{ color: c.cor }}>{score}%</span>
                        <span
                          className="detail-paciente-conceito"
                          style={{ background: c.bg, color: c.cor }}
                        >
                          {c.texto}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="detail-card detail-card-wide">
            <div className="detail-card-title">Pacientes Cadastrados</div>
            <div className="detail-card-body">
              <div className="detail-sem-pacientes">
                <span>Nenhum paciente cadastrado para este indicador.</span>
                <button className="detail-link-btn" onClick={onIrParaRelatorios}>
                  Cadastrar paciente →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info footer */}
      <div className="detail-info-row">
        <div className="info-chip">📊 Fonte: {indicator.fonte}</div>
        <div className="info-chip">⚖️ Peso: {indicator.peso}</div>
        <div className="info-chip">🎯 Meta: {indicator.meta}</div>
        <div className="info-chip">🏥 Tipo: eSF / eAP</div>
        {temPacientes && (
          <div className="info-chip">👥 {pacientes.length} paciente{pacientes.length !== 1 ? "s" : ""} · dados reais</div>
        )}
      </div>
    </div>
  );
}
