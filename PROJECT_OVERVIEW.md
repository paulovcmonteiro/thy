# THY — Habit Tracker App

## Visão Geral

Thy é um app de rastreamento de hábitos com dashboard visual, scoring semanal e insights gerados por IA (Claude). O objetivo é registrar hábitos diários, acompanhar evolução semanal e receber análises personalizadas.

---

## Arquitetura

```
thy/
├── thy-front/    → Frontend React (Vite + Tailwind)
├── thy-back/     → Backend Node.js (Express + Firebase Admin + Claude API)
└── Firebase Firestore → Banco de dados cloud (NoSQL)
```

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Firebase SDK
- **Backend**: Express 5, Anthropic SDK (Claude API), Firebase Admin SDK
- **Database**: Firebase Firestore (cloud, real-time)
- **AI**: Claude via N8N webhooks (insights + chat)
- **Deploy**: Vercel (frontend e backend)

---

## Hábitos Rastreados

Cada dia registra estes hábitos (booleanos true/false):

| Hábito     | Emoji | Pontos máx/semana |
|------------|-------|-------------------|
| meditar    | 🧘    | 7                 |
| medicar    | 💊    | 1                 |
| exercitar  | 🏃    | 7                 |
| comunicar  | 💬    | 1                 |
| alimentar  | 🍎    | 6                 |
| estudar    | 📚    | 6                 |
| descansar  | 😴    | 6                 |

Total máximo: **34 pontos base** + até **5 pontos de bônus peso** = **39 pontos possíveis**, normalizado sobre 40.

Além dos hábitos, cada dia também registra:
- **peso** (number, em kg — `null` se não informado)
- **sentimento** (string: "ansioso", "normal", "produtivo", etc.)
- **obs** (string: observações/notas do dia)

---

## Estrutura do Banco de Dados (Firestore)

### Collection: `daily_habits`

Um documento por dia. Document ID = data ISO (ex: "2025-01-20").

```json
{
  "date": "2025-01-20",
  "dateFormatted": "20/01",
  "weekStart": "2025-01-19",
  "dayOfWeek": "monday",
  "peso": 85.2,
  "meditar": true,
  "medicar": false,
  "exercitar": true,
  "comunicar": true,
  "alimentar": false,
  "estudar": true,
  "descansar": true,
  "sentimento": "produtivo",
  "obs": "Dia bom, treinei pela manhã",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Collection: `weekly_aggregates`

Resumo automático da semana. Document ID = domingo da semana (ex: "2025-01-19").

```json
{
  "weekStart": "2025-01-19",
  "weekEnd": "2025-01-25",
  "pesoMedio": 84.8,
  "meditar": 5,
  "medicar": 1,
  "exercitar": 4,
  "comunicar": 1,
  "alimentar": 5,
  "estudar": 4,
  "descansar": 6,
  "pontosBase": 30,
  "bonusPeso": 5,
  "totalPontos": 35,
  "completude": 87
}
```

**Sistema de pontuação:**
- Pontos base: soma dos dias completados de cada hábito (caps por hábito conforme tabela acima)
- Bônus peso: +5 se perdeu ≥0.3kg vs semana anterior, +3 se perdeu 0–0.3kg, 0 se ganhou
- Completude: (pontosBase + bonusPeso) / 40 × 100

### Collection: `weeklyDebriefings`

Reflexão semanal do usuário + insights da IA.

```json
{
  "weekDate": "2025-01-25",
  "status": "completed",
  "habitComments": {
    "meditar": "Consegui manter a rotina",
    "exercitar": "Faltei 2 dias por chuva"
  },
  "weekRating": 4,
  "proudOf": "Mantive a meditação todos os dias",
  "notSoGood": "Alimentação ruim no fim de semana",
  "improveNext": "Preparar marmitas no domingo",
  "aiInsights": "## Análise da Semana\n...",
  "createdAt": "timestamp"
}
```

---

## API e Integrações

### Backend Express (thy-back) — https://thy-back.vercel.app

**POST /api/claude**
- Envia prompt para Claude Opus 4.6
- Retorna resposta de texto

**POST /api/openclaw/habits**
- Recebe hábitos do dia via OpenClaw (Telegram) e salva no Firestore
- Recalcula `weekly_aggregates` automaticamente após salvar
- Ver seção "Integração OpenClaw" abaixo para detalhes completos

### N8N Webhooks (thyself.app.n8n.cloud)

- **POST /webhook/generate-insights** — Gera insights semanais baseados nos dados de hábitos e debriefing
- **POST /webhook/chat-ai** — Chat conversacional com contexto completo (12 semanas de dados + histórico de debriefings)

---

## Funcionalidades Principais

1. **Registro diário**: Formulário para marcar hábitos, peso, humor e observações
2. **Aggregação semanal automática**: Ao salvar um dia, recalcula o resumo da semana
3. **Dashboard visual**: Gráficos de completude, tendência de peso, performance por hábito
4. **Debriefing semanal**: Formulário de reflexão em 3 etapas com auto-save
5. **Insights IA**: Claude analisa dados e gera feedback personalizado em Markdown
6. **Chat com IA**: Conversa contextual com acesso a todo o histórico
7. **Registro via Telegram**: Hábitos registrados por áudio/texto via OpenClaw → endpoint do backend

---

## Integração OpenClaw (Telegram → App)

O usuário fala ou digita no Telegram, o OpenClaw transcreve, interpreta e faz POST no backend.

### Endpoint

```
POST https://thy-back.vercel.app/api/openclaw/habits
Authorization: Bearer thy-openclaw-2026
Content-Type: application/json
```

### Payload

```json
{
  "date": "2026-02-28",
  "meditar": true,
  "exercitar": true,
  "medicar": false,
  "comunicar": false,
  "alimentar": true,
  "estudar": false,
  "descansar": true,
  "peso": 84.5,
  "sentimento": "produtivo",
  "obs": "Energia boa hoje"
}
```

### Regras de interpretação

- `date`: obrigatório, formato `YYYY-MM-DD`
- Hábitos não mencionados = `false`
- `peso`: número em kg, `null` se não mencionado
- `sentimento` e `obs`: strings livres, vazias se não mencionadas
- O backend calcula `weekStart`, `dayOfWeek` e `dateFormatted` automaticamente
- O backend recalcula `weekly_aggregates` automaticamente após salvar

### Exemplo de áudio/texto esperado

> "Hoje meditei, treinei, comi bem e dormi bem. Pesei 84kg. Tô me sentindo produtivo."

O OpenClaw deve extrair:
```json
{
  "date": "<hoje>",
  "meditar": true,
  "exercitar": true,
  "alimentar": true,
  "descansar": true,
  "medicar": false,
  "comunicar": false,
  "estudar": false,
  "peso": 84,
  "sentimento": "produtivo",
  "obs": ""
}
```

---

## Estrutura de Arquivos Relevantes

| Arquivo | O que faz |
|---------|-----------|
| `thy-front/src/firebase/config.js` | Configuração do Firebase |
| `thy-front/src/firebase/habitsService.js` | CRUD de hábitos diários + aggregação semanal (frontend) |
| `thy-front/src/firebase/debriefingService.js` | CRUD de debriefings semanais |
| `thy-front/src/services/aiService.js` | Geração de insights via N8N |
| `thy-front/src/services/aiChatService.js` | Chat contextual com IA |
| `thy-front/src/hooks/useDashboardData.js` | Busca e transformação de dados |
| `thy-front/src/data/appConstants.js` | Constantes (metas, nomes dos hábitos) |
| `thy-back/src/index.js` | Servidor Express + endpoints Claude e OpenClaw |
