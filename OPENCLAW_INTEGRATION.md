# Integração OpenClaw ↔ THY Habit Tracker

## O que é esse app

App de rastreamento de hábitos diários. O usuário registra o que fez no dia via áudio/texto no Telegram, e os dados são salvos automaticamente no banco e refletidos no dashboard.

---

## Endpoints disponíveis

Base URL: `https://thy-back.vercel.app`
Autenticação: `Authorization: Bearer thy-openclaw-2026` (em todos os requests)

---

### 1. Texto livre / áudio transcrito

**Uso:** Usuário fala ou escreve naturalmente. OpenClaw transcreve e manda o texto bruto.

```
POST /api/openclaw/parse
```

**Body:**
```json
{
  "text": "semana passada fiz exercício segunda e quarta, não meditei, estava viajando",
  "referenceDate": "2026-02-28"
}
```

- `text`: transcrição do áudio ou texto do usuário (obrigatório)
- `referenceDate`: data de hoje no formato `YYYY-MM-DD` (obrigatório — usado para resolver "semana passada", "ontem", "segunda-feira", etc.)

**Resposta de sucesso:**
```json
{
  "success": true,
  "data": {
    "parsed": [ ... ],
    "saved": 7,
    "skipped": 0,
    "weeksRecalculated": ["2026-02-22"]
  }
}
```

---

### 2. Múltiplos dias estruturados

**Uso:** OpenClaw já montou os dados e quer enviar vários dias de uma vez.

```
POST /api/openclaw/week
```

**Body:** array de dias
```json
[
  {
    "date": "2026-02-23",
    "meditar": true,
    "exercitar": true,
    "alimentar": true,
    "medicar": false,
    "comunicar": false,
    "estudar": false,
    "descansar": true,
    "peso": 85.0,
    "sentimento": "produtivo",
    "obs": "Boa energia hoje"
  },
  {
    "date": "2026-02-24",
    "exercitar": true,
    "peso": 84.8
  }
]
```

---

### 3. Um único dia estruturado

```
POST /api/openclaw/habits
```

**Body:**
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

---

## Campos de um dia

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `date` | string `YYYY-MM-DD` | ✅ | Data do dia |
| `meditar` | boolean | — | Meditação (padrão: `false`) |
| `medicar` | boolean | — | Tomou medicação (padrão: `false`) |
| `exercitar` | boolean | — | Exercício físico (padrão: `false`) |
| `comunicar` | boolean | — | Checkpoint de comunicação (padrão: `false`) |
| `alimentar` | boolean | — | Alimentação saudável (padrão: `false`) |
| `estudar` | boolean | — | Estudo/leitura (padrão: `false`) |
| `descansar` | boolean | — | Descanso/sono adequado (padrão: `false`) |
| `peso` | number (kg) | — | Ex: `84.5`. `null` se não informado |
| `sentimento` | string | — | Ex: `"produtivo"`, `"ansioso"`, `"normal"` |
| `obs` | string | — | Observações livres do dia |

**Regras:**
- Hábito não mencionado pelo usuário = `false`
- `peso` = `null` se não mencionado
- O backend calcula automaticamente: `weekStart`, `dayOfWeek`, `dateFormatted`
- O backend recalcula o resumo semanal automaticamente após salvar

---

## Fluxo recomendado para áudio

1. Usuário manda áudio no Telegram
2. OpenClaw transcreve
3. OpenClaw faz `POST /api/openclaw/parse` com o texto + data de hoje
4. Backend usa Claude internamente para extrair os dados e salvar
5. OpenClaw confirma para o usuário o que foi registrado (usar o campo `parsed` da resposta)

**Exemplos de frases que o `/parse` entende:**
- `"Hoje meditei, treinei e pesei 84kg"`
- `"Semana passada fiz exercício na segunda e quarta, não meditei nenhum dia"`
- `"Ontem treinei, comi bem e dormi bem. Tô me sentindo produtivo"`
- `"Segunda: treinei e meditei. Terça: só meditei. Quarta: nada. Pesei 85kg na terça"`

---

## Erros comuns

| Status | Motivo |
|--------|--------|
| 401 | Token errado ou ausente |
| 400 | `date` em formato inválido, ou `text`/`referenceDate` ausentes no `/parse` |
| 500 | Erro interno (Firestore ou Claude) |
