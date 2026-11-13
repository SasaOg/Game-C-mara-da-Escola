import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { GroupData, Pillar } from '../types';
import { PILLARS } from '../pillarsData';
import { PixelAvatar, DEFAULT_AGENDER_AVATAR } from '../components/PixelAvatar';
import { PixelCoin, PillarIcon } from '../components/PixelIcons';
import { sound } from '../sound';
import { realtimeClient } from '../api';
import {
  Users,
  Clock,
  Play,
  Pause,
  PlusCircle,
  RotateCcw,
  QrCode,
  Volume2,
  VolumeX,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

interface MuralViewProps {
  groups: { [id: string]: GroupData };
  timerSecondsLeft: number;
  isRunning: boolean;
  isLocked: boolean;
  totalStudentsConnected: number;
  onBackToHome: () => void;
}

export const MuralView: React.FC<MuralViewProps> = ({
  groups,
  timerSecondsLeft,
  isRunning,
  totalStudentsConnected,
  onBackToHome,
}) => {
  const [selectedGroupModal, setSelectedGroupModal] = useState<GroupData | null>(null);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(sound.isMuted);

  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Calculate live collective pillar coin totals across all 10 groups
  const pillarTotals: { [pillarId: string]: number } = {};
  PILLARS.forEach((p) => {
    pillarTotals[p.id] = 0;
  });

  Object.values(groups).forEach((g) => {
    if (g.allocations) {
      Object.entries(g.allocations).forEach(([pId, coins]) => {
        if (pillarTotals[pId] !== undefined) {
          pillarTotals[pId] += coins || 0;
        }
      });
    }
  });

  // Sort pillars by total coins invested (descending)
  const sortedPillars = [...PILLARS].sort(
    (a, b) => (pillarTotals[b.id] || 0) - (pillarTotals[a.id] || 0)
  );

  const totalCoinsInvestedAll = Object.values(pillarTotals).reduce((a, b) => a + b, 0);
  const maxPillarCoins = Math.max(...Object.values(pillarTotals), 1);

  // Group submission stats
  const submittedCount = Object.values(groups).filter((g) => g.status === 'submitted').length;
  const activeCount = Object.values(groups).filter(
    (g) => g.status === 'editing' || g.status === 'submitted'
  ).length;

  const currentAppUrl = typeof window !== 'undefined' ? window.location.origin : '';

  // Generate QR Code
  useEffect(() => {
    if (currentAppUrl) {
      QRCode.toDataURL(currentAppUrl, {
        width: 260,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch(() => {});
    }
  }, [currentAppUrl]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyLink = () => {
    sound.playClick();
    if (navigator.clipboard && currentAppUrl) {
      navigator.clipboard.writeText(currentAppUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const toggleSound = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  return (
    <div className="min-h-screen overflow-x-hidden overflow-y-auto bg-zinc-950 text-zinc-100 font-pixel-body select-none flex flex-col justify-between p-3 sm:p-5 md:p-6">
      {/* --- TOP CONTROL BAR (PROJECTOR HUD) --- */}
      <header className="bg-zinc-900 border-4 border-zinc-700 pixel-box-stone p-3 md:p-4 mb-4 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
        {/* Left: Title & School Branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onBackToHome();
            }}
            className="pixel-btn px-3 py-1.5 bg-zinc-800 text-yellow-300 font-pixel-title text-xs flex items-center gap-1.5 cursor-pointer"
            title="Voltar ao Início"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">INÍCIO</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-700 text-yellow-300 text-[10px] font-pixel-title px-2 py-0.5 border border-emerald-500">
                PROJETOR DA SALA
              </span>
              <span className="text-zinc-300 text-sm hidden md:inline font-bold">
                Escola MM
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-pixel-title text-yellow-400 tracking-wide mt-0.5">
              CÂMARA DA ESCOLA · MURAL DA TURMA
            </h1>
          </div>
        </div>

        {/* Center: Realtime Stats & Presence */}
        <div className="flex items-center gap-4 bg-zinc-950 border-2 border-zinc-700 px-4 py-2">
          <div className="flex items-center gap-2" title="Total de estudantes com a página aberta">
            <Users size={18} className="text-yellow-400" />
            <div>
              <div className="text-xs font-pixel-title text-zinc-400">ALUNOS CONECTADOS</div>
              <div className="text-xl font-bold text-yellow-300 leading-none">
                {totalStudentsConnected} presentes
              </div>
            </div>
          </div>

          <div className="w-px h-8 bg-zinc-700 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2">
            <div>
              <div className="text-xs font-pixel-title text-zinc-400">EMENDAS PROTOCOLADAS</div>
              <div className="text-xl font-bold text-emerald-400 leading-none">
                {submittedCount}/10 bancadas
              </div>
            </div>
          </div>
        </div>

        {/* Right: Timer & Interactive Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Timer Display */}
          <div
            className={`px-3 py-1.5 border-2 flex items-center gap-2 font-pixel-title text-lg ${
              timerSecondsLeft <= 120
                ? 'bg-red-950 border-red-500 text-red-300 animate-pulse'
                : 'bg-zinc-950 border-zinc-700 text-yellow-300'
            }`}
          >
            <Clock size={18} />
            <span>{formatTimer(timerSecondsLeft)}</span>
          </div>

          {/* Timer Controls */}
          {isRunning ? (
            <button
              onClick={() => {
                sound.playClick();
                realtimeClient.controlTimer('pause');
              }}
              className="pixel-btn px-2.5 py-1.5 bg-amber-800 text-white font-pixel-title text-xs flex items-center gap-1 cursor-pointer"
              title="Pausar Cronômetro"
            >
              <Pause size={14} />
              <span className="hidden md:inline">PAUSAR</span>
            </button>
          ) : (
            <button
              onClick={() => {
                sound.playClick();
                realtimeClient.controlTimer('start');
              }}
              className="pixel-btn pixel-btn-green px-2.5 py-1.5 text-white font-pixel-title text-xs flex items-center gap-1 cursor-pointer"
              title="Iniciar Cronômetro"
            >
              <Play size={14} />
              <span className="hidden md:inline">INICIAR</span>
            </button>
          )}

          {/* Extend Time Controls (+1m / +5m) */}
          <button
            onClick={() => {
              sound.playCoin();
              realtimeClient.controlTimer('extend', 60);
            }}
            className="pixel-btn pixel-btn-gold px-2.5 py-1.5 text-zinc-900 font-pixel-title text-xs flex items-center gap-1 cursor-pointer"
            title="Conceder +1 Minuto à turma"
          >
            <PlusCircle size={14} />
            <span>+1m</span>
          </button>

          <button
            onClick={() => {
              sound.playCoin();
              realtimeClient.controlTimer('extend', 300);
            }}
            className="pixel-btn pixel-btn-gold px-2.5 py-1.5 text-zinc-900 font-pixel-title text-xs flex items-center gap-1 cursor-pointer"
            title="Conceder +5 Minutos à turma"
          >
            <PlusCircle size={14} />
            <span>+5m</span>
          </button>

          {/* QR Code & Link Modal Trigger */}
          <button
            onClick={() => {
              sound.playClick();
              setShowQrModal(true);
            }}
            className="pixel-btn pixel-btn-blue px-3 py-1.5 text-white font-pixel-title text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Exibir QR Code e Link de Acesso para alunos"
          >
            <QrCode size={16} />
            <span className="hidden lg:inline">QR CODE & LINK</span>
          </button>

          {/* Audio toggle */}
          <button
            onClick={toggleSound}
            className="pixel-btn p-2 bg-zinc-800 text-yellow-300 cursor-pointer"
            title="Alternar Som"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Reset round button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="pixel-btn px-2.5 py-1.5 bg-red-950 border-red-800 text-red-300 font-pixel-title text-[10px] flex items-center gap-1 cursor-pointer"
            title="Zerar toda a rodada"
          >
            <RotateCcw size={12} />
            <span className="hidden xl:inline">ZERAR</span>
          </button>
        </div>
      </header>

      {/* --- MAIN SPLIT VIEW: RANKING (LEFT) & BANCADAS (RIGHT) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        {/* --- LEFT (7 COLS): RANKING AO VIVO DOS PILARES --- */}
        <section className="lg:col-span-7 bg-zinc-900 border-4 border-zinc-700 p-4 md:p-5 pixel-box-stone flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between border-b-2 border-zinc-700 pb-2 mb-3">
              <div>
                <h2 className="font-pixel-title text-lg md:text-xl text-yellow-400">
                  RANKING COLETIVO DE INVESTIMENTOS
                </h2>
                <p className="text-zinc-300 text-base">
                  Soma de todas as moedas distribuídas pelos grupos da escola
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-pixel-title text-zinc-400 block">TOTAL ALOCADO</span>
                <span className="text-xl font-bold text-yellow-300 font-pixel-title">
                  {totalCoinsInvestedAll} MOEDAS
                </span>
                <span className="text-xs text-zinc-400 font-pixel-body block">
                  R$ {(totalCoinsInvestedAll * 100000).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>

            {/* Horizontal Coins Bar Ranking */}
            <div className="space-y-2.5 mt-3">
              {sortedPillars.map((pillar, idx) => {
                const coins = pillarTotals[pillar.id] || 0;
                const percentage = totalCoinsInvestedAll > 0 ? Math.round((coins / totalCoinsInvestedAll) * 100) : 0;
                const fillWidth = maxPillarCoins > 0 ? (coins / maxPillarCoins) * 100 : 0;

                return (
                  <div
                    key={pillar.id}
                    className="bg-zinc-950 border-2 border-zinc-700 p-2 flex items-center gap-3 transition-all hover:border-yellow-500"
                  >
                    {/* Rank Position */}
                    <div className="w-7 font-pixel-title text-sm text-yellow-400 text-center shrink-0">
                      #{idx + 1}
                    </div>

                    {/* Pillar Icon */}
                    <div
                      className="p-1 border border-black shrink-0"
                      style={{ backgroundColor: pillar.color }}
                    >
                      <PillarIcon type={pillar.iconType} size={24} />
                    </div>

                    {/* Title & Progress Bar */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-base leading-tight mb-1">
                        <span className="font-bold text-white truncate max-w-xs sm:max-w-md">
                          {pillar.title}
                        </span>
                        <div className="flex items-center gap-2 shrink-0 font-pixel-title text-xs">
                          <span className="text-yellow-400">{coins} moedas</span>
                          <span className="text-zinc-400 text-[10px]">({percentage}%)</span>
                        </div>
                      </div>

                      {/* Stack of Coins / Visual Bar */}
                      <div className="w-full h-5 bg-zinc-900 border border-zinc-700 relative overflow-hidden flex items-center">
                        <div
                          className="h-full bg-gradient-to-r from-amber-600 via-yellow-500 to-yellow-400 transition-all duration-500 flex items-center px-1"
                          style={{ width: `${fillWidth}%` }}
                        >
                          {/* Mini coin dots */}
                          {coins > 0 && (
                            <div className="flex items-center gap-0.5 overflow-hidden">
                              {[...Array(Math.min(coins, 25))].map((_, ci) => (
                                <div
                                  key={ci}
                                  className="w-2.5 h-2.5 rounded-full bg-yellow-200 border border-amber-900 shrink-0"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t-2 border-zinc-700 flex items-center justify-between text-sm text-zinc-400 font-pixel-title">
            <span>ATUALIZAÇÃO EM TEMPO REAL VIA FIRESTORE</span>
            <span className="text-yellow-400">10 MOEDAS = R$ 1.000.000 POR GRUPO</span>
          </div>
        </section>

        {/* --- RIGHT (5 COLS): 10 BANCADAS CARDS --- */}
        <section className="lg:col-span-5 bg-zinc-900 border-4 border-zinc-700 p-4 md:p-5 pixel-box-stone flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between border-b-2 border-zinc-700 pb-2 mb-3">
              <div>
                <h2 className="font-pixel-title text-lg md:text-xl text-yellow-400">
                  BANCADAS PARLAMENTARES
                </h2>
                <p className="text-zinc-300 text-base">
                  Clique no card de um grupo para abrir a apresentação
                </p>
              </div>
              <span className="bg-zinc-800 border border-zinc-700 px-2 py-1 text-xs font-pixel-title text-zinc-300">
                {activeCount} ativas
              </span>
            </div>

            {/* 10 Group Cards List / Grid (Responsive to Desktop Screen Height) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[calc(100vh-270px)] min-h-[360px] overflow-y-auto pr-1">
              {[...Array(10)].map((_, i) => {
                const id = String(i + 1);
                const g = groups[id];
                const avatar = g?.avatar || DEFAULT_AGENDER_AVATAR;
                const name = g?.name || `Bancada do Grupo ${id}`;
                const isSubmitted = g?.status === 'submitted';
                const isEditing = g?.status === 'editing';
                const allocated = g ? Object.values(g.allocations || {}).reduce((a, b) => a + (b || 0), 0) : 0;

                return (
                  <button
                    key={id}
                    onClick={() => {
                      sound.playClick();
                      if (g) setSelectedGroupModal(g);
                    }}
                    className={`pixel-btn p-2.5 text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      isSubmitted
                        ? 'bg-emerald-950/80 border-emerald-500 hover:border-emerald-300'
                        : isEditing
                        ? 'bg-amber-950/80 border-yellow-500 hover:border-yellow-300'
                        : 'bg-zinc-900/90 border-zinc-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {/* Deputy Avatar */}
                    <div className="bg-stone-100 p-1 border border-stone-300 shadow-sm shrink-0">
                      <PixelAvatar config={avatar} size="sm" />
                    </div>

                    {/* Group info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs font-pixel-title mb-0.5">
                        <span className="text-yellow-400">GRUPO {id}</span>
                        <span className="text-zinc-400 text-[10px]">
                          {g ? `${g.memberCount} ON` : '0 ON'}
                        </span>
                      </div>

                      <div className="text-base text-white font-bold truncate">
                        {name}
                      </div>

                      {/* 10 Coin slots */}
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(10)].map((_, ci) => (
                          <div
                            key={ci}
                            className={`w-2.5 h-2.5 border border-zinc-950 ${
                              ci < allocated ? 'bg-yellow-400' : 'bg-zinc-800'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Status Tag */}
                      <div className="mt-1 flex items-center gap-1 text-[11px] font-pixel-title">
                        {isSubmitted ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 size={12} /> EMENDA ENVIADA
                          </span>
                        ) : isEditing ? (
                          <span className="text-yellow-300">DISTRIBUINDO ({allocated}/10)</span>
                        ) : (
                          <span className="text-zinc-500">AGUARDANDO</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 text-center text-zinc-400 text-xs font-pixel-title">
            PROJETADO PARA APRESENTAÇÕES ORAIS EM SALA DE AULA
          </div>
        </section>
      </div>

      {/* --- MODAL DA FICHA COMPLETA DA BANCADA (MOMENTO DA APRESENTAÇÃO) --- */}
      {selectedGroupModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border-4 border-yellow-400 p-6 md:p-8 max-w-3xl w-full pixel-box-stone text-zinc-100 font-pixel-body shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setSelectedGroupModal(null)}
              className="absolute top-4 right-4 pixel-btn px-3 py-1 bg-zinc-800 text-zinc-300 font-pixel-title text-xs cursor-pointer"
            >
              FECHAR [X]
            </button>

            {/* Header: Giant Avatar + Title */}
            <div className="flex flex-col sm:flex-row items-center gap-5 border-b-2 border-zinc-700 pb-5 mb-5 text-center sm:text-left">
              <div className="bg-gradient-to-b from-stone-100 to-amber-100 p-2 border-4 border-yellow-500 shadow-lg">
                <PixelAvatar config={selectedGroupModal.avatar} size="lg" />
              </div>
              <div className="flex-1">
                <span className="bg-yellow-400 text-zinc-900 text-xs font-pixel-title px-2.5 py-0.5 inline-block mb-1">
                  GRUPO {selectedGroupModal.id} · BANCADA PARLAMENTAR
                </span>
                <h3 className="text-2xl md:text-4xl font-pixel-title text-white tracking-wide">
                  {selectedGroupModal.name}
                </h3>
                <p className="text-zinc-300 text-xl mt-1">
                  Status:{' '}
                  <strong className={selectedGroupModal.status === 'submitted' ? 'text-emerald-400' : 'text-yellow-400'}>
                    {selectedGroupModal.status === 'submitted' ? '✔ Emenda Oficial Protocolada' : 'Em Elaboração'}
                  </strong>
                  {' · '}
                  {selectedGroupModal.memberCount} deputados participando
                </p>
              </div>
            </div>

            {/* Allocation Breakdown */}
            <div className="mb-6">
              <h4 className="font-pixel-title text-sm md:text-base text-yellow-400 mb-2">
                DISTRIBUIÇÃO DOS RECURSOS (R$ 1.000.000):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-zinc-950 p-3 border-2 border-zinc-700">
                {PILLARS.map((p) => {
                  const coins = selectedGroupModal.allocations?.[p.id] || 0;
                  if (coins === 0) return null;
                  return (
                    <div key={p.id} className="flex items-center justify-between p-1.5 border-b border-zinc-800">
                      <div className="flex items-center gap-2">
                        <PillarIcon type={p.iconType} size={20} />
                        <span className="text-white text-lg">{p.title}</span>
                      </div>
                      <div className="flex items-center gap-1 font-pixel-title text-xs text-yellow-400">
                        <span>{coins} moedas</span>
                        <PixelCoin size="sm" />
                        <span className="text-zinc-400 text-xs">
                          (R$ {(coins * 100000).toLocaleString('pt-BR')})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Justifications (Questions 1, 2, 3) */}
            <div className="space-y-4">
              <div className="bg-zinc-950 border-2 border-zinc-700 p-3.5">
                <span className="text-yellow-400 font-pixel-title text-xs block mb-1">
                  1. PILAR PRIORITÁRIO Nº 1:
                </span>
                <p className="text-xl text-white font-bold">
                  {selectedGroupModal.priorityPillar || 'Ainda não selecionado'}
                </p>
              </div>

              <div className="bg-zinc-950 border-2 border-zinc-700 p-3.5">
                <span className="text-yellow-400 font-pixel-title text-xs block mb-1">
                  2. O QUE FARIAM PRIMEIRO E POR QUÊ?
                </span>
                <p className="text-lg text-zinc-200 whitespace-pre-wrap leading-relaxed">
                  {selectedGroupModal.actionPlan || 'Aguardando resposta do grupo...'}
                </p>
              </div>

              <div className="bg-zinc-950 border-2 border-zinc-700 p-3.5">
                <span className="text-yellow-400 font-pixel-title text-xs block mb-1">
                  3. O QUE FICOU DE FORA E POR QUÊ?
                </span>
                <p className="text-lg text-zinc-200 whitespace-pre-wrap leading-relaxed">
                  {selectedGroupModal.excludedReason || 'Aguardando resposta do grupo...'}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedGroupModal(null)}
                className="pixel-btn pixel-btn-gold px-6 py-2.5 font-pixel-title text-xs text-zinc-900 cursor-pointer"
              >
                VOLTAR AO MURAL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DO QR CODE & LINK DE ACESSO --- */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border-4 border-yellow-400 p-6 md:p-8 max-w-md w-full pixel-box-stone text-center text-zinc-100 font-pixel-body shadow-2xl">
            <h3 className="font-pixel-title text-xl text-yellow-400 mb-1">
              ENTRE NA CÂMARA DA ESCOLA
            </h3>
            <p className="text-zinc-300 text-lg mb-4">
              Aponte a câmera do celular para o QR Code ou acesse pelo link direto:
            </p>

            {/* QR Code Image */}
            <div className="bg-white p-3 inline-block border-4 border-zinc-700 shadow-inner mb-4">
              {qrCodeDataUrl ? (
                <img src={qrCodeDataUrl} alt="QR Code de Acesso" className="w-56 h-56 mx-auto pixel-art" />
              ) : (
                <div className="w-56 h-56 bg-zinc-200 flex items-center justify-center text-zinc-800">
                  Gerando QR Code...
                </div>
              )}
            </div>

            {/* Direct Link + Copy Button */}
            <div className="bg-zinc-950 border-2 border-zinc-700 p-2.5 flex items-center justify-between gap-2 mb-4 text-left">
              <div className="truncate text-base text-yellow-300 font-mono flex-1">
                {currentAppUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className="pixel-btn pixel-btn-gold px-3 py-1 flex items-center gap-1 font-pixel-title text-[10px] text-zinc-900 shrink-0 cursor-pointer"
              >
                {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedLink ? 'COPIADO!' : 'COPIAR'}</span>
              </button>
            </div>

            <p className="text-zinc-400 text-sm mb-5">
              Não é necessário fazer login com conta Google nem baixar aplicativo.
            </p>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full pixel-btn pixel-btn-green py-2.5 font-pixel-title text-xs text-white cursor-pointer"
            >
              FECHAR
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL DE CONFIRMAÇÃO DE ZERAR RODADA --- */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border-4 border-red-500 p-6 max-w-sm w-full pixel-box-stone text-center text-zinc-100 font-pixel-body">
            <AlertCircle size={36} className="text-red-400 mx-auto mb-2" />
            <h3 className="font-pixel-title text-lg text-red-400 mb-2">
              ZERAR RODADA ATUAL?
            </h3>
            <p className="text-zinc-300 text-lg mb-5">
              Isso apagará as alocações de todos os 10 grupos e reiniciará o cronômetro para 20 minutos.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 pixel-btn px-4 py-2 bg-zinc-800 text-zinc-300 font-pixel-title text-xs cursor-pointer"
              >
                CANCELAR
              </button>
              <button
                onClick={() => {
                  sound.playGavel();
                  realtimeClient.resetRound();
                  setShowResetConfirm(false);
                }}
                className="flex-1 pixel-btn pixel-btn-red px-4 py-2 text-white font-pixel-title text-xs cursor-pointer"
              >
                SIM, ZERAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
