import { useState } from "react";
import { indicators } from "../../src/data/indicators";
import {
  perguntasPorIndicador,
  calcularPontuacao,
  conceito,
  formatarCpf,
} from "../../src/data/patientQuestions";
import type { Paciente, UBS } from "../../types";
import "./Relatorios.css";

interface RelatoriosPageProps {
  pacientes: Paciente[];
  ubsAtual: UBS;
  onSalvar: (p: Paciente) => void;
  onExcluir: (id: string) => void;
}

type Painel = { tipo: "novo" } | { tipo: "detalhe"; paciente: Paciente } | null;

export default function RelatoriosPage({ pacientes,
  ubsAtual,
  onSalvar,
  onExcluir,
}: RelatoriosPageProps)
{
  const [painel, setPainel] = useState<Painel>(null);
  const [cpf, setCpf] = useState("");
  const [nome, setNome] = useState("");
  const [indicadorId, setIndicadorId] = useState("");
  const [respostas, setRespostas] = useState<Record<string, boolean>>({});
  const [busca, setBusca] = useState("");

  function abrirNovo() {
    setCpf("");
    setNome("");
    setIndicadorId("");
    setRespostas({});
    setPainel({ tipo: "novo" });
  }

  function abrirDetalhe(p: Paciente) {
    setCpf(p.cpf);
    setNome(p.nome);
    setIndicadorId(p.indicadorId);
    setRespostas({ ...p.respostas });
    setPainel({ tipo: "detalhe", paciente: p });
  }

  function fecharPainel() {
    setPainel(null);
  }

  function handleIndicadorChange(id: string) {
    setIndicadorId(id);
    setRespostas({});
  }

  function toggleResposta(perguntaId: string) {
    setRespostas((prev) => ({ ...prev, [perguntaId]: !prev[perguntaId] }));
  }

  function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    const cpfLimpo = cpf.replace(/\D/g, "");
    if (cpfLimpo.length < 11) return;
    if (!nome.trim() || !indicadorId) return;

    const id = painel?.tipo === "detalhe" ? painel.paciente.id : crypto.randomUUID();
    onSalvar({
      id,
      cpf: cpf,
      nome: nome.trim(),
      indicadorId,
      ubsId: ubsAtual.id,
      respostas,
      dataCadastro: painel?.tipo === "detalhe" ? painel.paciente.dataCadastro : new Date().toISOString(),
    });
    fecharPainel();
  }

  function handleExcluir(id: string) {
    if (confirm("Excluir este paciente?")) {
      onExcluir(id);
      fecharPainel();
    }
  }

  const perguntas = indicadorId ? (perguntasPorIndicador[indicadorId] ?? []) : [];
  const scoreAtual = indicadorId ? calcularPontuacao(indicadorId, respostas) : 0;
  const conceitoAtual = conceito(scoreAtual);

  const pacientesFiltrados = pacientes.filter(
    (p) =>
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.cpf.includes(busca)
  );

  const indicadorSelecionado = indicators.find((i) => i.id === indicadorId);
  const modoEdicao = painel?.tipo === "detalhe";

  return (
    <div className="rel-shell">
      {/* Painel esquerdo — lista */}
      <div className="rel-sidebar">
        <div className="rel-sidebar-header">
          <div>
            <div className="rel-sidebar-title">Pacientes</div>
            <div className="rel-sidebar-count">{pacientes.length} cadastrado{pacientes.length !== 1 ? "s" : ""}</div>
          </div>
          <button className="rel-add-btn" onClick={abrirNovo} title="Novo paciente">+</button>
        </div>

        <input
          className="rel-busca"
          type="text"
          placeholder="Buscar por nome ou CPF…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />

        <div className="rel-lista">
          {pacientesFiltrados.length === 0 && (
            <div className="rel-lista-vazia">
              {pacientes.length === 0
                ? "Nenhum paciente cadastrado ainda."
                : "Nenhum resultado para a busca."}
            </div>
          )}
          {pacientesFiltrados.map((p) => {
            const score = calcularPontuacao(p.indicadorId, p.respostas);
            const c = conceito(score);
            const ind = indicators.find((i) => i.id === p.indicadorId);
            const ativo = painel?.tipo === "detalhe" && painel.paciente.id === p.id;
            return (
              <button
                key={p.id}
                className={`rel-paciente-item ${ativo ? "ativo" : ""}`}
                onClick={() => abrirDetalhe(p)}
              >
                <div className="rel-paciente-avatar">
                  {p.nome.charAt(0).toUpperCase()}
                </div>
                <div className="rel-paciente-info">
                  <div className="rel-paciente-nome">{p.nome}</div>
                  <div className="rel-paciente-meta">
                    <span className="rel-ind-badge" style={{ background: ind?.cor_acento + "22", color: ind?.cor_acento }}>
                      {ind?.codigo}
                    </span>
                    <span className="rel-paciente-cpf">{p.cpf}</span>
                  </div>
                </div>
                <div className="rel-paciente-score">
                  <div className="rel-score-num" style={{ color: c.cor }}>{score}%</div>
                  <div
                    className="rel-conceito-mini"
                    style={{ background: c.bg, color: c.cor }}
                  >
                    {c.texto}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Painel direito — formulário / detalhe */}
      {painel === null ? (
        <div className="rel-main rel-main-empty">
          <div className="rel-empty-icon">📋</div>
          <div className="rel-empty-title">Selecione ou cadastre um paciente</div>
          <div className="rel-empty-sub">Clique em "+" para registrar um novo paciente ou escolha um da lista.</div>
          <button className="rel-empty-btn" onClick={abrirNovo}>+ Novo Paciente</button>
        </div>
      ) : (
        <div className="rel-main">
          <div className="rel-form-header">
            <div>
              <div className="rel-form-title">
                {modoEdicao ? "Detalhes do Paciente" : "Novo Paciente"}
              </div>
              <div className="rel-form-sub">
                {modoEdicao ? "Edite as informações e marque os critérios" : "Preencha os dados e marque os critérios atendidos"}
              </div>
            </div>
            <button className="rel-fechar-btn" onClick={fecharPainel}>✕</button>
          </div>

          <form className="rel-form" onSubmit={handleSalvar}>
            {/* Dados básicos */}
            <div className="rel-section-label">Dados do Paciente</div>

            <div className="rel-form-row">
              <div className="rel-field">
                <label className="rel-label">CPF</label>
                <input
                  className="rel-input"
                  type="text"
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(formatarCpf(e.target.value))}
                  maxLength={14}
                  required
                />
              </div>
              <div className="rel-field rel-field-wide">
                <label className="rel-label">Nome completo</label>
                <input
                  className="rel-input"
                  type="text"
                  placeholder="Nome do paciente"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="rel-field">
              <label className="rel-label">Indicador de saúde</label>
              <select
                className="rel-select"
                value={indicadorId}
                onChange={(e) => handleIndicadorChange(e.target.value)}
                required
              >
                <option value="">Selecione o indicador…</option>
                {indicators.map((ind) => (
                  <option key={ind.id} value={ind.id}>
                    {ind.icone} {ind.codigo} — {ind.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Perguntas por indicador */}
            {perguntas.length > 0 && (
              <>
                <div className="rel-section-divider" />
                <div className="rel-section-label">
                  Critérios — {indicadorSelecionado?.nome}
                </div>
                <div className="rel-perguntas">
                  {perguntas.map((p) => (
                    <label key={p.id} className="rel-pergunta">
                      <input
                        type="checkbox"
                        className="rel-checkbox"
                        checked={!!respostas[p.id]}
                        onChange={() => toggleResposta(p.id)}
                      />
                      <span className="rel-pergunta-texto">{p.texto}</span>
                    </label>
                  ))}
                </div>

                {/* Score em tempo real */}
                <div className="rel-score-card">
                  <div className="rel-score-top">
                    <div>
                      <div className="rel-score-label">Pontuação do paciente</div>
                      <div className="rel-score-desc">
                        {Object.values(respostas).filter(Boolean).length} de {perguntas.length} critérios atendidos
                      </div>
                    </div>
                    <div>
                      <div className="rel-score-big" style={{ color: conceitoAtual.cor }}>
                        {scoreAtual}%
                      </div>
                      <div
                        className="rel-conceito-badge"
                        style={{ background: conceitoAtual.bg, color: conceitoAtual.cor }}
                      >
                        {conceitoAtual.texto}
                      </div>
                    </div>
                  </div>
                  <div className="rel-score-track">
                    <div
                      className="rel-score-fill"
                      style={{ width: `${scoreAtual}%`, background: conceitoAtual.cor }}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="rel-form-actions">
              {modoEdicao && (
                <button
                  type="button"
                  className="rel-excluir-btn"
                  onClick={() => handleExcluir((painel as { tipo: "detalhe"; paciente: Paciente }).paciente.id)}
                >
                  Excluir
                </button>
              )}
              <button type="submit" className="rel-salvar-btn" disabled={!indicadorId}>
                {modoEdicao ? "Salvar alterações" : "Cadastrar Paciente"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
