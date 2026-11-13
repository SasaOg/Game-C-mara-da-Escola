import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory data store with disk persistence fallback
interface AvatarConfig {
  skin: number;
  hairStyle: number;
  hairColor: string;
  outfit: number;
  outfitColor: string;
  accessory: number;
}

interface GroupData {
  id: string;
  name: string;
  avatar: AvatarConfig;
  allocations: { [pillarId: string]: number };
  priorityPillar: string;
  actionPlan: string;
  excludedReason: string;
  status: 'waiting' | 'editing' | 'submitted';
  memberCount: number;
  lastActive: number;
}

interface RoundState {
  timerSecondsLeft: number;
  isRunning: boolean;
  isLocked: boolean;
  totalTimeMinutes: number;
  totalStudentsConnected: number;
  lastResetAt: number;
}

const DEFAULT_INITIAL_AVATAR: AvatarConfig = {
  skin: 2, // Tom 3 (Morena Canela)
  hairStyle: 2, // Longo Solto com Mechas
  hairColor: '#18181b', // Preto Ébano
  outfit: 1, // Blazer Moderno
  outfitColor: '#b91c1c', // Vinho Nobre
  accessory: 2, // Faixa de Deputada
};

function createInitialGroups(): { [id: string]: GroupData } {
  const groups: { [id: string]: GroupData } = {};
  for (let i = 1; i <= 10; i++) {
    const id = String(i);
    groups[id] = {
      id,
      name: `Bancada do Grupo ${id}`,
      avatar: { ...DEFAULT_INITIAL_AVATAR },
      allocations: {},
      priorityPillar: '',
      actionPlan: '',
      excludedReason: '',
      status: 'waiting',
      memberCount: 0,
      lastActive: Date.now(),
    };
  }
  return groups;
}

let groups = createInitialGroups();
let roundState: RoundState = {
  timerSecondsLeft: 20 * 60, // 20 minutes
  isRunning: false,
  isLocked: false,
  totalTimeMinutes: 20,
  totalStudentsConnected: 0,
  lastResetAt: Date.now(),
};

// Connected SSE clients
let sseClients: Response[] = [];

function cleanDeadClients() {
  sseClients = sseClients.filter((client) => {
    return !client.destroyed && !client.writableEnded && client.writable;
  });
}

function getConnectedCount(): number {
  cleanDeadClients();
  return sseClients.length;
}

function broadcastState() {
  cleanDeadClients();
  const currentCount = sseClients.length;
  const payload = JSON.stringify({
    round: {
      ...roundState,
      totalStudentsConnected: currentCount,
    },
    groups,
  });

  for (let i = sseClients.length - 1; i >= 0; i--) {
    const client = sseClients[i];
    try {
      if (client.writable && !client.destroyed) {
        client.write(`data: ${payload}\n\n`);
      } else {
        sseClients.splice(i, 1);
      }
    } catch {
      sseClients.splice(i, 1);
    }
  }
}

// Keep-alive heartbeat ping every 15s to prune stale mobile connections immediately
setInterval(() => {
  cleanDeadClients();
  for (let i = sseClients.length - 1; i >= 0; i--) {
    const client = sseClients[i];
    try {
      if (client.writable && !client.destroyed) {
        client.write(': ping\n\n');
      } else {
        sseClients.splice(i, 1);
      }
    } catch {
      sseClients.splice(i, 1);
    }
  }
}, 15000);

// Timer tick loop
setInterval(() => {
  if (roundState.isRunning && roundState.timerSecondsLeft > 0) {
    roundState.timerSecondsLeft -= 1;
    if (roundState.timerSecondsLeft === 0) {
      roundState.isRunning = false;
      // Teacher can extend if needed
    }
    broadcastState();
  }
}, 1000);

// --- API ENDPOINTS ---

// GET /api/state
app.get('/api/state', (req: Request, res: Response) => {
  res.json({
    round: {
      ...roundState,
      totalStudentsConnected: getConnectedCount(),
    },
    groups,
  });
});

// SSE endpoint: GET /api/events
app.get('/api/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  sseClients.push(res);

  // Send initial payload
  const initialPayload = JSON.stringify({
    round: {
      ...roundState,
      totalStudentsConnected: getConnectedCount(),
    },
    groups,
  });
  res.write(`data: ${initialPayload}\n\n`);

  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) {
      sseClients.splice(idx, 1);
    }
    broadcastState();
  });
});

// Join group: POST /api/groups/:id/join
app.post('/api/groups/:id/join', (req: Request, res: Response) => {
  const { id } = req.params;
  if (groups[id]) {
    groups[id].memberCount = (groups[id].memberCount || 0) + 1;
    groups[id].lastActive = Date.now();
    broadcastState();
    res.json({ success: true, group: groups[id] });
  } else {
    res.status(404).json({ error: 'Grupo não encontrado' });
  }
});

// Leave group: POST /api/groups/:id/leave
app.post('/api/groups/:id/leave', (req: Request, res: Response) => {
  const { id } = req.params;
  if (groups[id]) {
    groups[id].memberCount = Math.max(0, (groups[id].memberCount || 1) - 1);
    broadcastState();
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Grupo não encontrado' });
  }
});

// Update group: PUT /api/groups/:id
app.put('/api/groups/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  if (!groups[id]) {
    return res.status(404).json({ error: 'Grupo não encontrado' });
  }

  const { name, avatar, allocations, priorityPillar, actionPlan, excludedReason, status } = req.body;

  if (name !== undefined) groups[id].name = name;
  if (avatar !== undefined) groups[id].avatar = avatar;
  if (allocations !== undefined) groups[id].allocations = allocations;
  if (priorityPillar !== undefined) groups[id].priorityPillar = priorityPillar;
  if (actionPlan !== undefined) groups[id].actionPlan = actionPlan;
  if (excludedReason !== undefined) groups[id].excludedReason = excludedReason;
  if (status !== undefined) groups[id].status = status;

  groups[id].lastActive = Date.now();

  broadcastState();
  res.json({ success: true, group: groups[id] });
});

// Control timer: POST /api/round/timer
app.post('/api/round/timer', (req: Request, res: Response) => {
  const { action, secondsToAdd } = req.body;

  if (action === 'start') {
    roundState.isRunning = true;
  } else if (action === 'pause') {
    roundState.isRunning = false;
  } else if (action === 'extend') {
    roundState.timerSecondsLeft += secondsToAdd || 60;
  } else if (action === 'toggleLock') {
    roundState.isLocked = !roundState.isLocked;
  }

  broadcastState();
  res.json({ success: true, round: roundState });
});

// Reset round: POST /api/round/reset
app.post('/api/round/reset', (req: Request, res: Response) => {
  groups = createInitialGroups();
  roundState = {
    timerSecondsLeft: 20 * 60,
    isRunning: false,
    isLocked: false,
    totalTimeMinutes: 20,
    totalStudentsConnected: getConnectedCount(),
    lastResetAt: Date.now(),
  };

  broadcastState();
  res.json({ success: true, message: 'Rodada zerada com sucesso!' });
});

// --- VITE MIDDLEWARE / STATIC FILES ---
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, () => {
    console.log(`[Câmara da Escola] Servidor rodando na porta ${PORT}`);
  });
}

startServer();
