export interface AvatarConfig {
  skin: number; // 0 to 5
  hairStyle: number; // 0 to 5
  hairColor: string; // hex
  outfit: number; // 0 to 4 (terno, blazer, camiseta grêmio, moletom, uniforme escolar)
  outfitColor: string; // hex
  accessory: number; // 0 to 4 (nenhum, gravata, faixa deputado, óculos, crachá)
}

export interface GroupAllocations {
  [pillarId: string]: number;
}

export interface GroupData {
  id: string; // '1' to '10'
  name: string; // 'Bancada do Wi-Fi', etc.
  avatar: AvatarConfig;
  allocations: GroupAllocations;
  priorityPillar: string;
  actionPlan: string;
  excludedReason: string;
  status: 'waiting' | 'editing' | 'submitted';
  memberCount: number;
  lastActive: number;
}

export interface RoundState {
  timerSecondsLeft: number;
  isRunning: boolean;
  isLocked: boolean;
  totalTimeMinutes: number;
  totalStudentsConnected: number;
  lastResetAt: number;
}

export interface AppState {
  round: RoundState;
  groups: { [id: string]: GroupData };
}

export interface Pillar {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  iconType: string;
  color: string;
  examples: string[];
}
