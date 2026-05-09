import type { UBS } from "../types";

interface HeaderProps {
  onMenuToggle: () => void;
  sidebarOpen: boolean;
  user: { name: string; initials: string; email: string };

  ubsAtual: UBS;
  todasUBS: UBS[];
  onTrocarUBS: (ubsId: string) => void; 
}

export default function Header({ onMenuToggle, sidebarOpen, user,ubsAtual, todasUBS,onTrocarUBS}: HeaderProps) {
  const now = new Date();
  const formatted = now.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-toggle" onClick={onMenuToggle} aria-label="toggle menu">
          <span className={`hamburger ${sidebarOpen ? "open" : ""}`}>
            <span /><span /><span />
          </span>
        </button>
        <div className="topbar-breadcrumb">
          <span className="breadcrumb-root">Brasil 360</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">Dashboard de Monitoramento</span>
        </div>
      </div>

      <div className="topbar-right">
        <select
          className="ubs-select"
          value={ubsAtual.id}
          onChange={(e) => onTrocarUBS(e.target.value)}
        >
          {todasUBS.map((ubs) => (
            <option key={ubs.id} value={ubs.id}>
              {ubs.nome}
            </option>
          ))}
      </select>
        <div className="topbar-date">{formatted}</div>
        <div className="topbar-quadrimestre">
          <span className="quad-label">Quadrimestre</span>
          <span className="quad-value">1º QUAD · 2025</span>
        </div>
        <div className="topbar-live">
          <span className="live-dot" />
          <span className="live-text">Ao vivo</span>
        </div>
        <div className="topbar-avatar" title={user.name}>{user.initials}</div>
      </div>
    </header>
  );
}
