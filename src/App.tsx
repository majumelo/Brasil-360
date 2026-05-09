import { useState, useMemo, useEffect } from "react";
import Dashboard from "../components/Dashboard";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import IndicatorDetail from "../components/IndicatorDetail";
import LoginPage from "../components/Login/LoginPage";
import RelatoriosPage from "../components/Relatorios/RelatoriosPage";
import { indicators } from "./data/indicators";
import { enriquecerIndicadores, pacientesDoIndicador } from "./data/indicatorUtils";
import type { Indicator, Paciente, UBS } from "../types";
import { ubsMock } from "./data/ubs";

const STORAGE_KEY = "brasil360_pacientes";

function carregarPacientes(): Paciente[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Paciente[]) : [];
  } catch {
    return [];
  }
}

interface AuthUser {
  name: string;
  initials: string;
  email: string;
}

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "indicadores" | "relatorios">("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pacientes, setPacientes] = useState<Paciente[]>(carregarPacientes);
  const [selectedUBS, setSelectedUBS] = useState<UBS>(ubsMock[0]);

  // Persist patients to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pacientes));
  }, [pacientes]);

  // Enrich indicators with real patient data
  const pacientesDaUBS = useMemo(
  () => pacientes.filter((p) => p.ubsId === selectedUBS.id),
  [pacientes, selectedUBS]
  );

  const indicadoresEnriquecidos = useMemo(
    () => enriquecerIndicadores(indicators, pacientesDaUBS),
    [pacientesDaUBS]
  );

  function handleLogout() {
    setUser(null);
    setSelectedIndicator(null);
    setActiveTab("dashboard");
  }

  function salvarPaciente(p: Paciente) {
    setPacientes((prev) => {
      const idx = prev.findIndex((x) => x.id === p.id);
      if (idx >= 0) {
        const novo = [...prev];
        novo[idx] = p;
        return novo;
      }
      return [...prev, p];
    });
  }

  function excluirPaciente(id: string) {
    setPacientes((prev) => prev.filter((p) => p.id !== id));
  }

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  // When opening a detail view, use the enriched version so scores match
  function handleSelectIndicator(ind: Indicator) {
    const enriquecido = indicadoresEnriquecidos.find((i) => i.id === ind.id) ?? ind;
    setSelectedIndicator(enriquecido);
  }

  function renderConteudo() {
    if (activeTab === "relatorios") {
      return (
        <RelatoriosPage
          pacientes={pacientesDaUBS}
          ubsAtual={selectedUBS}
          onSalvar={salvarPaciente}
          onExcluir={excluirPaciente}
        />
      );
    }
    if (selectedIndicator) {
      // Always use the freshest enriched version
      const fresco = indicadoresEnriquecidos.find((i) => i.id === selectedIndicator.id) ?? selectedIndicator;
      return (
        <IndicatorDetail
          indicator={fresco}
          pacientes={pacientesDoIndicador(pacientes, fresco.id)}
          onBack={() => setSelectedIndicator(null)}
          onIrParaRelatorios={() => { setSelectedIndicator(null); setActiveTab("relatorios"); }}
        />
      );
    }
    return (
      <Dashboard
        indicators={indicadoresEnriquecidos}
        onSelectIndicator={handleSelectIndicator}
      />
    );
  }

  const paginaRelatorios = activeTab === "relatorios";

  return (
    <div className="app-shell">
      <Sidebar
        open={sidebarOpen}
        activeTab={activeTab}
        onTabChange={(tab) => { setActiveTab(tab); setSelectedIndicator(null); }}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onLogout={handleLogout}
        userName={user.name}
        ubsNome={selectedUBS.nome}
        ubsIne={selectedUBS.ine}
      />
      <div className={`main-content ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
          user={user}

          ubsAtual={selectedUBS}
          todasUBS={ubsMock}
          onTrocarUBS={(id) => {
            const encontrada = ubsMock.find((u) => u.id === id);
            if (encontrada) {
              setSelectedUBS(encontrada);
              setSelectedIndicator(null);
            }
          }}
        />
        <div className={`page-body ${paginaRelatorios ? "page-body--flush" : ""}`}>
          {renderConteudo()}
        </div>
      </div>
    </div>
  );
}
