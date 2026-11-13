# 🏛️ Câmara da Escola

Simulação educacional multiplayer em **pixel art 2D** onde estudantes assumem o papel de deputadas e deputados para debater, priorizar e distribuir um orçamento participativo fictício de **R$ 1.000.000,00** entre as necessidades da **Escola MM**.

---

## 🎯 Objetivo Pedagógico

Desenvolver pensamento crítico, negociação em grupo, educação financeira/orçamentária e cidadania escolar. Organizados em até **10 bancadas parlamentares**, os estudantes precisam entrar em consenso sobre:

1. Como alocar **10 moedas de ouro** (cada moeda equivale a **R$ 100.000,00**, totalizando **R$ 1 milhão**) entre **10 pilares temáticos** da escola.
2. Qual é o **Pilar Prioritário nº 1** da bancada.
3. Como esse investimento seria aplicado na prática (**Plano de Ação**) e por que determinados pilares ficaram sem verba (**Justificativa das Exclusões**).

---

## ✨ Principais Funcionalidades

### 1. Entrada e Cenário Interativo (Pixel Art 2D)
- **Fachada animada da Câmara da Escola** com avatares diversos caminhando na calçada, céu dinâmico, bandeiras e letreiro temático.
- Acesso rápido para **Estudantes (Entrar em uma Bancada)** ou **Professor / Projetor (Mural da Turma)**.
- Efeitos sonoros retrô opcionais sintetizados via Web Audio API (cliques, moedas, martelo parlamentar e fanfarra).

### 2. Bancada dos Estudantes (Modo Grupo)
- **Seleção de Bancada (1 a 10):** vários alunos do mesmo grupo podem acessar a mesma bancada simultaneamente e colaborar em tempo real.
- **Customizador de Avatar Parlamentar:**
  - Seleção de gênero/arquétipo (**♀ Feminina** / **♂ Masculino**) logo no topo.
  - Personalização de tom de pele, estilo e cor de cabelo, traje (terno, blazer, camiseta do grêmio, moletom, uniforme) e acessórios (gravata, faixa de deputado/a, óculos, crachá).
- **Distribuição de Orçamento:** alocação interativa das 10 moedas pelos 10 pilares com visualização de valores em reais e exemplos de ideias para cada área.
- **Ficha Parlamentar & Protocolo:** preenchimento sincronizado do plano de ação e justificativa, com cerimônia de protocolo compartilhada entre todos os membros da bancada.

### 3. Mural da Turma (Modo Professor / Projetor)
- **Painel em Tempo Real:** atualizado instantaneamente via **Server-Sent Events (SSE)**.
- **Ranking ao Vivo dos Pilares:** barra de progresso e soma total de recursos alocados pela turma em cada área.
- **Status das 10 Bancadas:** visualização dos avatares, nomes customizados, progresso (`Aguardando`, `Editando`, `Protocolada`) e detalhes das emendas enviadas.
- **Contador de Presença Real:** exibe quantos dispositivos/abas estão conectados ao vivo com limpeza automática de conexões inativas e pulso (*heartbeat*) a cada 15 segundos.
- **Controle da Rodada:** cronômetro de 20 minutos com botões para iniciar, pausar, adicionar `+1m` ou `+5m` e zerar a rodada.
- **QR Code & Link de Acesso:** geração automática de QR Code na tela para os estudantes entrarem direto pelo celular.

---

## 📚 Os 10 Pilares Orçamentários

1. **Estrutura e Tecnologia** — Wi-Fi, computadores, laboratório e ventilação
2. **Professores e Formação** — Mais professores, capacitação e projetos pedagógicos
3. **Biblioteca e Material Didático** — Livros atuais, apostilas e espaço de leitura
4. **Alimentação e Transporte** — Merenda reforçada, bebedouros gelados e auxílio transporte
5. **Acessibilidade e Inclusão** — Rampas, intérprete de Libras, banheiros e materiais adaptados
6. **Segurança e Convivência** — Mediação de conflitos, iluminação no entorno e portaria segura
7. **Cultura, Esporte e Lazer** — Quadra coberta, instrumentos musicais, teatro e campeonatos
8. **Orientação para o Futuro** — Cursos técnicos, preparação para ENEM/vestibular e profissões
9. **Saúde e Bem-Estar** — Apoio psicológico, espaços verdes de descanso e saúde mental
10. **Participação dos Estudantes** — Grêmio estudantil forte, assembleias, jornal e caixas de sugestão

---

## 🛠️ Stack Tecnológica

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion, QRCode
- **Backend:** Node.js, Express, `tsx`, Server-Sent Events (SSE) para sincronização em tempo real
- **Build & Dev:** Vite 8

---

## 📁 Estrutura do Projeto

```text
├── server.ts                  # Servidor Express, estado da rodada em memória e stream SSE (/api/events)
├── index.html                 # Entrada HTML e fontes pixel art
├── metadata.json              # Metadados do aplicativo
├── package.json               # Scripts e dependências
└── src/
    ├── App.tsx                # Roteamento por views (home, group, mural) e inscrição SSE
    ├── api.ts                 # Cliente em tempo real (EventSource + BroadcastChannel + fallback localStorage)
    ├── pillarsData.ts         # Definição dos 10 pilares e exemplos de investimento
    ├── sound.ts               # Sintetizador de efeitos sonoros 8-bit via Web Audio API
    ├── types.ts               # Interfaces TypeScript (AvatarConfig, GroupData, RoundState, Pillar)
    ├── components/
    │   ├── AvatarCreator.tsx  # Editor completo de avatar parlamentar
    │   ├── PixelAvatar.tsx    # Renderizador SVG em pixel art dos deputados
    │   ├── PixelIcons.tsx     # Ícones pixel art (moedas, baú, pilares)
    │   └── PixelScene.tsx     # Tela inicial animada da Câmara da Escola
    └── views/
        ├── GroupView.tsx      # Painel da bancada dos estudantes
        └── MuralView.tsx      # Painel do professor / projetor da turma
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js (v18 ou superior recomendado)

### Passos

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Inicie o servidor de desenvolvimento (Express + Vite na porta 3000):**
   ```bash
   npm run dev
   ```

3. **Acesse no navegador:**
   - Tela inicial: `http://localhost:3000`
   - Mural do Professor: `http://localhost:3000/#mural`
   - Acesso direto a uma bancada (ex.: Grupo 1): `http://localhost:3000/#group-1`

### Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor backend + Vite HMR/middleware na porta `3000` |
| `npm run build` | Gera o bundle de produção do frontend em `dist/` |
| `npm start` | Inicia o servidor em modo de produção servindo os arquivos compilados |
| `npm run lint` | Executa verificação de tipos TypeScript (`tsc --noEmit`) |
| `npm run clean` | Remove artefatos de build (`dist` e `server.js`) |

---

## 🔌 Endpoints da API

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/state` | Retorna o snapshot atual da rodada e das 10 bancadas |
| `GET` | `/api/events` | Stream **SSE** com atualizações em tempo real e heartbeat de presença |
| `POST` | `/api/groups/:id/join` | Registra entrada de estudante em uma bancada |
| `POST` | `/api/groups/:id/leave` | Registra saída de estudante de uma bancada |
| `PUT` | `/api/groups/:id` | Atualiza nome, avatar, moedas, prioridade e ficha parlamentar da bancada |
| `POST` | `/api/round/timer` | Controla o cronômetro (`start`, `pause`, `extend`, `toggleLock`) |
| `POST` | `/api/round/reset` | Zera as alocações, fichas e reinicia o cronômetro para 20 minutos |
