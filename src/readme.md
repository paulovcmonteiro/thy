# 📊 Análise de Hábitos - Paulo

Um dashboard interativo para acompanhar e analisar hábitos pessoais com métricas detalhadas.

## 🏗️ Arquitetura do Projeto

### Estrutura de Pastas

```
src/
├── components/           # Componentes React reutilizáveis
│   ├── charts/          # Gráficos específicos
│   ├── sections/        # Seções principais da análise
│   └── ui/              # Componentes de interface básicos
├── data/                # Dados e configurações
├── utils/               # Funções utilitárias (futuro)
└── App.jsx              # Componente principal
```

---

## 📁 Detalhamento por Pasta

### `components/charts/` - Gráficos Especializados

#### `CompletionChart.jsx`

- **O que faz:** Gráfico de linha da evolução da completude geral
- **Recebe:** `data` (dados semanais), `metrics` (3 métricas calculadas)
- **Exibe:** Linha temporal + cards com métricas
- **Quando usar:** Para mostrar progresso geral ao longo do tempo

#### `WeightChart.jsx`

- **O que faz:** Gráfico de linha da evolução do peso
- **Recebe:** `data` (dados de peso), `weightTrend` (cálculo de redução)
- **Exibe:** Linha temporal + card de redução total
- **Quando usar:** Para acompanhar mudanças de peso

#### `HabitChart.jsx`

- **O que faz:** Gráfico de barras para UM hábito específico
- **Recebe:** `habit` (dados do hábito), `metrics`, `classification`
- **Exibe:** Barras semanais + métricas compactas
- **Quando usar:** Para análise individual de cada hábito

---

### `components/sections/` - Seções Principais

#### `Header.jsx`

- **O que faz:** Cabeçalho da aplicação
- **Exibe:** Título, nome do usuário, período analisado
- **Dados:** Importa de `analysisInfo`

#### `EvolutionSection.jsx`

- **O que faz:** Seção 1 - Evolução geral (completude + peso)
- **Contém:** `CompletionChart` + `WeightChart`
- **Responsabilidade:** Visão macro do progresso

#### `HabitsSection.jsx`

- **O que faz:** Seção 2 - Performance individual dos hábitos
- **Contém:** Loop de `HabitChart` para cada hábito
- **Responsabilidade:** Análise detalhada por hábito

#### `InsightsSection.jsx`

- **O que faz:** Seção 3 - Insights e análises automáticas
- **Contém:** 3 `InsightsCard` com análises calculadas
- **Responsabilidade:** Interpretação inteligente dos dados

#### `WeekAnalysisSection.jsx`

- **O que faz:** Seção 4 - Análise específica da última semana
- **Contém:** Cards com performance detalhada + recomendações
- **Responsabilidade:** Foco na semana mais recente

#### `Summary.jsx`

- **O que faz:** Resumo final com métricas principais
- **Exibe:** Overview geral + destaque da última semana
- **Responsabilidade:** Conclusão do relatório

---

### `components/ui/` - Componentes Base

#### `CollapsibleSection.jsx`

- **O que faz:** Seção que abre/fecha com clique
- **Props:** `title`, `icon`, `iconColor`, `isExpanded`, `onToggle`, `children`
- **Quando usar:** Para todas as seções principais
- **Benefício:** Consistência visual + interatividade

#### `MetricsCard.jsx`

- **O que faz:** Exibe as 3 métricas padronizadas
- **Props:** `metrics` (objeto com avgGeneral, percentActive, avgActive)
- **Variações:** `MetricsCard` (completo) e `CompactMetricsCard` (lateral)
- **Quando usar:** Sempre que precisar mostrar métricas

#### `InsightsCard.jsx`

- **O que faz:** Card colorido para insights e análises
- **Props:** `title`, `variant` (cor), `icon`, `children`
- **Variantes:** blue, orange, green, yellow, purple, red
- **Quando usar:** Para destacar informações importantes

---

### `data/` - Dados e Lógica

#### `habitData.js`

- **O que contém:** Todos os dados brutos dos hábitos
- **Exports:**
  - `weeklyCompletionData` - Dados de completude geral
  - `weightData` - Dados de peso
  - `habitDataByType` - Dados individuais por hábito
  - `habitsList` - Lista ordenada dos hábitos
  - `analysisInfo` - Informações do período

#### `calculations.js`

- **O que contém:** Funções para calcular métricas
- **Funções principais:**
  - `calculateMetrics()` - Calcula as 3 métricas base
  - `calculateCompletionMetrics()` - Métricas de completude
  - `calculateHabitMetrics()` - Métricas de um hábito
  - `getHabitClassification()` - Classifica performance (😞 a 🤩)
  - `getWeightTrend()` - Calcula tendência de peso

#### `constants.js`

- **O que contém:** Configurações e constantes do projeto
- **Inclui:**
  - `EVALUATION_SCALES` - Escalas de avaliação
  - `COLORS` - Paleta de cores
  - `CHART_CONFIG` - Configurações de gráficos
  - `MESSAGES` - Mensagens padrão
  - `THRESHOLDS` - Limites importantes

---

## 🔄 Fluxo de Dados

```
1. App.jsx (coordena tudo)
   ↓
2. Seções recebem props de estado
   ↓
3. Seções importam dados de data/
   ↓
4. Seções calculam métricas com calculations.js
   ↓
5. Seções passam dados para Charts e UI components
   ↓
6. Componentes renderizam interface final
```

---

## 🎯 Como Usar/Modificar

### Adicionar Nova Semana de Dados

1. Abra `data/habitData.js`
2. Adicione nova entrada em `weeklyCompletionData`
3. Adicione peso em `weightData` (se disponível)
4. Atualize dados em cada hábito dentro de `habitDataByType`

### Adicionar Novo Hábito

1. Em `habitData.js`, adicione entrada em `habitDataByType`
2. Adicione nome do hábito em `habitsList`
3. Defina cor e borderColor para o novo hábito
4. O resto é automático! 🎉

### Modificar Cores/Estilos

1. Ajuste cores em `data/constants.js`
2. Modificar escalas de avaliação também em `constants.js`
3. Estilos específicos nos componentes individuais

### Adicionar Nova Seção

1. Crie arquivo em `components/sections/`
2. Importe em `App.jsx`
3. Adicione estado para expandir/colapsar
4. Use `CollapsibleSection` como wrapper

---

## 📊 As 3 Métricas Principais

Cada hábito é avaliado por 3 métricas:

1. **Média Geral:** % média de completude considerando TODAS as semanas
2. **% Semanas Ativas:** % de semanas onde o hábito teve completude > 0%
3. **Média Ativas:** % média APENAS das semanas onde o hábito foi ativo

### Por que 3 métricas?

- **Média Geral:** Mostra performance real total
- **% Ativas:** Mostra consistência/frequência
- **Média Ativas:** Mostra intensidade quando engajado

**Exemplo:**

- Hábito com 50% geral, 70% ativas, 71% quando ativo = "Faço pouco, mas quando faço, faço bem"
- Hábito com 80% geral, 90% ativas, 89% quando ativo = "Faço quase sempre e bem"

---

## 🚀 Benefícios da Arquitetura

### ✅ Modularidade

- Cada componente tem uma responsabilidade específica
- Fácil de testar e manter

### ✅ Reutilização

- `InsightsCard` usado em várias seções
- `HabitChart` renderiza qualquer hábito
- `CollapsibleSection` padrão para todas as seções

### ✅ Escalabilidade

- Adicionar novos hábitos: automático
- Adicionar novas seções: padronizado
- Modificar estilos: centralizado

### ✅ Manutenção

- Código organizado e documentado
- Alterações isoladas por responsabilidade
- Fácil debug e evolução

---

## 🔧 Tecnologias

- **React** - Interface
- **Recharts** - Gráficos
- **Lucide React** - Ícones
- **Tailwind CSS** - Estilos
- **Vite** - Build tool

---

## 📈 Próximas Evoluções

### Possíveis melhorias:

- [ ] Adicionar pasta `utils/` com formatadores
- [ ] Sistema de metas por hábito
- [ ] Comparação entre períodos
- [ ] Export para PDF/Excel
- [ ] Análise de correlações
- [ ] Dashboard responsivo para mobile

---

_Criado com ❤️ para acompanhar a evolução dos hábitos do Paulo_
