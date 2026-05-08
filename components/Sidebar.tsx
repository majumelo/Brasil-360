interface SidebarProps {
  open: boolean;
  activeTab: string;
  onTabChange: (tab: "dashboard" | "indicadores" | "relatorios") => void;
  onToggle: () => void;
  onLogout: () => void;
  userName: string;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "⊞" },
  { id: "indicadores", label: "Indicadores", icon: "◎" },
  { id: "relatorios", label: "Relatórios", icon: "≡" },
];

export default function Sidebar({ open, activeTab, onTabChange, onLogout, userName }: SidebarProps) {
  return (
    <aside className={`sidebar ${open ? "open" : "closed"}`}>
      <div className="sidebar-logo">
        <div className="logo-mark">
          <span className="logo-360">360°</span>
        </div>
        {open && (
          <div className="logo-text">
            <span className="logo-brasil">BRASIL</span>
            <span className="logo-sub">Sistema APS</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">{open && "NAVEGAÇÃO"}</div>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? "active" : ""}`}
            onClick={() => onTabChange(item.id as "dashboard" | "indicadores" | "relatorios")}
            title={!open ? item.label : undefined}
          >
            <span className="nav-icon">{item.icon}</span>
            {open && <span className="nav-label">{item.label}</span>}
            {open && activeTab === item.id && <span className="nav-active-dot" />}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        {open && (
          <>
            <div className="equipe-badge">
              <span className="badge-icon">🏥</span>
              <div>
                <div className="badge-name">ESF — Unidade Central</div>
                <div className="badge-ine">INE: 0001234567</div>
              </div>
            </div>
            <div className="sidebar-version">v1.0 · Brasil 360</div>
          </>
        )}

        <button
          className={`sidebar-logout-btn ${open ? "" : "compact"}`}
          onClick={onLogout}
          title="Sair"
        >
          <span className="logout-icon">⎋</span>
          {open && <span className="logout-label">Sair — {userName}</span>}
        </button>
      </div>
    </aside>
  );
}
