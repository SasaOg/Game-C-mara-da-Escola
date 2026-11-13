import React, { useState, useEffect, useRef } from 'react';
import { GroupData, Pillar, AvatarConfig } from '../types';
import { PILLARS } from '../pillarsData';
import { PixelAvatar } from '../components/PixelAvatar';
import { AvatarCreator } from '../components/AvatarCreator';
import { PixelCoin, PixelChest, PillarIcon } from '../components/PixelIcons';
import { sound } from '../sound';
import { realtimeClient } from '../api';
import {
  Users,
  Lightbulb,
  Plus,
  Minus,
  CheckCircle,
  FileText,
  Clock,
  Sparkles,
  ArrowLeft,
  Volume2,
  VolumeX,
  Edit,
} from 'lucide-react';

interface GroupViewProps {
  initialGroupId?: string | null;
  onBackToHome: () => void;
  onOpenMural?: () => void;
  groups: { [id: string]: GroupData };
  timerSecondsLeft: number;
  isLocked: boolean;
}
export const GroupView: React.FC<GroupViewProps> = ({
  initialGroupId,
  onBackToHome,
  onOpenMural,
  groups,
  timerSecondsLeft,
  isLocked,
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(initialGroupId || null);
  const [isEditingAvatar, setIsEditingAvatar] = useState<boolean>(false);
  const [selectedIdeaPillar, setSelectedIdeaPillar] = useState<Pillar | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [hasDismissedSubmitModal, setHasDismissedSubmitModal] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState(sound.isMuted);

  const group = selectedGroupId ? groups[selectedGroupId] : null;

  // Local working copy of allocations and amendment answers
  const [allocations, setAllocations] = useState<{ [id: string]: number }>({});
  const [priorityPillar, setPriorityPillar] = useState<string>('');
  const [actionPlan, setActionPlan] = useState<string>('');
  const [excludedReason, setExcludedReason] = useState<string>('');

  // Refs to prevent remote updates from stomping local user keystrokes
  const loadedGroupIdRef = useRef<string | null>(null);
  const prevStatusRef = useRef<string | null>(null);
  const isTypingPlanRef = useRef<boolean>(false);
  const isTypingExcludedRef = useRef<boolean>(false);
  const planDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const excludedDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestActionPlanRef = useRef<string>('');
  const latestExcludedReasonRef = useRef<string>('');

  useEffect(() => {
    latestActionPlanRef.current = actionPlan;
  }, [actionPlan]);

  useEffect(() => {
    latestExcludedReasonRef.current = excludedReason;
  }, [excludedReason]);

  // Sync with group data cleanly without resetting text while typing
  useEffect(() => {
    if (!group) return;

    if (loadedGroupIdRef.current !== group.id) {
      loadedGroupIdRef.current = group.id;
      setAllocations(group.allocations || {});
      setPriorityPillar(group.priorityPillar || '');
      setActionPlan(group.actionPlan || '');
      setExcludedReason(group.excludedReason || '');
      return;
    }

    // Sync remote allocations and priority pillar
    setAllocations(group.allocations || {});
    if (group.priorityPillar !== undefined) {
      setPriorityPillar(group.priorityPillar);
    }

    // Only update text fields if the user is not currently typing in that field
    if (!isTypingPlanRef.current && group.actionPlan !== undefined && group.actionPlan !== latestActionPlanRef.current) {
      setActionPlan(group.actionPlan);
    }
    if (!isTypingExcludedRef.current && group.excludedReason !== undefined && group.excludedReason !== latestExcludedReasonRef.current) {
      setExcludedReason(group.excludedReason);
    }
  }, [group?.id, group?.allocations, group?.priorityPillar, group?.actionPlan, group?.excludedReason]);

  // Join group on selection
  useEffect(() => {
    if (selectedGroupId) {
      realtimeClient.joinGroup(selectedGroupId);
      return () => {
        realtimeClient.leaveGroup(selectedGroupId);
      };
    }
  }, [selectedGroupId]);

  // Synchronize submission ceremony across ALL participants in the same group
  useEffect(() => {
    if (!group) return;

    if (group.status === 'submitted') {
      // If status just became submitted while user was viewing, trigger ceremony for everyone!
      if (prevStatusRef.current !== 'submitted' && !hasDismissedSubmitModal) {
        sound.playGavel();
        setTimeout(() => sound.playFanfare(), 300);
        setShowSubmitModal(true);
      }
    } else {
      setHasDismissedSubmitModal(false);
    }
    prevStatusRef.current = group.status;
  }, [group?.status, hasDismissedSubmitModal]);

  const allocatedCoins = Object.values(allocations).reduce((sum, v) => sum + (v || 0), 0);
  const coinsRemaining = 10 - allocatedCoins;

  const handleSelectGroup = (id: string) => {
    sound.playClick();
    setSelectedGroupId(id);
    // User directly styles and selects their avatar when entering
    setIsEditingAvatar(true);
  };

  const handleSaveAvatar = (config: AvatarConfig, name: string) => {
    if (!selectedGroupId) return;
    const finalName = name.trim() || `Bancada do Grupo ${selectedGroupId}`;
    realtimeClient.updateGroup(selectedGroupId, {
      avatar: config,
      name: finalName,
      status: group?.status === 'submitted' ? 'submitted' : 'editing',
    });
    setIsEditingAvatar(false);
  };

  const handleAddCoin = (pillarId: string) => {
    if (coinsRemaining <= 0) {
      sound.playBuzz();
      return;
    }
    sound.playCoin();
    const updated = {
      ...allocations,
      [pillarId]: (allocations[pillarId] || 0) + 1,
    };
    setAllocations(updated);
    if (selectedGroupId) {
      realtimeClient.updateGroup(selectedGroupId, {
        allocations: updated,
        status: 'editing',
      });
    }
  };

  const handleRemoveCoin = (pillarId: string) => {
    const current = allocations[pillarId] || 0;
    if (current <= 0) {
      sound.playBuzz();
      return;
    }
    sound.playClick();
    const updated = { ...allocations };
    if (current === 1) {
      delete updated[pillarId];
    } else {
      updated[pillarId] = current - 1;
    }
    setAllocations(updated);
    if (selectedGroupId) {
      realtimeClient.updateGroup(selectedGroupId, {
        allocations: updated,
        status: 'editing',
      });
    }
  };

  const handleActionPlanChange = (val: string) => {
    setActionPlan(val);
    isTypingPlanRef.current = true;
    if (planDebounceRef.current) clearTimeout(planDebounceRef.current);
    planDebounceRef.current = setTimeout(() => {
      isTypingPlanRef.current = false;
      if (selectedGroupId) {
        realtimeClient.updateGroup(selectedGroupId, { actionPlan: val });
      }
    }, 450);
  };

  const handleActionPlanBlur = () => {
    if (planDebounceRef.current) {
      clearTimeout(planDebounceRef.current);
      planDebounceRef.current = null;
    }
    isTypingPlanRef.current = false;
    if (selectedGroupId) {
      realtimeClient.updateGroup(selectedGroupId, { actionPlan });
    }
  };

  const handleExcludedReasonChange = (val: string) => {
    setExcludedReason(val);
    isTypingExcludedRef.current = true;
    if (excludedDebounceRef.current) clearTimeout(excludedDebounceRef.current);
    excludedDebounceRef.current = setTimeout(() => {
      isTypingExcludedRef.current = false;
      if (selectedGroupId) {
        realtimeClient.updateGroup(selectedGroupId, { excludedReason: val });
      }
    }, 450);
  };

  const handleExcludedReasonBlur = () => {
    if (excludedDebounceRef.current) {
      clearTimeout(excludedDebounceRef.current);
      excludedDebounceRef.current = null;
    }
    isTypingExcludedRef.current = false;
    if (selectedGroupId) {
      realtimeClient.updateGroup(selectedGroupId, { excludedReason });
    }
  };

  const handleSubmitAmendment = () => {
    if (allocatedCoins !== 10) {
      sound.playBuzz();
      alert('Distribua exatamente as 10 moedas de ouro (R$ 1 milhão) antes de protocolar a emenda!');
      return;
    }
    if (!priorityPillar) {
      sound.playBuzz();
      alert('Selecione o Pilar Prioritário nº 1 da sua bancada!');
      return;
    }
    if (!actionPlan.trim() || !excludedReason.trim()) {
      sound.playBuzz();
      alert('Por favor, responda as duas perguntas da Ficha Parlamentar!');
      return;
    }

    if (planDebounceRef.current) clearTimeout(planDebounceRef.current);
    if (excludedDebounceRef.current) clearTimeout(excludedDebounceRef.current);
    isTypingPlanRef.current = false;
    isTypingExcludedRef.current = false;

    sound.playGavel();
    setTimeout(() => sound.playFanfare(), 300);

    if (selectedGroupId) {
      realtimeClient.updateGroup(selectedGroupId, {
        allocations,
        priorityPillar,
        actionPlan: actionPlan.trim(),
        excludedReason: excludedReason.trim(),
        status: 'submitted',
      });
    }
    setShowSubmitModal(true);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleSound = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  // --- STEP 1: GROUP SELECTION (1 TO 10) ---
  if (!selectedGroupId || !group) {
    return (
      <div className="min-h-screen bg-sky-400 p-4 md:p-8 flex flex-col justify-between font-pixel-body select-none">
        <div className="max-w-4xl mx-auto w-full">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => {
                sound.playClick();
                onBackToHome();
              }}
              className="pixel-btn px-4 py-2 bg-zinc-800 text-yellow-300 font-pixel-title text-xs flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>INÍCIO</span>
            </button>
            <div className="bg-zinc-900 border-2 border-zinc-700 px-3 py-1 font-pixel-title text-xs text-yellow-400">
              SALA DE AULA · 10 BANCADAS
            </div>
          </div>

          {/* Title Header */}
          <div className="text-center bg-zinc-900/90 border-4 border-zinc-700 p-6 pixel-box-stone mb-6">
            <h1 className="font-pixel-title text-2xl sm:text-3xl text-yellow-400 mb-2">
              ESCOLHA O NÚMERO DO SEU GRUPO
            </h1>
            <p className="text-zinc-200 text-xl max-w-xl mx-auto">
              Selecione o grupo correspondente à sua equipe. Todos os membros do grupo podem entrar com o mesmo número!
            </p>
          </div>

          {/* 10 Group Cards Grid (Avatares removidos aqui conforme solicitado; cada grupo tem seu box limpo e ao clicar o usuário monta seu avatar) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
            {[...Array(10)].map((_, i) => {
              const id = String(i + 1);
              const g = groups[id];
              const isOccupied = g && (g.memberCount > 0 || g.status !== 'waiting');
              const isSubmitted = g && g.status === 'submitted';
              const displayName = g?.name || `Bancada do Grupo ${id}`;

              return (
                <button
                  key={id}
                  onClick={() => handleSelectGroup(id)}
                  className={`pixel-btn p-3 flex flex-col items-center justify-between transition-all cursor-pointer text-left ${
                    isSubmitted
                      ? 'bg-emerald-900/90 border-emerald-500 hover:brightness-110'
                      : isOccupied
                      ? 'bg-amber-900/90 border-yellow-500 hover:brightness-110'
                      : 'bg-zinc-800/95 border-zinc-600 hover:border-yellow-400'
                  }`}
                >
                  <div className="w-full flex items-center justify-between text-xs font-pixel-title mb-1">
                    <span className="text-yellow-400">GRUPO {id}</span>
                    <span
                      className={`px-1.5 py-0.5 text-[9px] ${
                        isSubmitted
                          ? 'bg-emerald-600 text-white'
                          : isOccupied
                          ? 'bg-yellow-500 text-zinc-900'
                          : 'bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      {g ? `${g.memberCount} ON` : '0 ON'}
                    </span>
                  </div>

                  {/* Clean Iconic Group Block (Zero avatars during selection) */}
                  <div className="w-full py-3.5 sm:py-5 bg-gradient-to-b from-amber-400 to-yellow-500 border-2 border-amber-600 shadow-inner flex flex-col items-center justify-center my-1.5 sm:my-2">
                    <span className="font-pixel-title text-2xl sm:text-3xl text-zinc-950 font-bold drop-shadow-sm">
                      {id}
                    </span>
                    <span className="font-pixel-title text-[8px] sm:text-[9px] text-amber-950 mt-0.5 uppercase tracking-wider font-bold">
                      BANCADA
                    </span>
                  </div>

                  <div className="w-full text-center mt-1 border-t border-zinc-700 pt-1.5">
                    <span className="text-sm sm:text-base text-zinc-100 block truncate font-bold">
                      {displayName}
                    </span>
                    <span className="text-[10px] sm:text-xs text-yellow-300 font-pixel-title block mt-1">
                      {isSubmitted
                        ? '✔ ENVIADA'
                        : isOccupied
                        ? '⚡ EM ANDAMENTO'
                        : 'ESCOLHER AVATAR ▶'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-zinc-900 font-pixel-title text-[11px] mt-6">
          ESCOLA MM · ATIVIDADE PARLAMENTAR DE SALA DE AULA
        </div>
      </div>
    );
  }

  // --- STEP 2: AVATAR CUSTOMIZER ---
  if (isEditingAvatar) {
    return (
      <div className="min-h-screen max-h-screen overflow-y-auto bg-sky-400 p-3 sm:p-5 md:p-6 flex flex-col items-center justify-start font-pixel-body select-none">
        <div className="my-auto w-full max-w-2xl py-2 sm:py-4">
          <AvatarCreator
            groupId={selectedGroupId}
            initialConfig={group.status === 'waiting' ? undefined : group.avatar}
            initialName={group.name}
            onSave={handleSaveAvatar}
            onCancel={group.status !== 'waiting' ? () => setIsEditingAvatar(false) : undefined}
          />
        </div>
      </div>
    );
  }

  // --- STEP 3 & 4: MAIN GROUP SCREEN (BUDGET & AMENDMENT) ---
  return (
    <div className="min-h-screen overflow-x-hidden overflow-y-auto bg-sky-400 p-3 sm:p-5 md:p-8 font-pixel-body select-none flex flex-col justify-between">
      <div className="max-w-5xl mx-auto w-full">
        {/* Top Header Bar */}
        <header className="bg-zinc-900 border-4 border-zinc-700 pixel-box-stone p-3 md:p-4 mb-4 text-zinc-100 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          {/* Avatar + Group Info */}
          <div className="flex items-center gap-3">
            <div className="relative bg-stone-100 p-1 border-2 border-yellow-400 cursor-pointer shadow" onClick={() => setIsEditingAvatar(true)} title="Clique para editar avatar">
              <PixelAvatar config={group.avatar} size="sm" />
              <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-zinc-900 p-0.5 rounded-none text-[8px] shadow">
                <Edit size={10} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 font-pixel-title text-xs md:text-sm">
                  GRUPO {group.id}
                </span>
                <span className="text-zinc-400 text-xs hidden sm:inline">·</span>
                <span className="text-zinc-300 text-sm hidden sm:inline flex items-center gap-1">
                  <Users size={14} className="text-yellow-400" />
                  {group.memberCount} deputados conectados
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide truncate max-w-xs md:max-w-md">
                {group.name}
              </h2>
            </div>
          </div>

          {/* Right Header Controls: Timer, Sound & High-Contrast Change Group Button */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Timer countdown */}
            <div className={`px-2.5 sm:px-3 py-1.5 border-2 flex items-center gap-1.5 font-pixel-title text-xs md:text-sm ${
              timerSecondsLeft < 180 ? 'bg-red-950 border-red-500 text-red-300 animate-pulse' : 'bg-zinc-950 border-zinc-700 text-yellow-300'
            }`}>
              <Clock size={16} />
              <span>{formatTimer(timerSecondsLeft)}</span>
            </div>

            {/* Mute button */}
            <button
              onClick={toggleSound}
              className="pixel-btn p-2 bg-zinc-800 text-yellow-300 cursor-pointer shadow"
              title="Alternar Áudio"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            {/* High-Contrast Change Group button */}
            <button
              onClick={() => {
                sound.playClick();
                setSelectedGroupId(null);
              }}
              className="pixel-btn px-2.5 sm:px-3 py-1.5 bg-amber-500 hover:bg-amber-400 border-2 border-yellow-200 text-stone-950 font-pixel-title text-[10px] sm:text-xs cursor-pointer shadow-md font-bold active:scale-95 transition-transform"
              title="Trocar de bancada parlamentar"
            >
              ⇄ TROCAR GRUPO
            </button>
          </div>
        </header>

        {/* CHEST ("BAÚ") WITH BUDGET STATUS */}
        <div className="mb-4">
          <PixelChest coinsLeft={coinsRemaining} totalCoins={10} />
          <div className="mt-2 bg-zinc-900 border-2 border-zinc-700 p-2 flex items-center justify-between text-base sm:text-lg text-zinc-200">
            <span>
              Orçamento Total:{' '}
              <strong className="text-yellow-400">R$ 1.000.000 (10 moedas de R$ 100 mil)</strong>
            </span>
            <span>
              Distribuído:{' '}
              <strong className={allocatedCoins === 10 ? 'text-emerald-400' : 'text-amber-400'}>
                R$ {(allocatedCoins * 100000).toLocaleString('pt-BR')} ({allocatedCoins}/10)
              </strong>
            </span>
          </div>
        </div>

        {/* STATUS BANNER IF SUBMITTED */}
        {group.status === 'submitted' && (
          <div className="bg-emerald-900 border-4 border-emerald-500 p-3 mb-4 pixel-box-stone text-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle size={24} className="text-emerald-400 shrink-0" />
              <div>
                <span className="font-pixel-title text-sm text-yellow-300 block">
                  EMENDA PROTOCOLADA NA CÂMARA!
                </span>
                <span className="text-base text-zinc-200">
                  Sua proposta está visível no mural do professor. Você pode continuar ajustando se desejar.
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="pixel-btn pixel-btn-gold px-3 py-1 font-pixel-title text-xs text-zinc-900 cursor-pointer shrink-0"
            >
              VER PROTOCOLO
            </button>
          </div>
        )}

        {/* 10 PILLARS GRID */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-pixel-title text-sm md:text-base text-zinc-900 drop-shadow">
              DISTRIBUA AS MOEDAS NOS 10 PILARES DA ESCOLA:
            </h3>
            <span className="text-sm font-pixel-title text-zinc-900">
              {coinsRemaining > 0 ? `Restam ${coinsRemaining} moedas` : '✔ 10 moedas alocadas'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PILLARS.map((pillar) => {
              const currentCoins = allocations[pillar.id] || 0;
              const pillarReais = currentCoins * 100000;

              return (
                <div
                  key={pillar.id}
                  className={`border-4 p-3 pixel-box-stone flex flex-col justify-between transition-all ${
                    currentCoins > 0
                      ? 'bg-zinc-800 border-yellow-500'
                      : 'bg-zinc-800/90 border-zinc-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Pillar Pixel Art Icon */}
                    <div
                      className="p-2 border-2 border-black/40 shrink-0"
                      style={{ backgroundColor: pillar.color }}
                    >
                      <PillarIcon type={pillar.iconType} size={32} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-yellow-400 font-pixel-title text-xs">
                          #{pillar.number} · {pillar.title}
                        </span>
                        <button
                          onClick={() => {
                            sound.playClick();
                            setSelectedIdeaPillar(pillar);
                          }}
                          className="pixel-btn px-2 py-0.5 bg-zinc-700 text-yellow-300 text-[10px] font-pixel-title flex items-center gap-1 cursor-pointer hover:bg-zinc-600"
                        >
                          <Lightbulb size={12} />
                          <span>IDEIAS</span>
                        </button>
                      </div>
                      <p className="text-zinc-300 text-base leading-tight mt-0.5 line-clamp-2">
                        {pillar.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Coin Controls & Real Value */}
                  <div className="mt-3 pt-2 border-t border-zinc-700 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-pixel-title text-sm text-yellow-400">
                        {currentCoins}
                      </span>
                      <PixelCoin size="sm" />
                      <span className="text-zinc-400 text-xs font-pixel-body ml-1">
                        = R$ {pillarReais.toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRemoveCoin(pillar.id)}
                        disabled={currentCoins <= 0}
                        className="pixel-btn w-9 h-9 flex items-center justify-center bg-zinc-700 text-white font-pixel-title text-sm cursor-pointer disabled:opacity-40"
                        title="Remover moeda"
                      >
                        <Minus size={16} />
                      </button>
                      <button
                        onClick={() => handleAddCoin(pillar.id)}
                        disabled={coinsRemaining <= 0}
                        className="pixel-btn pixel-btn-gold w-9 h-9 flex items-center justify-center text-zinc-900 font-pixel-title text-sm cursor-pointer disabled:opacity-40"
                        title="Adicionar moeda"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 4: FICHA PARLAMENTAR (JUSTIFICATION FORM) */}
        <div className="bg-zinc-900 border-4 border-zinc-700 p-4 md:p-6 pixel-box-stone mb-6 text-zinc-100">
          <div className="flex items-center gap-2 border-b-2 border-zinc-700 pb-2 mb-4">
            <FileText size={22} className="text-yellow-400" />
            <h3 className="font-pixel-title text-base md:text-lg text-yellow-400">
              FICHA DA EMENDA PARLAMENTAR
            </h3>
          </div>

          <div className="space-y-4 text-lg">
            {/* 1. Pilar Prioritário */}
            <div>
              <label className="block font-pixel-title text-xs md:text-sm text-zinc-300 mb-1.5">
                1. QUAL O PILAR PRIORITÁRIO Nº 1 DA SUA BANCADA?
              </label>
              <select
                value={priorityPillar}
                onChange={(e) => {
                  sound.playClick();
                  setPriorityPillar(e.target.value);
                  if (selectedGroupId) {
                    realtimeClient.updateGroup(selectedGroupId, {
                      priorityPillar: e.target.value,
                    });
                  }
                }}
                className="w-full bg-zinc-950 border-2 border-zinc-600 px-3 py-2 text-xl font-pixel-body text-yellow-300 focus:outline-none focus:border-yellow-400"
              >
                <option value="">-- Selecione o pilar prioritário --</option>
                {PILLARS.map((p) => (
                  <option key={p.id} value={p.title}>
                    #{p.number} - {p.title} ({allocations[p.id] || 0} moedas)
                  </option>
                ))}
              </select>
            </div>

            {/* 2. O que fariam primeiro e por quê? */}
            <div>
              <label className="block font-pixel-title text-xs md:text-sm text-zinc-300 mb-1.5">
                2. O QUE VOCÊS FARIAM PRIMEIRO E POR QUÊ?
              </label>
              <textarea
                value={actionPlan}
                onChange={(e) => handleActionPlanChange(e.target.value)}
                onBlur={handleActionPlanBlur}
                rows={3}
                placeholder="Explique a primeira ação concreta que a escola deve realizar com esses recursos..."
                className="w-full bg-zinc-950 border-2 border-zinc-600 p-3 text-xl font-pixel-body text-zinc-100 focus:outline-none focus:border-yellow-400 placeholder:text-zinc-600"
              />
            </div>

            {/* 3. O que ficou de fora e por quê? */}
            <div>
              <label className="block font-pixel-title text-xs md:text-sm text-zinc-300 mb-1.5">
                3. O QUE FICOU DE FORA E POR QUÊ?
              </label>
              <textarea
                value={excludedReason}
                onChange={(e) => handleExcludedReasonChange(e.target.value)}
                onBlur={handleExcludedReasonBlur}
                rows={3}
                placeholder="Quais pilares receberam menos recursos ou ficaram de fora, e qual foi a justificativa da bancada?"
                className="w-full bg-zinc-950 border-2 border-zinc-600 p-3 text-xl font-pixel-body text-zinc-100 focus:outline-none focus:border-yellow-400 placeholder:text-zinc-600"
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="mt-6 pt-4 border-t-2 border-zinc-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-zinc-400 text-base">
              {group.status === 'submitted' ? (
                <span className="text-emerald-400 font-pixel-title text-xs flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                  EMENDA PROTOCOLADA POR UM INTEGRANTE DO GRUPO!
                </span>
              ) : allocatedCoins === 10 ? (
                <span className="text-emerald-400 font-pixel-title text-xs">
                  ✔ 10 MOEDAS DISTRIBUÍDAS CORRETAMENTE!
                </span>
              ) : (
                <span className="text-amber-400 font-pixel-title text-xs">
                  ⚠ É PRECISO DISTRIBUIR TODAS AS 10 MOEDAS (FALTAM {coinsRemaining})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {group.status === 'submitted' ? (
                <>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setShowSubmitModal(true);
                    }}
                    className="flex-1 sm:flex-initial pixel-btn pixel-btn-gold py-3 px-4 font-pixel-title text-xs text-zinc-900 cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    <Sparkles size={16} />
                    <span>VER CERIMÔNIA DA CÂMARA</span>
                  </button>
                  <button
                    onClick={() => {
                      sound.playClick();
                      if (confirm('Deseja reabrir a emenda do grupo para novos ajustes de toda a equipe?')) {
                        if (selectedGroupId) {
                          realtimeClient.updateGroup(selectedGroupId, { status: 'editing' });
                        }
                      }
                    }}
                    className="pixel-btn px-3 py-3 bg-zinc-800 text-zinc-300 font-pixel-title text-xs cursor-pointer hover:bg-zinc-700"
                    title="Permitir novos ajustes pela bancada"
                  >
                    REABRIR
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSubmitAmendment}
                  disabled={allocatedCoins !== 10}
                  className="w-full sm:w-auto pixel-btn pixel-btn-green py-3.5 px-6 flex items-center justify-center gap-2 text-white font-pixel-title text-sm cursor-pointer shadow-xl disabled:opacity-40"
                >
                  <Sparkles size={18} className="text-yellow-300" />
                  <span>PROTOCOLAR EMENDA NA CÂMARA</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL DE IDEIAS DE INVESTIMENTO --- */}
      {selectedIdeaPillar && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-zinc-800 border-4 border-yellow-500 p-5 max-w-lg w-full pixel-box-stone text-zinc-100 font-pixel-body">
            <div className="flex items-start justify-between border-b-2 border-zinc-700 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <PillarIcon type={selectedIdeaPillar.iconType} size={32} />
                <h4 className="font-pixel-title text-base text-yellow-400">
                  {selectedIdeaPillar.title}
                </h4>
              </div>
              <button
                onClick={() => setSelectedIdeaPillar(null)}
                className="pixel-btn px-2 py-0.5 bg-zinc-700 text-zinc-300 font-pixel-title text-xs cursor-pointer"
              >
                X
              </button>
            </div>

            <p className="text-zinc-300 text-lg mb-3">
              Exemplos de como este pilar pode transformar a escola:
            </p>

            <ul className="space-y-2 mb-5">
              {selectedIdeaPillar.examples.map((ex, idx) => (
                <li
                  key={idx}
                  className="bg-zinc-900 border border-zinc-700 p-2.5 text-lg text-white flex items-start gap-2"
                >
                  <span className="text-yellow-400 font-pixel-title text-xs mt-1">▶</span>
                  <span>{ex}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => setSelectedIdeaPillar(null)}
              className="w-full pixel-btn pixel-btn-gold py-2 font-pixel-title text-xs text-zinc-900 cursor-pointer"
            >
              ENTENDIDO
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL DA CERIMÔNIA DA CÂMARA MUNICIPAL (SIMULAÇÃO COMPARTILHADA) --- */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 sm:p-5">
          <div className="bg-zinc-900 border-4 border-yellow-400 p-4 sm:p-6 md:p-8 max-w-lg w-full pixel-box-stone text-center text-zinc-100 font-pixel-body shadow-2xl relative max-h-[92vh] overflow-y-auto">
            {/* Session Header Badge */}
            <div className="inline-block bg-yellow-400 text-zinc-950 font-pixel-title text-[9px] sm:text-[11px] px-3 py-1 mb-2 border border-yellow-600 shadow">
              🏛️ CÂMARA MUNICIPAL DA CIDADE · SESSÃO OFICIAL
            </div>

            {/* Simulated Rostrum & Animated Deputy Avatar */}
            <div className="py-2 flex flex-col items-center justify-center relative my-2">
              <div className="relative">
                <PixelAvatar config={group.avatar} size="lg" isWalking={true} />
                {/* Official Sealed Document Scroll in Hands */}
                <div className="absolute -bottom-2 -right-3 bg-amber-100 border-2 border-amber-700 px-2 py-0.5 font-pixel-title text-[9px] text-zinc-950 shadow-md">
                  📜 EMENDA Nº {group.id}/2026
                </div>
              </div>

              {/* Wooden Chamber Podium / Rostrum Base */}
              <div className="w-36 h-6 bg-amber-900 border-t-2 border-amber-700 border-b-2 border-amber-950 mt-1 flex items-center justify-center shadow-lg">
                <div className="w-2 h-2 bg-yellow-400 rounded-full" title="Microfone da Câmara" />
              </div>
            </div>

            <h3 className="font-pixel-title text-lg sm:text-2xl text-yellow-400 mb-1">
              EMENDA PROTOCOLADA!
            </h3>
            <p className="text-zinc-200 text-lg sm:text-xl mb-3">
              O deputado da <strong className="text-white">{group.name}</strong> entregou oficialmente a emenda de{' '}
              <strong className="text-yellow-300">R$ 1.000.000</strong> na Mesa da Câmara.
            </p>

            {/* Shared Group Notice */}
            <div className="bg-sky-950 border-2 border-sky-600 p-2.5 mb-3 text-sky-200 text-sm sm:text-base text-left flex items-start gap-2 shadow-inner">
              <span className="text-yellow-400 font-pixel-title text-xs mt-0.5">📢</span>
              <span>
                <strong>Aviso a todos os integrantes:</strong> Qualquer membro deste grupo conectado no celular ou computador agora vê a emenda registrada e enviada em tempo real ao telão do professor!
              </span>
            </div>

            {/* Quick Summary Card */}
            <div className="bg-zinc-950 border border-zinc-700 p-3 text-left text-base text-zinc-300 mb-4 space-y-1">
              <div>
                Prioridade Máxima:{' '}
                <strong className="text-yellow-400">{group.priorityPillar || priorityPillar || 'Informada pelo grupo'}</strong>
              </div>
              <div className="truncate">
                Primeira Ação:{' '}
                <span className="text-zinc-200">{group.actionPlan || actionPlan}</span>
              </div>
              <div className="truncate">
                O que ficou de fora:{' '}
                <span className="text-zinc-200">{group.excludedReason || excludedReason}</span>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              {onOpenMural && (
                <button
                  onClick={() => {
                    sound.playClick();
                    setHasDismissedSubmitModal(true);
                    setShowSubmitModal(false);
                    onOpenMural();
                  }}
                  className="w-full sm:flex-1 pixel-btn pixel-btn-blue py-3 font-pixel-title text-xs text-white cursor-pointer"
                >
                  VER NO MURAL DA TURMA
                </button>
              )}
              <button
                onClick={() => {
                  sound.playClick();
                  setHasDismissedSubmitModal(true);
                  setShowSubmitModal(false);
                }}
                className="w-full sm:flex-1 pixel-btn pixel-btn-green py-3 font-pixel-title text-xs text-white cursor-pointer"
              >
                VOLTAR À BANCADA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
