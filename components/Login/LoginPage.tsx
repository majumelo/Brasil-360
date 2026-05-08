import { useState } from "react";
import "./Login.css";

interface LoginPageProps {
  onLogin: (user: { name: string; initials: string; email: string }) => void;
}

const DEMO_USERS = [
  { email: "admin@brasil360.gov.br", password: "brasil360", name: "Administrador", initials: "AD" },
  { email: "julia.silva@saude.gov.br", password: "julia123", name: "Julia Silva", initials: "JS" },
];

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const user = DEMO_USERS.find(
        (u) => u.email === email.trim().toLowerCase() && u.password === password
      );
      if (user) {
        onLogin({ name: user.name, initials: user.initials, email: user.email });
      } else {
        setError("E-mail ou senha incorretos.");
        setLoading(false);
      }
    }, 700);
  }

  return (
    <div className="login-shell">
      <div className="login-bg-pattern" />

      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-mark">
            <span className="logo-360">360</span>
          </div>
          <div>
            <div className="login-brand-name">Brasil 360</div>
            <div className="login-brand-sub">Painel APS</div>
          </div>
        </div>

        <div className="login-divider" />

        <div className="login-heading">
          <h1 className="login-title">Bem-vindo de volta</h1>
          <p className="login-subtitle">Acesse o painel de monitoramento da sua equipe de saúde.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="login-label" htmlFor="email">E-mail institucional</label>
            <div className="login-input-wrap">
              <span className="login-input-icon">✉</span>
              <input
                id="email"
                type="email"
                className="login-input"
                placeholder="seu@saude.gov.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="password">Senha</label>
            <div className="login-input-wrap">
              <span className="login-input-icon">🔒</span>
              <input
                id="password"
                type="password"
                className="login-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? <span className="login-spinner" /> : "Entrar no Painel"}
          </button>
        </form>

        <div className="login-demo-hint">
          <span className="demo-hint-label">Acesso demo:</span>
          <code className="demo-hint-code">admin@brasil360.gov.br</code>
          <span className="demo-hint-sep">/</span>
          <code className="demo-hint-code">brasil360</code>
        </div>
      </div>

      <div className="login-footer">
        <span>Brasil 360 · Sistema de Monitoramento APS</span>
        <span>Ministério da Saúde · 2025</span>
      </div>
    </div>
  );
}
