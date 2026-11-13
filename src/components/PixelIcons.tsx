import React from 'react';

// Pixel Art Gold Coin (R$ 100.000)
export const PixelCoin: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const pixelSize = { sm: 18, md: 26, lg: 36 }[size];

  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 16 16"
      className={`inline-block pixel-art drop-shadow-sm ${className}`}
      style={{ shapeRendering: 'crispEdges' }}
    >
      {/* Outer Coin Border */}
      <rect x="4" y="1" width="8" height="1" fill="#713f12" />
      <rect x="2" y="2" width="2" height="2" fill="#713f12" />
      <rect x="12" y="2" width="2" height="2" fill="#713f12" />
      <rect x="1" y="4" width="1" height="8" fill="#713f12" />
      <rect x="14" y="4" width="1" height="8" fill="#713f12" />
      <rect x="2" y="12" width="2" height="2" fill="#713f12" />
      <rect x="12" y="12" width="2" height="2" fill="#713f12" />
      <rect x="4" y="14" width="8" height="1" fill="#713f12" />

      {/* Gold Face Fill */}
      <rect x="4" y="2" width="8" height="12" fill="#eab308" />
      <rect x="2" y="4" width="12" height="8" fill="#eab308" />

      {/* Highlights */}
      <rect x="4" y="2" width="6" height="2" fill="#fef08a" />
      <rect x="2" y="4" width="2" height="6" fill="#fef08a" />
      <rect x="4" y="4" width="2" height="2" fill="#ffffff" />

      {/* Center Dollar / R$ symbol */}
      <rect x="7" y="4" width="2" height="8" fill="#ca8a04" />
      <rect x="5" y="5" width="4" height="2" fill="#a16207" />
      <rect x="7" y="7" width="4" height="2" fill="#a16207" />
      <rect x="5" y="9" width="4" height="2" fill="#a16207" />
    </svg>
  );
};

// Pixel Art Wooden Treasure Chest ("Baú")
export const PixelChest: React.FC<{ coinsLeft: number; totalCoins?: number }> = ({
  coinsLeft,
  totalCoins = 10,
}) => {
  return (
    <div className="flex items-center gap-3 bg-amber-950/90 border-4 border-amber-900 p-2.5 pixel-box-wood text-amber-100 select-none">
      <svg
        width={42}
        height={36}
        viewBox="0 0 20 18"
        className="pixel-art shrink-0 drop-shadow"
        style={{ shapeRendering: 'crispEdges' }}
      >
        {/* Lid Top */}
        <rect x="2" y="2" width="16" height="6" fill="#78350f" />
        <rect x="2" y="2" width="16" height="1" fill="#b45309" />
        <rect x="1" y="3" width="1" height="5" fill="#451a03" />
        <rect x="18" y="3" width="1" height="5" fill="#451a03" />
        {/* Metal bands */}
        <rect x="4" y="2" width="2" height="6" fill="#71717a" />
        <rect x="14" y="2" width="2" height="6" fill="#71717a" />
        {/* Gold Lock */}
        <rect x="9" y="6" width="2" height="4" fill="#eab308" />
        <rect x="9" y="7" width="2" height="1" fill="#713f12" />

        {/* Chest Base */}
        <rect x="2" y="8" width="16" height="8" fill="#451a03" />
        <rect x="3" y="9" width="14" height="6" fill="#78350f" />
        {/* Metal bands on base */}
        <rect x="4" y="8" width="2" height="8" fill="#71717a" />
        <rect x="14" y="8" width="2" height="8" fill="#71717a" />
        {/* Corner rivets */}
        <rect x="4" y="14" width="2" height="1" fill="#d4d4d8" />
        <rect x="14" y="14" width="2" height="1" fill="#d4d4d8" />
      </svg>

      <div className="flex-1">
        <div className="flex items-center justify-between font-pixel-title text-xs text-yellow-300">
          <span>BAÚ DO ORÇAMENTO</span>
          <span className="text-sm font-bold text-yellow-400">
            {coinsLeft}/{totalCoins} MOEDAS
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          {[...Array(totalCoins)].map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 border border-amber-950 flex items-center justify-center transition-all ${
                i < coinsLeft
                  ? 'bg-yellow-400 shadow-[0_0_4px_#fde047]'
                  : 'bg-zinc-800/80 opacity-40'
              }`}
            >
              {i < coinsLeft && <PixelCoin size="sm" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Specialized Pixel Art Pillar Icons (100% Original SVG)
export const PillarIcon: React.FC<{ type: string; color?: string; size?: number }> = ({
  type,
  size = 36,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      className="pixel-art shrink-0"
      style={{ shapeRendering: 'crispEdges' }}
    >
      {/* 1. Estrutura e Tecnologia: PC + Wi-Fi waves */}
      {type === 'tech' && (
        <g>
          {/* Monitor */}
          <rect x="2" y="2" width="12" height="8" fill="#0284c7" />
          <rect x="3" y="3" width="10" height="6" fill="#38bdf8" />
          <rect x="4" y="4" width="3" height="2" fill="#ffffff" />
          {/* Stand */}
          <rect x="7" y="10" width="2" height="2" fill="#0369a1" />
          <rect x="5" y="12" width="6" height="2" fill="#0c4a6e" />
          {/* Antenna wave */}
          <rect x="13" y="1" width="1" height="1" fill="#facc15" />
          <rect x="14" y="2" width="1" height="2" fill="#facc15" />
        </g>
      )}

      {/* 2. Professores: Quadro verde + giz + capelo */}
      {type === 'teachers' && (
        <g>
          {/* Blackboard */}
          <rect x="1" y="2" width="14" height="10" fill="#78350f" />
          <rect x="2" y="3" width="12" height="8" fill="#15803d" />
          {/* Math formula on board */}
          <rect x="4" y="5" width="3" height="1" fill="#ffffff" />
          <rect x="5" y="6" width="1" height="2" fill="#ffffff" />
          <rect x="9" y="5" width="2" height="1" fill="#facc15" />
          <rect x="8" y="7" width="4" height="1" fill="#ffffff" />
          {/* Chalk tray */}
          <rect x="2" y="11" width="12" height="1" fill="#a16207" />
          <rect x="10" y="10" width="2" height="1" fill="#ffffff" />
        </g>
      )}

      {/* 3. Biblioteca: Livro aberto */}
      {type === 'books' && (
        <g>
          {/* Book Spine */}
          <rect x="7" y="3" width="2" height="11" fill="#7c3aed" />
          {/* Pages Left */}
          <rect x="2" y="4" width="5" height="9" fill="#f8fafc" />
          <rect x="1" y="5" width="6" height="8" fill="#ede9fe" />
          <rect x="3" y="6" width="3" height="1" fill="#6d28d9" />
          <rect x="3" y="8" width="3" height="1" fill="#6d28d9" />
          {/* Pages Right */}
          <rect x="9" y="4" width="5" height="9" fill="#f8fafc" />
          <rect x="9" y="5" width="6" height="8" fill="#ede9fe" />
          <rect x="10" y="6" width="3" height="1" fill="#6d28d9" />
          <rect x="10" y="8" width="3" height="1" fill="#6d28d9" />
        </g>
      )}

      {/* 4. Alimentação e Transporte: Maçã vermelha nutritiva */}
      {type === 'food' && (
        <g>
          {/* Apple Stem */}
          <rect x="8" y="1" width="1" height="3" fill="#78350f" />
          <rect x="9" y="2" width="2" height="1" fill="#15803d" />
          {/* Apple Body */}
          <rect x="3" y="4" width="10" height="9" fill="#dc2626" />
          <rect x="4" y="3" width="8" height="11" fill="#dc2626" />
          {/* Highlight */}
          <rect x="5" y="5" width="2" height="3" fill="#fca5a5" />
          <rect x="5" y="4" width="3" height="2" fill="#fca5a5" />
          {/* Base indentation */}
          <rect x="7" y="13" width="2" height="1" fill="#991b1b" />
        </g>
      )}

      {/* 5. Acessibilidade: Rampa e símbolo universal */}
      {type === 'access' && (
        <g>
          {/* Head */}
          <rect x="7" y="2" width="3" height="3" fill="#ec4899" />
          {/* Torso */}
          <rect x="7" y="5" width="2" height="5" fill="#db2777" />
          {/* Arm */}
          <rect x="9" y="6" width="4" height="2" fill="#ec4899" />
          {/* Wheelchair Wheel */}
          <rect x="5" y="8" width="5" height="6" fill="#be185d" />
          <rect x="6" y="9" width="3" height="4" fill="#18181b" />
          {/* Ramp base */}
          <polygon points="1,15 15,15 15,13" fill="#f472b6" />
        </g>
      )}

      {/* 6. Segurança e Convivência: Escudo dourado e azul */}
      {type === 'security' && (
        <g>
          <rect x="3" y="2" width="10" height="2" fill="#b91c1c" />
          <rect x="2" y="3" width="12" height="7" fill="#b91c1c" />
          <rect x="3" y="10" width="10" height="2" fill="#b91c1c" />
          <rect x="4" y="12" width="8" height="2" fill="#b91c1c" />
          <rect x="6" y="14" width="4" height="1" fill="#b91c1c" />
          {/* Shield Emblem */}
          <rect x="5" y="4" width="6" height="6" fill="#facc15" />
          <rect x="7" y="5" width="2" height="4" fill="#ffffff" />
          <rect x="6" y="6" width="4" height="2" fill="#ffffff" />
        </g>
      )}

      {/* 7. Cultura, Esporte e Lazer: Bola de futebol pixelada */}
      {type === 'sports' && (
        <g>
          <rect x="4" y="2" width="8" height="12" fill="#0284c7" />
          <rect x="2" y="4" width="12" height="8" fill="#0284c7" />
          {/* Ball */}
          <rect x="5" y="3" width="6" height="10" fill="#f8fafc" />
          <rect x="3" y="5" width="10" height="6" fill="#f8fafc" />
          {/* Black pentagon patches */}
          <rect x="7" y="7" width="2" height="2" fill="#0f172a" />
          <rect x="4" y="5" width="2" height="1" fill="#0f172a" />
          <rect x="10" y="5" width="2" height="1" fill="#0f172a" />
          <rect x="5" y="10" width="2" height="1" fill="#0f172a" />
          <rect x="9" y="10" width="2" height="1" fill="#0f172a" />
        </g>
      )}

      {/* 8. Orientação para o Futuro: Foguete subindo */}
      {type === 'future' && (
        <g>
          {/* Nose */}
          <rect x="7" y="1" width="2" height="2" fill="#ef4444" />
          {/* Body */}
          <rect x="6" y="3" width="4" height="7" fill="#f8fafc" />
          {/* Window */}
          <rect x="7" y="5" width="2" height="2" fill="#38bdf8" />
          {/* Fins */}
          <rect x="4" y="8" width="2" height="3" fill="#ef4444" />
          <rect x="10" y="8" width="2" height="3" fill="#ef4444" />
          {/* Flame */}
          <rect x="7" y="10" width="2" height="3" fill="#facc15" />
          <rect x="7.5" y="12" width="1" height="3" fill="#f97316" />
        </g>
      )}

      {/* 9. Saúde e Bem-Estar: Coração pixelado com cruz branca */}
      {type === 'health' && (
        <g>
          {/* Heart shape */}
          <rect x="3" y="3" width="4" height="4" fill="#0d9488" />
          <rect x="9" y="3" width="4" height="4" fill="#0d9488" />
          <rect x="2" y="4" width="12" height="5" fill="#0d9488" />
          <rect x="4" y="9" width="8" height="3" fill="#0d9488" />
          <rect x="6" y="12" width="4" height="2" fill="#0d9488" />
          {/* White Cross */}
          <rect x="7" y="5" width="2" height="5" fill="#ffffff" />
          <rect x="5.5" y="6.5" width="5" height="2" fill="#ffffff" />
        </g>
      )}

      {/* 10. Participação Estudantil: Megafone / Grêmio */}
      {type === 'grêmio' && (
        <g>
          {/* Megaphone Cone */}
          <polygon points="4,7 12,3 12,12 4,8" fill="#ea580c" />
          {/* Rim */}
          <rect x="12" y="2" width="2" height="11" fill="#facc15" />
          {/* Sound waves */}
          <rect x="14" y="4" width="1" height="7" fill="#ffffff" />
          {/* Handle */}
          <rect x="6" y="8" width="2" height="4" fill="#7c2d12" />
        </g>
      )}
    </svg>
  );
};
