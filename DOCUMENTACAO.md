# Brasil 360 — Documentação Técnica

> Documento destinado à equipe de desenvolvimento para contextualizar a estrutura atual do frontend e orientar a integração com o backend.

---

## 1. Visão Geral do Projeto

**Brasil 360** é um painel de monitoramento de indicadores de saúde da Atenção Primária à Saúde (APS), voltado a equipes de Saúde da Família (eSF) e equipes de Atenção Primária (eAP).

A aplicação permite:
- Visualizar o desempenho da equipe nos **7 indicadores oficiais do SISAB/SIAPS**
- **Cadastrar pacientes** vinculados a um indicador específico
- Marcar critérios de pontuação por paciente (ex: vacinação em dia, consulta realizada)
- Ver o **score real** de cada paciente e observar como isso impacta o valor do indicador no dashboard

---

## 2. Stack Tecnológica (Frontend)

| Item | Tecnologia |
|------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Estilização | CSS puro (variáveis CSS, sem biblioteca UI) |
| Roteamento | Sem biblioteca — navegação por estado React |
| Persistência atual | `localStorage` (temporário, será substituído por API) |
| Autenticação atual | Mock local (usuários hardcoded, será substituído por API) |

**Não há backend ainda.** Todo o dado é gerenciado em estado React e persistido no `localStorage` do navegador. A integração com backend consistirá em substituir essas fontes locais por chamadas HTTP.

---

## 3. Estrutura de Pastas

```
brasil360/
│
├── components/                  # Componentes React reutilizáveis
│   ├── Login/
│   │   ├── LoginPage.tsx        # Tela de login (formulário + validação)
│   │   └── Login.css            # Estilos da tela de login
│   │
│   ├── Relatorios/
│   │   ├── RelatoriosPage.tsx   # Cadastro e listagem de pacientes
│   │   └── Relatorios.css       # Estilos da página de relatórios
│   │
│   ├── Dashboard.tsx            # Página principal com resumo e grid de indicadores
│   ├── Header.tsx               # Barra superior (breadcrumb, data, avatar do usuário)
│   ├── Sidebar.tsx              # Menu lateral (navegação + botão Sair)
│   ├── IndicatorCard.tsx        # Card individual de cada indicador no dashboard
│   ├── IndicatorDetail.tsx      # Página de detalhe de um indicador (+ lista de pacientes)
│   └── ScoreGauge.tsx           # Gauge SVG de pontuação geral
│
├── src/
│   ├── App.tsx                  # Raiz da aplicação — gerencia estado global e navegação
│   ├── main.tsx                 # Ponto de entrada React (monta o App no DOM)
│   ├── index.css                # Estilos globais e design tokens (variáveis CSS)
│   ├── App.css                  # Estilos mínimos do App
│   │
│   └── data/
│       ├── indicators.ts        # Dados base dos 7 indicadores (mock estático)
│       ├── patientQuestions.ts  # Perguntas por indicador + funções de score
│       └── indicatorUtils.ts    # Lógica de cruzamento: enriquece indicadores com dados de pacientes
│
├── types.ts                     # Interfaces TypeScript compartilhadas
├── index.html                   # HTML de entrada
├── package.json
├── vite.config.ts
└── DOCUMENTACAO.md              # Este arquivo
```

---

## 4. Tipos de Dados (Interfaces TypeScript)

Definidos em `types.ts`. O backend deve seguir estas mesmas estruturas nas respostas da API.

### `Indicator` — Indicador de saúde
```typescript
interface Indicator {
  id: string;
  codigo: string;           // Ex: "I1", "I2"
  nome: string;             // Ex: "Desenvolvimento Infantil"
  descricao: string;
  meta: string;             // Ex: "≥ 70%"
  fonte: string;            // Ex: "SISAB"
  peso: number;             // Peso no cálculo da nota final (1 ou 2)
  categoria: string;        // Ex: "Criança", "Gestante"
  icone: string;            // Emoji
  valor_atual: number;      // Valor percentual atual (0–100)
  conceito_atual: "Regular" | "Suficiente" | "Bom" | "Ótimo";
  historico: { mes: string; valor: number }[];   // Últimos meses
  quadrimestres: QuadrimestralData[];
  tendencia: "subindo" | "descendo" | "estavel";
  cor_acento: string;       // Cor hexadecimal para UI
  pacientesCount?: number;  // Calculado no frontend a partir dos pacientes
}
```

### `QuadrimestralData` — Dados de um quadrimestre
```typescript
interface QuadrimestralData {
  quadrimestre: string;     // Ex: "1º QUAD 2025"
  meses: { mes: string; valor: number }[];
  resultado: number;        // Média quadrimestral
  conceito: "Regular" | "Suficiente" | "Bom" | "Ótimo";
  nota: number;             // 0.25 | 0.5 | 0.75 | 1.0
  peso: number;
  notaFinal: number;        // nota × peso
}
```

### `Paciente` — Paciente cadastrado
```typescript
interface Paciente {
  id: string;               // UUID gerado no frontend (mover para backend)
  cpf: string;              // Formatado: "000.000.000-00"
  nome: string;
  indicadorId: string;      // FK para Indicator.id
  respostas: Record<string, boolean>;  // { "perguntaId": true/false }
  dataCadastro: string;     // ISO 8601
}
```

### `Pergunta` — Critério de pontuação de um indicador
```typescript
interface Pergunta {
  id: string;   // Ex: "2_vacina"
  texto: string;
}
```

---

## 5. Os 7 Indicadores e Suas Perguntas

Cada indicador tem um conjunto de perguntas (critérios) que determinam o score do paciente.  
O score é: `(respostas "sim" / total de perguntas) × 100%`.

| ID | Código | Nome | Perguntas |
|----|--------|------|-----------|
| 1 | I1 | Mais Acesso à APS | 4 perguntas (consulta, retorno, cadastro, demanda) |
| 2 | I2 | Desenvolvimento Infantil | 5 perguntas (vacinação, triagem neonatal, puericultura, antropometria, desenvolvimento) |
| 3 | I3 | Gestante e Puérpera | 5 perguntas (captação 1º tri, 6 consultas, exames, puerperal, odonto) |
| 4 | I4 | Diabetes Mellitus | 5 perguntas (HbA1c, exame dos pés, consulta, medicação, PA) |
| 5 | I5 | Hipertensão Arterial | 5 perguntas (PA aferida, retorno, medicação, exames, estratificação) |
| 6 | I6 | Pessoa Idosa | 5 perguntas (influenza, avaliação multidimensional, consulta, quedas, cognitivo) |
| 7 | I7 | Prevenção do Câncer | 4 perguntas (Papanicolau, mamografia, orientação, colorretal) |

Definidas em: `src/data/patientQuestions.ts`

### Classificação de conceito por score:
| Score | Conceito |
|-------|---------|
| ≥ 90% | Ótimo |
| ≥ 70% | Bom |
| ≥ 50% | Suficiente |
| < 50% | Regular |

### Nota do conceito (para nota final):
| Conceito | Nota | Exemplo (peso 2) |
|----------|------|-----------------|
| Ótimo | 1,00 | 2,00 |
| Bom | 0,75 | 1,50 |
| Suficiente | 0,50 | 1,00 |
| Regular | 0,25 | 0,50 |

---

## 6. Fluxo de Dados Atual (sem backend)

```
[localStorage]
     │
     ▼
 App.tsx  ──── carrega pacientes ────► useMemo: enriquecerIndicadores()
     │                                        │
     │                                        ▼
     │                              indicators.ts (base estática)
     │                              + média dos pacientes por indicador
     │                              = indicadoresEnriquecidos[]
     │
     ├──► Dashboard ◄──── indicadoresEnriquecidos
     │         │
     │         └──► IndicatorCard (mostra valor derivado dos pacientes)
     │
     ├──► IndicatorDetail ◄── indicador enriquecido + pacientes do indicador
     │
     └──► RelatoriosPage ◄── pacientes[] + handlers salvar/excluir
```

### Lógica de enriquecimento (`src/data/indicatorUtils.ts`)

Quando há pacientes cadastrados para um indicador:
1. Calcula a **média dos scores** de todos os pacientes daquele indicador
2. Substitui o `valor_atual` do indicador pela média real
3. Recalcula `conceito_atual`, `nota` e `notaFinal`
4. Reconstrói o `historico` com base nas datas de cadastro dos pacientes
5. Recalcula a `tendencia` (subindo/descendo/estavel)

Quando **não há pacientes**: o indicador usa os valores do arquivo `indicators.ts` (dados estáticos de exemplo).

---

## 7. Navegação (sem React Router)

A navegação é feita por estado em `App.tsx`:

```
user === null
  → LoginPage

user !== null:
  activeTab === "dashboard"  → Dashboard (ou IndicatorDetail se selectedIndicator !== null)
  activeTab === "indicadores" → Dashboard (mesma view, filtro futuro)
  activeTab === "relatorios"  → RelatoriosPage
```

**Não há URL routing.** O backend não precisa se preocupar com rotas SPA por enquanto.

---

## 8. Autenticação Atual (Mock)

Arquivo: `components/Login/LoginPage.tsx`

Usuários hardcoded para demo:
```
admin@brasil360.gov.br  /  brasil360
julia.silva@saude.gov.br  /  julia123
```

O objeto de usuário em memória:
```typescript
{ name: string; initials: string; email: string }
```

**O backend precisará fornecer:**
- Endpoint de login (retorna token JWT ou sessão)
- Endpoint de perfil do usuário autenticado
- O frontend armazenará o token e o enviará nos headers das requisições

---

## 9. Persistência Atual (localStorage)

| Chave | Conteúdo | Tipo |
|-------|----------|------|
| `brasil360_pacientes` | Array de pacientes cadastrados | `Paciente[]` em JSON |

Esta chave é lida na inicialização (`carregarPacientes()` em `App.tsx`) e gravada sempre que o array de pacientes muda (`useEffect` com `localStorage.setItem`).

**Quando o backend estiver pronto**, essa lógica será substituída por:
```typescript
// Substituir:
const [pacientes, setPacientes] = useState<Paciente[]>(carregarPacientes);

// Por chamadas de API:
const { data: pacientes } = useQuery('/api/pacientes');
const salvarPaciente = (p) => fetch('/api/pacientes', { method: 'POST', body: JSON.stringify(p) });
```

---

## 10. APIs que o Backend Precisará Fornecer

A seguir, as rotas sugeridas com base no que o frontend já faz. Todas devem exigir autenticação (Bearer token ou sessão).

### Autenticação
```
POST   /api/auth/login           → { token, user: { name, email, initials } }
POST   /api/auth/logout
GET    /api/auth/me              → { name, email, initials }
```

### Pacientes
```
GET    /api/pacientes            → Paciente[]
POST   /api/pacientes            → Paciente (novo cadastro)
PUT    /api/pacientes/:id        → Paciente (edição)
DELETE /api/pacientes/:id        → 204 No Content
```

### Indicadores (dados reais do SISAB futuramente)
```
GET    /api/indicadores          → Indicator[]  (com valores reais do período)
GET    /api/indicadores/:id      → Indicator
```

### Perguntas por indicador (opcional — atualmente estão hardcoded no frontend)
```
GET    /api/indicadores/:id/perguntas  → Pergunta[]
```

---

## 11. Componentes — Responsabilidades Resumidas

| Componente | Responsabilidade |
|-----------|-----------------|
| `App.tsx` | Estado global: usuário autenticado, aba ativa, lista de pacientes, indicadores enriquecidos |
| `LoginPage.tsx` | Formulário de login; chama `onLogin(user)` no sucesso |
| `Sidebar.tsx` | Navegação entre abas; botão Sair chama `onLogout()` |
| `Header.tsx` | Barra superior; mostra data, quadrimestre, avatar do usuário logado |
| `Dashboard.tsx` | Grid de indicadores + card de nota geral; recebe `indicators[]` enriquecidos |
| `IndicatorCard.tsx` | Card de um indicador; mostra valor, conceito, sparkline, badge de pacientes |
| `IndicatorDetail.tsx` | Detalhe de um indicador: quadrimestre, cálculo de nota, lista de pacientes |
| `RelatoriosPage.tsx` | CRUD de pacientes: lista + formulário com critérios por indicador e score em tempo real |
| `ScoreGauge.tsx` | Gauge SVG decorativo da nota geral |
| `indicatorUtils.ts` | Pura lógica: recalcula indicadores com base nos pacientes cadastrados |
| `patientQuestions.ts` | Define as perguntas de cada indicador + funções `calcularPontuacao`, `conceito`, `formatarCpf` |

---

## 12. Variáveis CSS (Design Tokens)

Definidas em `src/index.css`. Todos os componentes usam estas variáveis:

```css
--teal-900: #0f3d38   /* cor principal escura (sidebar, botões) */
--teal-700: #115e59
--teal-600: #0d9488
--teal-500: #14b8a6
--teal-400: #2dd4bf
--teal-100: #ccfbf1
--teal-50:  #f0fdfa

--slate-900: #0f172a
--slate-800: #1e293b
--slate-600: #475569
--slate-400: #94a3b8
--slate-200: #e2e8f0
--slate-100: #f1f5f9
--slate-50:  #f8fafc

--radius-sm: 8px
--radius-md: 14px
--radius-lg: 20px
```

Fontes usadas (Google Fonts):
- **Syne** — títulos e números grandes
- **DM Sans** — texto corrido e interface

---

## 13. Como Rodar o Projeto

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (http://localhost:5173)
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

**Credenciais de acesso (demo):**
```
E-mail:  admin@brasil360.gov.br
Senha:   brasil360
```

---

## 14. Próximos Passos para Integração com Backend

1. **Criar o backend** com as rotas descritas na seção 10
2. **Substituir o mock de login** em `LoginPage.tsx` por uma chamada `POST /api/auth/login`
3. **Substituir o `localStorage`** de pacientes por chamadas `GET/POST/PUT/DELETE /api/pacientes`
4. **Substituir os dados estáticos** de `indicators.ts` por chamadas `GET /api/indicadores`
5. **Adicionar interceptor HTTP** (ex: Axios) para enviar o token JWT em todas as requisições
6. **Considerar React Query ou SWR** para gerenciamento de cache e loading states no frontend

---

*Última atualização: Maio 2025 · Brasil 360 v1.0*
