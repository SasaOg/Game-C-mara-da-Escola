import React, { useState, useEffect } from 'react';
import { PixelAvatar } from './PixelAvatar';
import { AvatarConfig } from '../types';
import { sound } from '../sound';
import { Volume2, VolumeX, Users, Presentation, Play } from 'lucide-react';

interface PixelSceneProps {
  onEnterGroup: () => void;
  onOpenMural: () => void;
  totalStudentsConnected?: number;
}

interface DeputyModel {
  name: string;
  config: AvatarConfig;
}

// 6 Diverse student parliamentarians (4 female, 2 male) evenly spaced along sidewalk
const DEPUTY_MODELS: DeputyModel[] = [
  {
    name: 'Deputada 1',
    config: {
      skin: 5, // Negra Retinta Luminosa
      hairStyle: 4, // Tranças Box Braids com Anéis Dourados
      hairColor: '#18181b',
      outfit: 1, // Blazer Moderno
      outfitColor: '#16a34a', // Verde Bandeira
      accessory: 2, // Faixa de Deputada
    },
  },
  {
    name: 'Deputada 2',
    config: {
      skin: 1, // Clara Dourada
      hairStyle: 2, // Longo Solto com Mechas
      hairColor: '#eab308', // Loiro Dourado
      outfit: 1, // Blazer Moderno
      outfitColor: '#b91c1c', // Vinho Nobre
      accessory: 2, // Faixa de Deputada
    },
  },
  {
    name: 'Deputado 3',
    config: {
      skin: 4, // Negra Radiante
      hairStyle: 1, // Afro Fade
      hairColor: '#18181b',
      outfit: 0, // Terno Parlamentar
      outfitColor: '#2563eb', // Azul Real
      accessory: 1, // Gravata Vermelha
    },
  },
  {
    name: 'Deputada 4',
    config: {
      skin: 3, // Morena Café
      hairStyle: 5, // Coque Alto com Franja
      hairColor: '#451a03', // Castanho Chocolate
      outfit: 4, // Uniforme da Escola MM
      outfitColor: '#7c3aed', // Roxo Imperial
      accessory: 4, // Crachá Oficial
    },
  },
  {
    name: 'Deputada 5',
    config: {
      skin: 0, // Clara Rosada
      hairStyle: 2, // Longo Solto com Mechas
      hairColor: '#b91c1c', // Ruivo Carmim
      outfit: 3, // Moletom Estudantil
      outfitColor: '#d97706', // Amarelo Ouro
      accessory: 3, // Óculos Retrô
    },
  },
  {
    name: 'Deputado 6',
    config: {
      skin: 2, // Morena Canela
      hairStyle: 0, // Corte Básico Social
      hairColor: '#18181b',
      outfit: 0, // Terno Parlamentar
      outfitColor: '#2563eb',
      accessory: 2, // Faixa
    },
  },
];

export const PixelScene: React.FC<PixelSceneProps> = ({
  onEnterGroup,
  onOpenMural,
  totalStudentsConnected = 0,
}) => {
  const [cycleProgress, setCycleProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(sound.isMuted);

  // Synchronized constant-pace walking loop across entire sidewalk between Escola MM and Câmara
  useEffect(() => {
    const interval = setInterval(() => {
      setCycleProgress((prev) => (prev + 0.0035) % 1.0);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Sidewalk bounds: minX = 6% (Escola MM entrance), maxX = 81% (Câmara Municipal portal)
  const minX = 6;
  const maxX = 81;

  const deputies = DEPUTY_MODELS.map((model, idx) => {
    // Exact 25% phase separation: mathematically guarantees deputies NEVER bunch up or overlap!
    const phase = (cycleProgress + idx / DEPUTY_MODELS.length) % 1.0;

    let xPercent: number;
    let direction: 'right' | 'left';

    if (phase < 0.5) {
      // Walking toward Câmara Municipal portal
      const t = phase / 0.5;
      xPercent = minX + t * (maxX - minX);
      direction = 'right';
    } else {
      // Walking back from Câmara Municipal toward Escola MM
      const t = (phase - 0.5) / 0.5;
      xPercent = maxX - t * (maxX - minX);
      direction = 'left';
    }

    // Two-lane sidewalk depth: rightbound walking is on upper lane, leftbound is on lower foreground lane
    const bottomPx = direction === 'right' ? 12 : 3;
    const zIndex = direction === 'left' ? 22 : 18;

    return {
      ...model,
      xPercent,
      direction,
      bottomPx,
      zIndex,
    };
  });

  const toggleSound = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col justify-between overflow-x-hidden overflow-y-auto bg-sky-400 select-none">
      {/* Top Controls Header */}
      <div className="relative z-30 flex items-center justify-between p-2.5 sm:p-4 max-w-7xl mx-auto w-full shrink-0">
        {/* Active students badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950/90 border-2 border-yellow-500/80 text-yellow-300 font-pixel-body text-base sm:text-xl shadow-lg">
          <Users size={18} className="text-yellow-400 shrink-0" />
          <span>{totalStudentsConnected} Estudantes Conectados</span>
        </div>

        {/* Audio Mute Button */}
        <button
          onClick={toggleSound}
          className="pixel-btn px-3 py-1.5 bg-zinc-800 text-yellow-300 flex items-center gap-2 font-pixel-title text-xs cursor-pointer shadow-md"
          title="Alternar Áudio 8-Bit"
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          <span className="hidden sm:inline">{isMuted ? 'SEM SOM' : 'SOM: ON'}</span>
        </button>
      </div>

      {/* --- SKY LAYER: Sun & Cubic Clouds --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Bright Pixel Sun */}
        <div className="absolute top-4 sm:top-6 left-6 sm:left-14 w-14 sm:w-20 h-14 sm:h-20 bg-yellow-300 border-4 border-yellow-200 pixel-box-gold shadow-lg flex items-center justify-center">
          <div className="w-9 sm:w-14 h-9 sm:h-14 bg-yellow-400 border-2 border-amber-300" />
        </div>

        {/* Moving Pixel Clouds */}
        <div className="absolute top-6 sm:top-8 left-0 w-[200%] h-32 flex gap-20 sm:gap-28 opacity-90 animate-clouds">
          <div className="relative w-44 h-14 bg-white border-b-4 border-slate-300">
            <div className="absolute -top-6 left-6 w-20 h-8 bg-white border-t-2 border-slate-100" />
            <div className="absolute -top-10 left-12 w-16 h-6 bg-white" />
          </div>
          <div className="relative w-60 h-16 bg-white border-b-4 border-slate-300 mt-6">
            <div className="absolute -top-8 left-10 w-28 h-10 bg-white" />
            <div className="absolute -top-12 left-20 w-16 h-6 bg-white" />
          </div>
          <div className="relative w-36 h-12 bg-white border-b-4 border-slate-300">
            <div className="absolute -top-6 left-6 w-16 h-8 bg-white" />
          </div>
          <div className="relative w-52 h-14 bg-white border-b-4 border-slate-300 mt-4">
            <div className="absolute -top-8 left-12 w-24 h-10 bg-white" />
          </div>
        </div>
      </div>

      {/* --- CENTRAL TITLE & HERO HEADLINE (OPTIMIZED FOR ALL DESKTOP RESOLUTIONS) --- */}
      <div className="relative z-20 flex flex-col items-center justify-center px-3 sm:px-4 text-center my-2 sm:my-3 md:my-auto py-2 shrink-0">
        {/* Flag Ribbon with "ESCOLA MM" */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 bg-emerald-800 border-2 border-emerald-500 text-yellow-300 font-pixel-title text-[10px] sm:text-xs md:text-sm mb-1.5 sm:mb-2.5 shadow-lg max-w-full truncate">
          <span className="w-3.5 h-2.5 bg-green-600 inline-block border border-yellow-300 relative shrink-0">
            <span className="w-1.5 h-1 bg-yellow-400 block mx-auto my-0.5" />
          </span>
          <span className="truncate tracking-wider">ESCOLA MM</span>
        </div>

        {/* High-Contrast Gray Box with desktop-safe padding */}
        <div className="bg-zinc-900 border-3 sm:border-4 border-zinc-600 p-3.5 sm:p-5 md:p-6 pixel-box-stone w-full max-w-sm sm:max-w-xl md:max-w-2xl shadow-2xl">
          <h1 className="font-pixel-title text-xl sm:text-2xl md:text-3xl text-yellow-400 tracking-wider mb-1 sm:mb-2 drop-shadow-[0_2px_0_#713f12]">
            CÂMARA DA ESCOLA
          </h1>
          
          <div className="bg-zinc-950/80 border-2 border-zinc-700/80 p-2.5 sm:p-3.5 my-1.5 sm:my-2.5">
            <p className="font-pixel-body text-lg sm:text-xl md:text-2xl text-zinc-100 max-w-xl mx-auto leading-relaxed">
              Vocês são deputados da cidade. O orçamento é de{' '}
              <strong className="text-yellow-300 underline decoration-yellow-500 decoration-2 font-bold">
                R$ 1.000.000
              </strong>
              . Onde a escola mais precisa?
            </p>
          </div>

          {/* Action CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3.5 mt-2.5 sm:mt-4">
            <button
              onClick={() => {
                sound.playCoin();
                onEnterGroup();
              }}
              className="w-full sm:w-auto pixel-btn pixel-btn-green py-2.5 sm:py-3 px-4 sm:px-6 flex items-center justify-center gap-2 sm:gap-2.5 text-white font-pixel-title text-xs sm:text-sm cursor-pointer shadow-xl active:scale-95 transition-transform"
            >
              <Play size={16} className="fill-white" />
              <span>ENTRAR COMO GRUPO</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenMural();
              }}
              className="w-full sm:w-auto pixel-btn pixel-btn-blue py-2.5 sm:py-3 px-4 sm:px-6 flex items-center justify-center gap-2 sm:gap-2.5 text-white font-pixel-title text-xs sm:text-sm cursor-pointer shadow-xl active:scale-95 transition-transform"
            >
              <Presentation size={16} />
              <span>ABRIR MURAL DA TURMA</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- SCENIC 2D PIXEL ART HORIZONTAL NEIGHBORHOOD --- */}
      <div className="relative z-10 w-full mt-auto shrink-0">
        {/* BUILDINGS & BACKDROP ROW (PROPORTIONED TO NEVER CUT OFF ON DESKTOP) */}
        <div className="relative max-w-6xl mx-auto w-full h-32 sm:h-44 md:h-48 lg:h-50 flex items-end justify-between px-2 sm:px-6 pointer-events-none">
          {/* 1. Brazilian Neighborhood Houses (Left side - visible on desktop) */}
          <div className="hidden lg:flex items-end gap-2.5 mb-0 shrink-0">
            <div className="w-18 sm:w-22 h-26 sm:h-34 bg-orange-400 border-3 sm:border-4 border-amber-800 relative">
              <div className="absolute -top-7 -left-1.5 w-22 sm:w-26 h-7 bg-amber-900 border-2 border-amber-950 flex" />
              <div className="absolute top-3 left-2.5 w-5 h-5 bg-sky-200 border-2 border-zinc-800" />
              <div className="absolute bottom-0 right-2.5 w-5 h-10 bg-amber-950 border-2 border-zinc-900" />
            </div>

            <div className="relative w-12 sm:w-14 h-28 sm:h-32 flex flex-col items-center">
              <div className="w-14 h-16 bg-emerald-600 border-3 sm:border-4 border-emerald-800 relative shadow-md">
                <div className="w-9 h-7 bg-emerald-500 absolute top-1.5 left-1.5" />
              </div>
              <div className="w-4 h-14 bg-amber-900 border-2 border-amber-950" />
            </div>
          </div>

          {/* 2. THE MAIN SCHOOL: ESCOLA MM (Center-Left) */}
          <div className="relative w-44 sm:w-72 md:w-88 h-32 sm:h-48 md:h-54 bg-amber-50 border-3 sm:border-4 border-yellow-700 flex flex-col justify-between shrink-0 shadow-xl">
            {/* Roof & Sign */}
            <div className="w-full h-7 sm:h-8 bg-red-800 border-b-3 sm:border-b-4 border-red-950 flex items-center justify-between px-2 sm:px-3 relative">
              <div className="bg-yellow-400 text-zinc-900 font-pixel-title text-[8px] sm:text-xs px-2 py-0.5 border border-yellow-600 truncate font-bold">
                ESCOLA MM
              </div>
              {/* Flagpole with Brazil Flag */}
              <div className="absolute -top-10 sm:-top-12 right-4 sm:right-6 flex items-start">
                <div className="w-1 h-14 sm:h-16 bg-zinc-400 border-l border-zinc-600" />
                <div className="w-6 sm:w-7 h-4 sm:h-5 bg-green-600 border border-yellow-300 flex items-center justify-center relative shadow-sm">
                  <div className="w-3.5 sm:w-4 h-2 sm:h-2.5 bg-yellow-400 flex items-center justify-center">
                    <div className="w-2 h-1 bg-blue-700" />
                  </div>
                </div>
              </div>
            </div>

            {/* Classroom Windows Rows */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 px-2 sm:px-3 py-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-5 sm:h-7 bg-sky-200 border-2 border-zinc-700 relative flex items-center justify-center"
                >
                  <div className="w-full h-0.5 bg-zinc-700" />
                  <div className="h-full w-0.5 bg-zinc-700 absolute" />
                </div>
              ))}
            </div>

            {/* Sports Court & Gate */}
            <div className="flex items-end justify-between px-2 sm:px-4 pb-1">
              <div className="w-16 sm:w-28 h-7 sm:h-9 bg-emerald-700 border-2 border-emerald-900 p-0.5 flex flex-col justify-center">
                <span className="text-[6px] sm:text-[7px] text-white font-pixel-title text-center">
                  QUADRA
                </span>
                <div className="w-full h-0.5 bg-white opacity-80" />
              </div>
              <div className="w-10 sm:w-14 h-11 sm:h-15 bg-zinc-800 border-2 border-zinc-950 flex items-center justify-center">
                <div className="w-7 sm:w-10 h-9 sm:h-13 border border-yellow-500/40 flex flex-col justify-evenly">
                  <div className="w-full h-0.5 bg-zinc-600" />
                  <div className="w-full h-0.5 bg-zinc-600" />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Small Street Tree */}
          <div className="hidden sm:flex flex-col items-center shrink-0">
            <div className="w-10 h-12 bg-emerald-700 border-2 border-emerald-900" />
            <div className="w-3.5 h-10 bg-amber-900 border border-amber-950" />
          </div>

          {/* 4. PALÁCIO DA CÂMARA MUNICIPAL (Mobile Responsive & Optimized Dimensions) */}
          <div className="relative w-40 sm:w-64 md:w-80 h-34 sm:h-48 md:h-56 bg-zinc-200 border-3 sm:border-4 border-zinc-600 flex flex-col justify-between shrink-0 shadow-xl ml-2 sm:ml-4">
            {/* Chamber Dome */}
            <div className="absolute -top-8 sm:-top-10 left-1/2 -translate-x-1/2 w-16 sm:w-26 h-8 sm:h-10 bg-slate-400 border-3 sm:border-4 border-slate-600 rounded-t-full flex items-center justify-center shadow">
              <div className="w-1.5 sm:w-2 h-3 sm:h-4 bg-yellow-400 -top-3 sm:-top-4 absolute border border-yellow-600" />
            </div>

            {/* Header pediment */}
            <div className="w-full bg-zinc-400 border-b-3 sm:border-b-4 border-zinc-600 py-0.5 sm:py-1 text-center">
              <span className="font-pixel-title text-[7px] sm:text-[10px] text-zinc-900 font-bold">
                CÂMARA MUNICIPAL
              </span>
            </div>

            {/* Classical Columns & Grand Portal Doorway */}
            <div className="flex justify-around items-end px-1.5 sm:px-2 my-auto w-full relative">
              <div className="w-3 sm:w-5 h-14 sm:h-20 bg-zinc-100 border-x-2 border-zinc-400 shadow-sm" />
              <div className="w-3 sm:w-5 h-14 sm:h-20 bg-zinc-100 border-x-2 border-zinc-400 shadow-sm" />

              {/* Main Entrance Portal (Onde os deputados entram e saem!) */}
              <div className="w-10 sm:w-16 h-14 sm:h-20 bg-stone-900 border-2 border-amber-600 flex flex-col justify-end items-center relative overflow-hidden shadow-inner">
                <div className="absolute top-1 text-[7px] text-amber-400 font-pixel-title hidden sm:block">
                  ENTRADA
                </div>
                {/* Door arches & double doors */}
                <div className="w-full h-11 sm:h-15 flex justify-center gap-0.5 bg-amber-950 p-0.5 border-t border-amber-700">
                  <div className="w-1/2 h-full bg-amber-900 border border-amber-950 flex items-center justify-end pr-0.5">
                    <div className="w-1 h-1 bg-yellow-400 rounded-full" />
                  </div>
                  <div className="w-1/2 h-full bg-amber-900 border border-amber-950 flex items-center justify-start pl-0.5">
                    <div className="w-1 h-1 bg-yellow-400 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="w-3 sm:w-5 h-14 sm:h-20 bg-zinc-100 border-x-2 border-zinc-400 shadow-sm" />
              <div className="w-3 sm:w-5 h-14 sm:h-20 bg-zinc-100 border-x-2 border-zinc-400 shadow-sm" />
            </div>

            {/* Entrance Steps leading down to sidewalk */}
            <div className="w-full flex flex-col">
              <div className="w-full h-2.5 sm:h-3 bg-zinc-300 border-t-2 border-zinc-400" />
              <div className="w-full h-2.5 sm:h-3 bg-zinc-400 border-t-2 border-zinc-500" />
            </div>
          </div>
        </div>

        {/* --- HIGH-CONTRAST LIGHT PEDESTRIAN STREET --- */}
        {/* Deputies walk along the sidewalk, entering and exiting the Câmara Municipal */}
        <div className="relative w-full h-22 sm:h-24 bg-stone-200 border-t-4 border-yellow-400 border-b-4 border-stone-400 shadow-md overflow-hidden">
          {/* Calçada Portuguesa Grid Lines */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, #78716c, #78716c 1px, transparent 1px, transparent 16px), repeating-linear-gradient(90deg, #78716c, #78716c 1px, transparent 1px, transparent 16px)'
          }} />

          {/* White Pedestrian Crosswalk Stripes */}
          <div className="absolute top-0 bottom-0 left-1/4 w-32 flex justify-between px-2 opacity-80 pointer-events-none">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="w-4 h-full bg-white shadow-sm border-x border-stone-300" />
            ))}
          </div>

          {/* Animated Walking Deputies entering & exiting Câmara along the sidewalk */}
          {deputies.map((deputy, idx) => {
            const isNearCamara = deputy.xPercent >= 75;
            const isFacingLeft = deputy.direction === 'left';

            return (
              <div
                key={idx}
                className="absolute transition-all duration-100 ease-linear pointer-events-none flex flex-col items-center"
                style={{
                  left: `${deputy.xPercent}%`,
                  bottom: `${deputy.bottomPx}px`,
                  zIndex: deputy.zIndex,
                }}
              >
                {/* Badge: Deputado(a) X */}
                <span className="bg-zinc-950/90 text-yellow-300 border border-yellow-500 text-[8px] sm:text-[9px] font-pixel-title px-1.5 py-0.2 mb-0.5 whitespace-nowrap shadow">
                  {deputy.name}
                </span>

                {/* Avatar with direction flip when walking left */}
                <div style={{ transform: isFacingLeft ? 'scaleX(-1)' : 'none' }}>
                  <PixelAvatar config={deputy.config} size="md" isWalking={true} />
                </div>
              </div>
            );
          })}
        </div>

        {/* --- GROUND LAYER: Minecraft Grass & Dirt Blocks --- */}
        <div className="w-full">
          <div className="w-full h-4 bg-emerald-600 border-t-2 border-emerald-400 border-b-2 border-emerald-800 relative">
            <div className="w-full h-full flex justify-between px-1 opacity-60">
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-2 bg-emerald-700 inline-block translate-y-1"
                />
              ))}
            </div>
          </div>
          <div className="w-full h-8 bg-amber-950 border-t border-amber-900 flex items-center justify-around px-4">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="w-3 h-3 bg-amber-900 border border-black/40" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
