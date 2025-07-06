# Paulo Habit Analysis

## Visão Geral

Este projeto é um dashboard completo para análise de hábitos, evolução semanal e acompanhamento de metas pessoais. Os dados são armazenados e sincronizados em tempo real com o Firebase Firestore, permitindo visualização, análise e registro diário de hábitos e métricas de saúde.

O app é focado em produtividade, saúde e autoconhecimento, com interface moderna, responsiva e fácil de usar.

---

## Novidades e Mudanças Visuais (2024-06-23)

- **Dashboard e formulário com design ultra minimalista e mobile-first**:
  - Header do app simplificado: só logo e botão de sair.
  - Remoção de textos e áreas informativas desnecessárias no topo do dashboard.
  - Botão "Adicionar Hoje" centralizado, grande e destacado em todas as telas.
- **Formulário de registro diário (AddDayForm) repensado**:
  - Mobile/tablet: fluxo em 2 etapas (hábitos + parte qualitativa), botões grandes, experiência sem poluição visual.
  - Desktop: tudo em uma tela só, inputs e botões grandes, botão "Salvar" sempre visível.
  - Botões de hábitos grandes, fáceis de clicar, com feedback visual verde.
  - Área de observação/qualitativa com destaque e espaço confortável.
- **Remoção do DashboardHeader** e de qualquer cabeçalho redundante.
- **Experiência consistente e clean em todos os dispositivos.**

---

## Principais Funcionalidades

- **Login seguro** com autenticação Firebase
- **Registro diário** de hábitos e métricas (peso, meditação, exercícios, etc.)
- **Dashboard visual** com gráficos, destaques e insights automáticos
- **Análise semanal** de evolução e performance
- **Resumo geral** com médias, tendências e destaques
- **Dados 100% dinâmicos**: tudo vem do Firestore, sem dados estáticos

---

## Estrutura do Projeto

```
src/
│
├── App.jsx                # Componente raiz, faz autenticação e roteamento
├── Dashboard.jsx          # Dashboard principal, orquestra todas as seções
│
├── components/
│   ├── auth/                  # Componentes de autenticação (login, header minimalista)
│   ├── habitForms/            # Formulários (ex: AddDayForm - registro diário minimalista)
│   ├── dashboardSections/     # Seções do dashboard:
│   │   ├── ProgressOverviewSection.jsx # Gráficos de evolução geral (completude e peso)
│   │   ├── HabitPerformanceSection.jsx # Performance detalhada de cada hábito individual
│   │   ├── HabitInsightsSection.jsx    # Insights automáticos e destaques por hábito
│   │   ├── WeeklyDebriefingSection.jsx     # Análise detalhada da última semana
│   │   └── WeeklySummarySection.jsx    # Resumo geral com médias e destaques
│   ├── visualizations/         # Gráficos customizados (ex: CompletionChart, WeightChart)
│   └── commonUI/               # Componentes de UI reutilizáveis (ex: CollapsibleSection)
│
├── hooks/
│   ├── useAuth.js              # Hook de autenticação
│   └── useDashboardData.js     # Hook para buscar/processar dados do Firestore
│
├── firebase/
│   ├── config.js               # Configuração do Firebase
│   └── habitsService.js        # Serviços para ler/escrever dados no Firestore
│
├── data/
│   ├── metricsCalculations.js  # Funções utilitárias para cálculos e métricas
│   └── appConstants.js         # Constantes globais do app
│
├── utils/
│   ├── dataFormatters.js       # (Reservado para helpers de formatação)
│   └── generalHelpers.js       # (Reservado para helpers gerais)
│
├── index.css                   # Estilos globais
└── main.jsx                    # Ponto de entrada do React
```

---

## O que faz cada parte do app?

### App.jsx

Responsável por:

- Inicializar o app
- Gerenciar autenticação (login/logout)
- Exibir o dashboard principal (`Dashboard.jsx`) apenas para usuários autenticados

### Dashboard.jsx

- Componente central do dashboard
- Busca todos os dados do Firestore via `useDashboardData`
- Distribui os dados para as seções principais via props
- Controla a expansão/colapso das seções e o formulário de registro diário

### Seções do Dashboard (components/dashboardSections)

- **ProgressOverviewSection.jsx**: Mostra gráficos de evolução geral, incluindo:
  - Gráfico de completude semanal dos hábitos
  - Gráfico de evolução do peso
  - Métricas de tendência e progresso
- **HabitPerformanceSection.jsx**: Exibe a performance detalhada de cada hábito individual, com gráficos e classificação de desempenho para cada hábito cadastrado.
- **HabitInsightsSection.jsx**: Gera insights automáticos, incluindo:
  - Médias gerais de completude
  - Tendência de peso
  - Destaques e classificações por hábito
- **WeeklyDebriefingSection.jsx**: Faz uma análise detalhada da última semana registrada, mostrando:
  - Comparação com a média geral
  - Destaques, sucessos, desafios e recomendações
  - Evolução e padrões identificados
- **WeeklySummarySection.jsx**: Apresenta um resumo geral com as principais métricas, médias e destaques da última semana.

### Outros diretórios importantes

- **components/habitForms/**: Formulários para registro diário de hábitos.
- **components/visualizations/**: Gráficos customizados usados nas seções.
- **components/commonUI/**: Componentes de interface reutilizáveis (ex: seções colapsáveis, cards de insights).
- **hooks/**: Hooks customizados para autenticação e carregamento/processamento de dados.
- **firebase/**: Integração com o Firestore e serviços de autenticação.
- **data/**: Funções utilitárias para cálculos de métricas e constantes globais.
- **utils/**: Helpers e utilitários gerais.

---

## Fluxo de Dados

- O usuário faz login (Firebase Auth)
- O app carrega os dados do Firestore via `useDashboardData`
- O dashboard (`Dashboard.jsx`) distribui os dados para as seções via props
- Cada seção (ProgressOverview, HabitPerformance, HabitInsights, etc.) exibe gráficos, métricas e destaques
- O usuário pode registrar novos dias pelo formulário, que salva direto no Firestore

---

## Tecnologias Utilizadas

- **React** (com hooks)
- **Firebase** (Firestore + Auth)
- **Vite** (dev server)
- **Tailwind CSS** (estilização)
- **Lucide Icons** (ícones modernos)

---

## Como rodar o projeto

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure o Firebase em `src/firebase/config.js` com suas credenciais.
3. Rode o app:
   ```bash
   npm run dev
   ```
4. Acesse em [http://localhost:3000](http://localhost:3000)

---

## Observações

- Todos os dados são dinâmicos e vêm do Firestore.
- Não há mais dependência de arquivos de dados estáticos.
- O projeto está modularizado e pronto para expansão.

---

Se quiser personalizar ou adicionar mais detalhes, me avise! Posso adaptar para o seu estilo ou incluir instruções específicas.
