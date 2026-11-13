import React, { useState } from 'react';
import {
  PixelAvatar,
  DEFAULT_FEMININE_AVATAR,
  DEFAULT_MASCULINE_AVATAR,
  DEFAULT_AGENDER_AVATAR,
  SKIN_TONES,
  HAIR_COLORS,
  HAIR_STYLES,
  OUTFIT_STYLES,
  OUTFIT_COLORS,
  ACCESSORY_STYLES,
} from './PixelAvatar';
import { AvatarConfig } from '../types';
import { sound } from '../sound';
import { Dices, Check, User, Palette, Shirt, Award } from 'lucide-react';

interface AvatarCreatorProps {
  groupId: string;
  initialConfig?: AvatarConfig;
  initialName?: string;
  onSave: (config: AvatarConfig, name: string) => void;
  onCancel?: () => void;
}

export const AvatarCreator: React.FC<AvatarCreatorProps> = ({
  groupId,
  initialConfig,
  initialName = '',
  onSave,
  onCancel,
}) => {
  const isFeminineStyle = (hairStyle: number) => [2, 4, 5].includes(hairStyle);

  const [config, setConfig] = useState<AvatarConfig>(
    initialConfig || { ...DEFAULT_FEMININE_AVATAR }
  );

  const [selectedGender, setSelectedGender] = useState<'feminino' | 'masculino'>(
    initialConfig ? (isFeminineStyle(initialConfig.hairStyle) ? 'feminino' : 'masculino') : 'feminino'
  );

  const [name, setName] = useState(initialName || '');
  const [isWalking, setIsWalking] = useState(false);

  const handleSelectGender = (gender: 'feminino' | 'masculino') => {
    sound.playClick();
    setSelectedGender(gender);
    if (gender === 'feminino') {
      setConfig((prev) => ({
        ...prev,
        hairStyle: 2, // Longo Solto com Mechas
        outfit: 1, // Blazer Moderno
        outfitColor: prev.outfitColor === '#2563eb' ? '#b91c1c' : prev.outfitColor,
        accessory: 2, // Faixa de Deputada
      }));
    } else {
      setConfig((prev) => ({
        ...prev,
        hairStyle: 0, // Corte Social
        outfit: 0, // Terno Parlamentar
        outfitColor: prev.outfitColor === '#b91c1c' ? '#2563eb' : prev.outfitColor,
        accessory: 1, // Gravata
      }));
    }
  };

  const handleRandomize = () => {
    sound.playCoin();
    setConfig({
      skin: Math.floor(Math.random() * SKIN_TONES.length),
      hairStyle: Math.floor(Math.random() * HAIR_STYLES.length),
      hairColor: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)].hex,
      outfit: Math.floor(Math.random() * OUTFIT_STYLES.length),
      outfitColor: OUTFIT_COLORS[Math.floor(Math.random() * OUTFIT_COLORS.length)].hex,
      accessory: Math.floor(Math.random() * ACCESSORY_STYLES.length),
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-3 sm:p-5 md:p-6 bg-amber-50 border-4 border-amber-600 shadow-2xl text-stone-900 font-pixel-body text-lg sm:text-xl">
      {/* Header with warm contrast */}
      <div className="text-center mb-3 sm:mb-4">
        <div className="inline-block bg-amber-500 text-stone-950 border-2 border-amber-700 font-pixel-title text-xs sm:text-sm px-3 py-1 mb-1 shadow">
          GRUPO {groupId} · CÂMARA MUNICIPAL
        </div>
        <h2 className="text-xl sm:text-3xl font-pixel-title text-amber-950 tracking-wide">
          PERSONALIZE SEU DEPUTADO(A)
        </h2>
        <p className="text-stone-700 text-base sm:text-lg mt-0.5 font-bold">
          Selecione o gênero inicial e personalize pele, cabelo, vestimenta e cores
        </p>
      </div>

      {/* Main Avatar Preview Display - Daylight Stage */}
      <div className="flex flex-col items-center justify-center p-3 sm:p-5 bg-gradient-to-b from-sky-100 via-stone-50 to-amber-100 border-4 border-amber-500 mb-4 sm:mb-5 shadow-lg relative min-h-[220px]">
        {/* Gender Option Selector on the LEFT (substituindo a base neutra conforme solicitado) */}
        <div className="absolute top-2 left-2 z-10 flex items-center bg-white/95 p-1 border-2 border-amber-600 shadow-md">
          <span className="text-[9px] sm:text-[10px] font-pixel-title text-amber-950 font-bold mr-1.5 hidden xs:inline">
            GÊNERO:
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleSelectGender('feminino')}
              className={`pixel-btn px-2 sm:px-2.5 py-1 text-[10px] sm:text-xs font-pixel-title flex items-center gap-1 cursor-pointer transition-transform ${
                selectedGender === 'feminino'
                  ? 'bg-rose-600 text-white border-2 border-rose-800 shadow font-bold ring-2 ring-rose-300 scale-105'
                  : 'bg-stone-100 text-stone-700 border border-stone-300 hover:bg-rose-100'
              }`}
              title="Definir arquétipo inicial de Deputada Feminina"
            >
              <span>♀ FEMININA</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectGender('masculino')}
              className={`pixel-btn px-2 sm:px-2.5 py-1 text-[10px] sm:text-xs font-pixel-title flex items-center gap-1 cursor-pointer transition-transform ${
                selectedGender === 'masculino'
                  ? 'bg-blue-600 text-white border-2 border-blue-800 shadow font-bold ring-2 ring-blue-300 scale-105'
                  : 'bg-stone-100 text-stone-700 border border-stone-300 hover:bg-blue-100'
              }`}
              title="Definir arquétipo inicial de Deputado Masculino"
            >
              <span>♂ MASCULINO</span>
            </button>
          </div>
        </div>

        {/* Animation & Randomize Controls on the RIGHT */}
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
          <button
            onClick={() => setIsWalking(!isWalking)}
            className="pixel-btn px-2.5 py-1 text-[10px] sm:text-xs font-pixel-title bg-stone-700 text-yellow-300 cursor-pointer shadow active:scale-95 transition-transform"
          >
            {isWalking ? 'PARAR' : 'ANDAR'}
          </button>
          <button
            onClick={handleRandomize}
            className="pixel-btn pixel-btn-gold px-2.5 py-1 flex items-center gap-1.5 text-[10px] sm:text-xs font-pixel-title text-stone-950 cursor-pointer active:scale-95 transition-transform shadow"
            title="Sortear opções aleatórias"
          >
            <Dices size={14} />
            <span>SORTEAR</span>
          </button>
        </div>

        {/* Character on wooden rostrum with shadow */}
        <div className="py-2 px-6 flex flex-col items-center">
          <div className="relative">
            <PixelAvatar config={config} size="xl" isWalking={isWalking} />
            {/* Wooden podium plank */}
            <div className="w-32 h-2.5 bg-amber-800 border-t border-amber-600 border-b border-amber-950 mx-auto -mt-0.5 shadow" />
          </div>
        </div>

        {/* Input for Deputy / Bench Name (Livre com fallback para Bancada do Grupo X) */}
        <div className="w-full max-w-md mt-2 bg-white p-2.5 sm:p-3 border-3 border-amber-600 shadow-md">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-amber-900 text-xs sm:text-sm font-pixel-title font-bold">
              NOME DA BANCADA:
            </label>
            <span className="text-stone-500 text-[11px] font-bold">
              (Livre ou padrão: Bancada do Grupo {groupId})
            </span>
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={32}
            className="w-full bg-amber-50/60 border-2 border-amber-400 px-3 py-1.5 sm:py-2 text-lg sm:text-xl font-pixel-body text-stone-900 font-bold focus:outline-none focus:border-amber-600"
            placeholder={`Bancada do Grupo ${groupId}`}
          />
        </div>
      </div>

      {/* Visual Customization Palettes (Clean Warm Stage - Zero Gloomy Gray) */}
      <div className="space-y-3.5 sm:space-y-4 mb-4 sm:mb-6 bg-white p-3.5 sm:p-4 border-3 border-amber-300 shadow-sm">
        {/* 1. TOM DE PELE (6 Direct Color Chips) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-amber-950 font-pixel-title text-xs flex items-center gap-1.5">
              <User size={14} className="text-amber-700" /> TOM DE PELE:
            </span>
            <span className="text-amber-800 text-sm font-bold bg-amber-100 px-2 py-0.5 border border-amber-300">
              {SKIN_TONES[config.skin].name}
            </span>
          </div>
          <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
            {SKIN_TONES.map((tone, idx) => {
              const isSelected = config.skin === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setConfig((prev) => ({ ...prev, skin: idx }));
                  }}
                  className={`h-11 sm:h-12 flex flex-col items-center justify-center p-1 transition-all cursor-pointer relative shadow-sm ${
                    isSelected
                      ? 'border-3 border-amber-600 ring-3 ring-amber-400 scale-105 z-10'
                      : 'border-2 border-stone-300 hover:border-amber-500'
                  }`}
                  style={{ backgroundColor: tone.hex }}
                  title={tone.name}
                >
                  {isSelected && (
                    <div className="w-4 h-4 bg-stone-950 text-amber-300 flex items-center justify-center rounded-full text-[10px] font-bold shadow">
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. ESTILO DE CABELO (6 Buttons Femininos & Masculinos) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-amber-950 font-pixel-title text-xs flex items-center gap-1.5">
              <Palette size={14} className="text-amber-700" /> ESTILO DE CABELO:
            </span>
            <span className="text-amber-800 text-sm font-bold bg-amber-100 px-2 py-0.5 border border-amber-300">
              {HAIR_STYLES[config.hairStyle]}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {HAIR_STYLES.map((style, idx) => {
              const isSelected = config.hairStyle === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setConfig((prev) => ({ ...prev, hairStyle: idx }));
                  }}
                  className={`px-2 py-1.5 text-xs sm:text-sm font-pixel-body font-bold text-left truncate transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-stone-950 border-2 border-amber-600 shadow'
                      : 'bg-stone-100 text-stone-800 border border-stone-300 hover:bg-amber-100'
                  }`}
                >
                  {isSelected ? '▶ ' : ''}{style}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. COR DO CABELO (6 Direct Color Chips) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-amber-950 font-pixel-title text-xs flex items-center gap-1.5">
              <Palette size={14} className="text-amber-700" /> COR DO CABELO:
            </span>
            <span className="text-amber-800 text-sm font-bold bg-amber-100 px-2 py-0.5 border border-amber-300">
              {HAIR_COLORS.find((c) => c.hex === config.hairColor)?.name || 'Cor'}
            </span>
          </div>
          <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
            {HAIR_COLORS.map((hc, idx) => {
              const isSelected = config.hairColor === hc.hex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setConfig((prev) => ({ ...prev, hairColor: hc.hex }));
                  }}
                  className={`h-9 sm:h-10 flex items-center justify-center transition-all cursor-pointer shadow-sm ${
                    isSelected
                      ? 'border-3 border-amber-600 ring-3 ring-amber-400 scale-105 z-10'
                      : 'border-2 border-stone-300 hover:border-amber-500'
                  }`}
                  style={{ backgroundColor: hc.hex }}
                  title={hc.name}
                >
                  {isSelected && (
                    <span className="w-3.5 h-3.5 bg-amber-400 text-stone-950 flex items-center justify-center rounded-full text-[9px] font-bold shadow">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. VESTIMENTA (5 Buttons) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-amber-950 font-pixel-title text-xs flex items-center gap-1.5">
              <Shirt size={14} className="text-amber-700" /> VESTIMENTA:
            </span>
            <span className="text-amber-800 text-sm font-bold bg-amber-100 px-2 py-0.5 border border-amber-300">
              {OUTFIT_STYLES[config.outfit]}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {OUTFIT_STYLES.map((outfit, idx) => {
              const isSelected = config.outfit === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setConfig((prev) => ({ ...prev, outfit: idx }));
                  }}
                  className={`px-2 py-1.5 text-xs sm:text-sm font-pixel-body font-bold text-left truncate transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-stone-950 border-2 border-amber-600 shadow'
                      : 'bg-stone-100 text-stone-800 border border-stone-300 hover:bg-amber-100'
                  }`}
                >
                  {isSelected ? '▶ ' : ''}{outfit}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. COR DA ROUPA (6 Direct Color Chips) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-amber-950 font-pixel-title text-xs flex items-center gap-1.5">
              <Palette size={14} className="text-amber-700" /> COR DA ROUPA:
            </span>
            <span className="text-amber-800 text-sm font-bold bg-amber-100 px-2 py-0.5 border border-amber-300">
              {OUTFIT_COLORS.find((c) => c.hex === config.outfitColor)?.name || 'Cor'}
            </span>
          </div>
          <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
            {OUTFIT_COLORS.map((oc, idx) => {
              const isSelected = config.outfitColor === oc.hex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setConfig((prev) => ({ ...prev, outfitColor: oc.hex }));
                  }}
                  className={`h-9 sm:h-10 flex items-center justify-center transition-all cursor-pointer shadow-sm ${
                    isSelected
                      ? 'border-3 border-amber-600 ring-3 ring-amber-400 scale-105 z-10'
                      : 'border-2 border-stone-300 hover:border-amber-500'
                  }`}
                  style={{ backgroundColor: oc.hex }}
                  title={oc.name}
                >
                  {isSelected && (
                    <span className="w-3.5 h-3.5 bg-amber-400 text-stone-950 flex items-center justify-center rounded-full text-[9px] font-bold shadow">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. ACESSÓRIO (5 Buttons) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-amber-950 font-pixel-title text-xs flex items-center gap-1.5">
              <Award size={14} className="text-amber-700" /> ACESSÓRIO:
            </span>
            <span className="text-amber-800 text-sm font-bold bg-amber-100 px-2 py-0.5 border border-amber-300">
              {ACCESSORY_STYLES[config.accessory]}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {ACCESSORY_STYLES.map((acc, idx) => {
              const isSelected = config.accessory === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setConfig((prev) => ({ ...prev, accessory: idx }));
                  }}
                  className={`px-2 py-1.5 text-xs sm:text-sm font-pixel-body font-bold text-left truncate transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-stone-950 border-2 border-amber-600 shadow'
                      : 'bg-stone-100 text-stone-800 border border-stone-300 hover:bg-amber-100'
                  }`}
                >
                  {isSelected ? '▶ ' : ''}{acc}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {onCancel && (
          <button
            onClick={() => {
              sound.playClick();
              onCancel();
            }}
            className="pixel-btn px-4 py-3 bg-stone-200 border-2 border-stone-400 text-stone-800 font-pixel-title text-xs cursor-pointer active:scale-95 transition-transform"
          >
            VOLTAR
          </button>
        )}
        <button
          onClick={() => {
            sound.playCoin();
            onSave(config, name.trim() || `Bancada do Grupo ${groupId}`);
          }}
          className="flex-1 pixel-btn pixel-btn-green py-3.5 px-4 flex items-center justify-center gap-2 text-white font-pixel-title text-xs sm:text-sm cursor-pointer shadow-lg active:scale-95 transition-transform"
        >
          <Check size={18} />
          <span>CONFIRMAR E INICIAR ORÇAMENTO</span>
        </button>
      </div>
    </div>
  );
};
