# THY — Habit Tracker App

## Visão Geral

Thy é um app de rastreamento de hábitos com dashboard visual, scoring semanal e insights gerados por IA (Claude). O objetivo é registrar hábitos diários, acompanhar evolução semanal e receber análises personalizadas.

---

## Arquitetura

```
thy/
├── thy-front/    → Frontend React (Vite + Tailwind)
├── thy-back/     → Backend Node.js (Express + Claude API)
└── Firebase Firestore → Banco de dados cloud (NoSQL)
```

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Firebase SDK
- **Backend**: Express 5, Anthropic SDK (Claude API)
- **Database**: Firebase Firestore (cloud, real-time)
- **AI**: Claude via N8N webhooks (insights + chat)
- **Deploy**: Vercel (frontend e backend)

---

## Hábitos Rastreados

Cada dia registra estes hábitos (booleanos true/false):

| Hábito       | Emoji | Meta semanal (dias) | Pontos máx |
|-------------|-------|---------------------|------------|
| meditar     | 🧘    | 7                   | 7          |
| medicar     | 💊    | 3                   | 3          |
| exercitar   | 🏃    | 7                   | 7          |
| comunicar   | 💬    | 5                   | 5          |
| alimentar   | 🍎    | 6                   | 6          |
| estudar     | 📚    | 6                   | 6          |
| descansar   | 😴    | 6                   | 6          |

Além dos hábitos, cada dia também registra:
- **peso** (number, em kg)
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
  "medicar": 3,
  "exercitar": 4,
  "comunicar": 3,
  "alimentar": 5,
  "estudar": 4,
  "descansar": 6,
  "pontosBase": 30,
  "bonusPeso": 5,
  "totalPontos": 35,
  "completude": 87.5
}
```

**Sistema de pontuação:**
- Pontos base: soma dos dias completados de cada hábito (máx 40)
- Bônus peso: +5 se perdeu ≥0.3kg, +3 se perdeu 0-0.3kg, 0 se ganhou
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

### Backend Express (thy-back)

**POST /api/claude**
- Envia prompt para Claude 3.5 Haiku
- Retorna resposta de texto

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

---

## Fluxo de Dados para Integração via WhatsApp

Para registrar hábitos via WhatsApp/áudio, o fluxo ideal seria:

1. Usuário manda áudio no WhatsApp (ex: "Hoje meditei, treinei e pesei 84kg")
2. OpenClaw transcreve o áudio
3. OpenClaw interpreta e extrai: `meditar: true`, `exercitar: true`, `peso: 84`
4. OpenClaw salva no Firestore na collection `daily_habits` com a data de hoje

### Dados necessários para salvar um dia:

```json
{
  "date": "2025-01-20",
  "dateFormatted": "20/01",
  "weekStart": "2025-01-19",
  "dayOfWeek": "monday",
  "peso": 84,
  "meditar": true,
  "medicar": false,
  "exercitar": true,
  "comunicar": false,
  "alimentar": false,
  "estudar": false,
  "descansar": false,
  "sentimento": "",
  "obs": ""
}
```

**Regras importantes:**
- A semana começa no domingo (`weekStart` = domingo anterior)
- `dayOfWeek` em inglês minúsculo: sunday, monday, tuesday, etc.
- Hábitos não mencionados devem ser `false`
- `peso` é `null` se não informado
- Após salvar em `daily_habits`, precisa recalcular o `weekly_aggregates` da semana correspondente

### Firestore Config

- Project ID: `habit-trackerv1`
- Auth Domain: `habit-trackerv1.firebaseapp.com`
- As credenciais de acesso ao Firebase estão no arquivo `thy-front/src/firebase/config.js`

---

## Estrutura de Arquivos Relevantes

| Arquivo | O que faz |
|---------|-----------|
| `thy-front/src/firebase/config.js` | Configuração do Firebase |
| `thy-front/src/firebase/habitsService.js` | CRUD de hábitos diários + aggregação semanal |
| `thy-front/src/firebase/debriefingService.js` | CRUD de debriefings semanais |
| `thy-front/src/services/aiService.js` | Geração de insights via N8N |
| `thy-front/src/services/aiChatService.js` | Chat contextual com IA |
| `thy-front/src/hooks/useDashboardData.js` | Busca e transformação de dados |
| `thy-front/src/data/appConstants.js` | Constantes (metas, nomes dos hábitos) |
| `thy-back/src/index.js` | Servidor Express + endpoint Claude |
