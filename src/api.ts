import { AppState, GroupData, RoundState } from './types';

// Fallback initial state
const defaultGroups: { [id: string]: GroupData } = {};
for (let i = 1; i <= 10; i++) {
  const id = String(i);
  defaultGroups[id] = {
    id,
    name: `Bancada do Grupo ${id}`,
    avatar: {
      skin: (i - 1) % 6,
      hairStyle: (i * 2) % 6,
      hairColor: '#1c1917',
      outfit: (i - 1) % 5,
      outfitColor: '#1e293b',
      accessory: 1,
    },
    allocations: {},
    priorityPillar: '',
    actionPlan: '',
    excludedReason: '',
    status: 'waiting',
    memberCount: 0,
    lastActive: Date.now(),
  };
}

export const initialAppState: AppState = {
  round: {
    timerSecondsLeft: 20 * 60,
    isRunning: false,
    isLocked: false,
    totalTimeMinutes: 20,
    totalStudentsConnected: 0,
    lastResetAt: Date.now(),
  },
  groups: defaultGroups,
};

export class RealtimeClient {
  private listeners: ((state: AppState) => void)[] = [];
  private currentState: AppState = initialAppState;
  private eventSource: EventSource | null = null;
  private bc: BroadcastChannel | null = null;

  constructor() {
    // Try localStorage load first for instant render
    const saved = localStorage.getItem('camara_offline_state');
    if (saved) {
      try {
        this.currentState = JSON.parse(saved);
      } catch {
        // ignore
      }
    }

    // Set up BroadcastChannel for instant local multi-tab sync
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.bc = new BroadcastChannel('camara_sync_channel');
        this.bc.onmessage = (event) => {
          if (event.data && event.data.round && event.data.groups) {
            this.currentState = event.data;
            this.notify();
          }
        };
      } catch {
        // ignore
      }
    }

    this.connectSSE();
  }

  private connectSSE() {
    try {
      this.eventSource = new EventSource('/api/events');

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.round && data.groups) {
            this.currentState = data;
            localStorage.setItem('camara_offline_state', JSON.stringify(data));
            this.notify();
            // Sync with local tabs
            this.bc?.postMessage(data);
          }
        } catch {
          // parse error
        }
      };

      this.eventSource.onerror = () => {
        // Reconnect after 3s
        this.eventSource?.close();
        setTimeout(() => this.connectSSE(), 3000);
      };
    } catch {
      // Offline fallback
    }
  }

  public subscribe(cb: (state: AppState) => void): () => void {
    this.listeners.push(cb);
    cb(this.currentState);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.currentState));
  }

  public getState(): AppState {
    return this.currentState;
  }

  public async joinGroup(groupId: string): Promise<void> {
    try {
      await fetch(`/api/groups/${groupId}/join`, { method: 'POST' });
    } catch {
      // offline fallback
      if (this.currentState.groups[groupId]) {
        this.currentState.groups[groupId].memberCount += 1;
        this.notify();
      }
    }
  }

  public async leaveGroup(groupId: string): Promise<void> {
    try {
      await fetch(`/api/groups/${groupId}/leave`, { method: 'POST' });
    } catch {
      // offline fallback
    }
  }

  public async updateGroup(groupId: string, data: Partial<GroupData>): Promise<void> {
    // Optimistic local update
    if (this.currentState.groups[groupId]) {
      this.currentState.groups[groupId] = {
        ...this.currentState.groups[groupId],
        ...data,
        lastActive: Date.now(),
      };
      this.notify();
      this.bc?.postMessage(this.currentState);
      localStorage.setItem('camara_offline_state', JSON.stringify(this.currentState));
    }

    try {
      await fetch(`/api/groups/${groupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch {
      // local state already updated
    }
  }

  public async controlTimer(action: 'start' | 'pause' | 'extend' | 'toggleLock', secondsToAdd?: number): Promise<void> {
    if (action === 'start') this.currentState.round.isRunning = true;
    if (action === 'pause') this.currentState.round.isRunning = false;
    if (action === 'extend') this.currentState.round.timerSecondsLeft += secondsToAdd || 60;
    if (action === 'toggleLock') this.currentState.round.isLocked = !this.currentState.round.isLocked;
    this.notify();

    try {
      await fetch('/api/round/timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, secondsToAdd }),
      });
    } catch {
      // offline fallback
    }
  }

  public async resetRound(): Promise<void> {
    try {
      await fetch('/api/round/reset', { method: 'POST' });
    } catch {
      this.currentState = initialAppState;
      this.notify();
    }
  }
}

export const realtimeClient = new RealtimeClient();
