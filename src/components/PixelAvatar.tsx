import React from 'react';
import { AvatarConfig } from '../types';

export const SKIN_TONES = [
  { name: '1. Clara Rosada (Pêssego)', hex: '#fdd9b5', shadow: '#e6ab84', blush: '#fb7185', desc: 'Tom claro rosado' },
  { name: '2. Clara Dourada (Bege Mel)', hex: '#f5c285', shadow: '#cb9250', blush: '#f43f5e', desc: 'Tom bege dourado' },
  { name: '3. Morena Canela (Amêndoa)', hex: '#d2894b', shadow: '#a35f29', blush: '#e11d48', desc: 'Tom moreno médio' },
  { name: '4. Morena Café (Bronze Quente)', hex: '#ab622e', shadow: '#793c13', blush: '#be123c', desc: 'Tom moreno escuro' },
  { name: '5. Negra Radiante (Chocolate)', hex: '#7a3e18', shadow: '#512409', blush: '#9f1239', desc: 'Tom negro chocolate' },
  { name: '6. Negra Retinta Luminosa (Ébano)', hex: '#4e2814', shadow: '#311406', blush: '#881337', desc: 'Tom negro retinto vivo' },
];

export const HAIR_COLORS = [
  { name: 'Preto Ébano', hex: '#18181b', highlight: '#475569' },
  { name: 'Castanho Chocolate', hex: '#451a03', highlight: '#78350f' },
  { name: 'Castanho Caramelo', hex: '#854d0e', highlight: '#d97706' },
  { name: 'Loiro Dourado', hex: '#eab308', highlight: '#fef08a' },
  { name: 'Ruivo Carmim', hex: '#b91c1c', highlight: '#f87171' },
  { name: 'Grisalho Platina', hex: '#cbd5e1', highlight: '#ffffff' },
];

export const DEFAULT_FEMININE_AVATAR: AvatarConfig = {
  skin: 2, // Tom 3 (Morena Canela)
  hairStyle: 2, // Longo Solto com Mechas
  hairColor: '#18181b', // Preto Ébano
  outfit: 1, // Blazer Moderno
  outfitColor: '#b91c1c', // Vinho Nobre
  accessory: 2, // Faixa de Deputada
};

export const DEFAULT_MASCULINE_AVATAR: AvatarConfig = {
  skin: 2, // Tom 3 (Morena Canela)
  hairStyle: 0, // Corte Básico Social
  hairColor: '#18181b', // Preto Ébano
  outfit: 0, // Terno Parlamentar
  outfitColor: '#2563eb', // Azul Real
  accessory: 1, // Gravata Vermelha
};

export const DEFAULT_AGENDER_AVATAR: AvatarConfig = {
  skin: 2, // Tom 3 (Morena Canela - tom neutro equilibrado)
  hairStyle: 2, // Longo Solto com Mechas (padrão diverso e representativo)
  hairColor: '#18181b', // Preto Ébano
  outfit: 1, // Blazer Moderno
  outfitColor: '#b91c1c', // Vinho Nobre
  accessory: 2, // Faixa de Deputada
};

export const HAIR_STYLES = [
  'Corte Básico Neutro',
  'Afro Fade',
  'Longo Solto com Mechas',
  'Black Power Volumoso',
  'Tranças com Anéis Dourados',
  'Coque Alto com Franja',
  'Raspado / Neutro',
];

export const OUTFIT_STYLES = [
  'Terno Parlamentar',
  'Blazer Moderno',
  'Camiseta do Grêmio',
  'Moletom Estudantil',
  'Uniforme da Escola MM',
];

export const OUTFIT_COLORS = [
  { name: 'Azul Real', hex: '#2563eb', trim: '#1d4ed8', lapel: '#1e3a8a' },
  { name: 'Verde Bandeira', hex: '#16a34a', trim: '#15803d', lapel: '#14532d' },
  { name: 'Vinho Nobre', hex: '#b91c1c', trim: '#991b1b', lapel: '#7f1d1d' },
  { name: 'Amarelo Ouro', hex: '#d97706', trim: '#b45309', lapel: '#78350f' },
  { name: 'Roxo Imperial', hex: '#7c3aed', trim: '#6d28d9', lapel: '#4c1d95' },
  { name: 'Branco Pérola', hex: '#f8fafc', trim: '#cbd5e1', lapel: '#94a3b8' },
];

export const ACCESSORY_STYLES = [
  'Nenhum',
  'Gravata Vermelha',
  'Faixa de Deputado(a)',
  'Óculos Retrô',
  'Crachá Oficial',
];

interface PixelAvatarProps {
  config: AvatarConfig;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  isWalking?: boolean;
  className?: string;
}

export const PixelAvatar: React.FC<PixelAvatarProps> = ({
  config,
  size = 'md',
  isWalking = false,
  className = '',
}) => {
  const skin = SKIN_TONES[config.skin % SKIN_TONES.length] || SKIN_TONES[0];
  const hairColorObj =
    HAIR_COLORS.find((c) => c.hex === config.hairColor) || HAIR_COLORS[0];
  const outfitColorObj =
    OUTFIT_COLORS.find((c) => c.hex === config.outfitColor) || OUTFIT_COLORS[0];

  const sizePixels = {
    sm: 46,
    md: 70,
    lg: 112,
    xl: 165,
    hero: 225,
  }[size];

  // Distinct dark outline color for pixel art crispness
  const outlineColor = '#0f172a';

  return (
    <div
      className={`relative inline-block select-none pixel-art ${className}`}
      style={{
        width: `${sizePixels}px`,
        height: `${sizePixels * 1.18}px`,
        filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.35))',
      }}
    >
      <svg
        viewBox="0 0 24 28"
        className="w-full h-full"
        style={{ shapeRendering: 'crispEdges' }}
      >
        {/* Soft shadow beneath shoes */}
        <ellipse cx="12" cy="27" rx="7.5" ry="1.2" fill="#000000" opacity="0.35" />

        {/* --- LEGS & SHOES --- */}
        {/* Left Leg */}
        <g className={isWalking ? 'anim-walk-left origin-top' : ''}>
          <rect x="6.5" y="19" width="4.5" height="6" fill={outlineColor} />
          <rect x="7" y="19" width="3.5" height="5.5" fill="#1e293b" />
          <rect x="7" y="19" width="1" height="5.5" fill="#334155" />
          {/* Left Shoe */}
          <rect x="5.5" y="24.5" width="5.5" height="2.5" fill={outlineColor} />
          <rect x="6" y="25" width="4.5" height="1.8" fill="#09090b" />
          <rect x="6" y="25" width="4.5" height="0.6" fill="#52525b" />
        </g>

        {/* Right Leg */}
        <g className={isWalking ? 'anim-walk-right origin-top' : ''}>
          <rect x="13" y="19" width="4.5" height="6" fill={outlineColor} />
          <rect x="13.5" y="19" width="3.5" height="5.5" fill="#1e293b" />
          <rect x="16" y="19" width="1" height="5.5" fill="#0f172a" />
          {/* Right Shoe */}
          <rect x="13" y="24.5" width="5.5" height="2.5" fill={outlineColor} />
          <rect x="13.5" y="25" width="4.5" height="1.8" fill="#09090b" />
          <rect x="13.5" y="25" width="4.5" height="0.6" fill="#52525b" />
        </g>

        {/* --- TORSO & OUTFIT --- */}
        {/* Dark outline perimeter for torso */}
        <rect x="5.5" y="10.5" width="13" height="8.8" fill={outlineColor} />
        {/* Base Torso Fabric */}
        <rect x="6" y="11" width="12" height="8" fill={outfitColorObj.hex} />
        {/* Side shading */}
        <rect x="6" y="11" width="1" height="8" fill={outfitColorObj.trim} />
        <rect x="17" y="11" width="1" height="8" fill={outfitColorObj.trim} />
        <rect x="6" y="18" width="12" height="1" fill={outfitColorObj.trim} />

        {/* Specific outfit details */}
        {config.outfit === 0 && (
          // Terno Parlamentar: White shirt collar, lapels, center seam & dark buttons
          <>
            <polygon points="10,11 12,14 14,11" fill="#ffffff" />
            <rect x="11" y="14" width="2" height="4" fill="#ffffff" />
            <rect x="11.5" y="15" width="1" height="0.8" fill="#18181b" />
            <rect x="11.5" y="17" width="1" height="0.8" fill="#18181b" />
            <polygon points="7,11 9.5,15 7,16" fill={outfitColorObj.lapel} />
            <polygon points="17,11 14.5,15 17,16" fill={outfitColorObj.lapel} />
          </>
        )}

        {config.outfit === 1 && (
          // Blazer Moderno: Contrasting inner top & open front lapels
          <>
            <rect x="10" y="11" width="4" height="7" fill="#ffffff" />
            <rect x="8.5" y="11" width="1.5" height="7.5" fill={outfitColorObj.lapel} />
            <rect x="14" y="11" width="1.5" height="7.5" fill={outfitColorObj.lapel} />
          </>
        )}

        {config.outfit === 2 && (
          // Camiseta do Grêmio: Vibrant student union seal with bold blue/gold badge
          <>
            <rect x="9" y="11" width="6" height="1.5" fill="#facc15" />
            <rect x="9.5" y="13.5" width="5" height="4" fill="#ffffff" />
            <rect x="10.5" y="14.5" width="3" height="2" fill="#0284c7" />
          </>
        )}

        {config.outfit === 3 && (
          // Moletom Estudantil: Hood cords & kangaroo pocket
          <>
            <rect x="10" y="11" width="4" height="2" fill={outfitColorObj.trim} />
            <rect x="10.5" y="12" width="1" height="2.5" fill="#ffffff" />
            <rect x="12.5" y="12" width="1" height="2.5" fill="#ffffff" />
            <rect x="7.5" y="15" width="9" height="3" fill={outfitColorObj.trim} />
            <rect x="8.5" y="16" width="7" height="1" fill="#ffffff" opacity="0.3" />
          </>
        )}

        {config.outfit === 4 && (
          // Uniforme da Escola Pública: Green & yellow breast band
          <>
            <rect x="8" y="11" width="8" height="2" fill="#ffffff" />
            <rect x="6" y="13" width="12" height="2.5" fill="#15803d" />
            <rect x="6" y="14" width="12" height="1" fill="#facc15" />
          </>
        )}

        {/* Arms and Hands with dark border */}
        {/* Left Arm */}
        <rect x="3.5" y="11.5" width="3" height="7" fill={outlineColor} />
        <rect x="4" y="12" width="2" height="5.5" fill={outfitColorObj.hex} />
        <rect x="4" y="12" width="1" height="5.5" fill={outfitColorObj.trim} />
        <rect x="4" y="17" width="2" height="2" fill={skin.hex} />

        {/* Right Arm */}
        <rect x="17.5" y="11.5" width="3" height="7" fill={outlineColor} />
        <rect x="18" y="12" width="2" height="5.5" fill={outfitColorObj.hex} />
        <rect x="19" y="12" width="1" height="5.5" fill={outfitColorObj.trim} />
        <rect x="18" y="17" width="2" height="2" fill={skin.hex} />

        {/* --- HEAD & NECK --- */}
        {/* Neck with shadow */}
        <rect x="9.5" y="9" width="5" height="2.2" fill={outlineColor} />
        <rect x="10" y="9" width="4" height="2" fill={skin.shadow} />

        {/* Head Outline Box (Dark pixel perimeter) */}
        <rect x="6.5" y="1.5" width="11" height="9" fill={outlineColor} />
        {/* Head Block with rich warm skin tone */}
        <rect x="7" y="2" width="10" height="8" fill={skin.hex} />
        {/* Forehead light warmth */}
        <rect x="8" y="2.5" width="8" height="1" fill="#ffffff" opacity="0.08" />
        {/* Jaw & chin shadow */}
        <rect x="7" y="8" width="10" height="2" fill={skin.shadow} opacity="0.45" />

        {/* Nose pixel */}
        <rect x="11.5" y="6" width="1" height="1" fill={skin.shadow} />

        {/* --- BOLD, CLEAR, EXPRESSIVE PIXEL EYES (VIVID CONTRAST ON ALL SCREENS) --- */}
        {/* Left eye: Bold White Sclera + Dark Pupil + Crisp Glint + Eye Border */}
        {/* Eye contour line */}
        <rect x="7.5" y="4" width="3.5" height="0.8" fill="#09090b" />
        {/* White Sclera (pure vivid white) */}
        <rect x="7.5" y="4.8" width="3.5" height="2" fill="#ffffff" />
        {/* Dark Pupil */}
        <rect x="8.7" y="4.8" width="2" height="2" fill="#09090b" />
        {/* Glint Sparkle */}
        <rect x="8.7" y="4.8" width="1" height="1" fill="#ffffff" />

        {/* Right eye */}
        <rect x="13" y="4" width="3.5" height="0.8" fill="#09090b" />
        <rect x="13" y="4.8" width="3.5" height="2" fill="#ffffff" />
        <rect x="13.3" y="4.8" width="2" height="2" fill="#09090b" />
        <rect x="14.3" y="4.8" width="1" height="1" fill="#ffffff" />

        {/* Defined Eyebrows */}
        <rect x="7.5" y="3.2" width="3" height="0.8" fill={hairColorObj.hex} />
        <rect x="13.5" y="3.2" width="3" height="0.8" fill={hairColorObj.hex} />

        {/* Rosy Cheeks Blush */}
        <rect x="7.2" y="7" width="1.6" height="1" fill={skin.blush} opacity="0.7" />
        <rect x="15.2" y="7" width="1.6" height="1" fill={skin.blush} opacity="0.7" />

        {/* Smiling Mouth */}
        <rect x="10" y="8" width="4" height="1" fill="#7f1d1d" />
        <rect x="10.8" y="8" width="2.4" height="1" fill="#dc2626" />
        <rect x="10.5" y="8" width="3" height="0.4" fill="#ffffff" opacity="0.9" />

        {/* --- HAIRSTYLES (CRISP FEMININE & MASCULINE SILHOUETTES) --- */}
        {config.hairStyle === 0 && (
          // Curto Social
          <>
            <rect x="6.5" y="1" width="11" height="2.5" fill={outlineColor} />
            <rect x="6.5" y="1.5" width="11" height="2" fill={hairColorObj.hex} />
            <rect x="6" y="2.5" width="2" height="3" fill={hairColorObj.hex} />
            <rect x="16" y="2.5" width="2" height="3" fill={hairColorObj.hex} />
            <rect x="8" y="1.5" width="6" height="1" fill={hairColorObj.highlight} />
          </>
        )}

        {config.hairStyle === 1 && (
          // Afro Fade
          <>
            <rect x="5.5" y="0.5" width="13" height="3.5" fill={outlineColor} />
            <rect x="6" y="1" width="12" height="3" fill={hairColorObj.hex} />
            <rect x="5.5" y="3" width="2.5" height="4" fill={hairColorObj.hex} />
            <rect x="16" y="3" width="2.5" height="4" fill={hairColorObj.hex} />
            <rect x="7" y="1" width="9" height="1" fill={hairColorObj.highlight} />
          </>
        )}

        {config.hairStyle === 2 && (
          // Longo Solto com Mechas (Feminino Elegante)
          <>
            <rect x="5.5" y="0.8" width="13" height="3" fill={outlineColor} />
            <rect x="6" y="1.2" width="12" height="2.5" fill={hairColorObj.hex} />
            {/* Long cascading strands */}
            <rect x="4.5" y="2.5" width="3" height="12" fill={outlineColor} />
            <rect x="5" y="3" width="2.5" height="11.5" fill={hairColorObj.hex} />
            <rect x="16.5" y="2.5" width="3" height="12" fill={outlineColor} />
            <rect x="16.5" y="3" width="2.5" height="11.5" fill={hairColorObj.hex} />
            <rect x="7.5" y="1.2" width="8" height="1" fill={hairColorObj.highlight} />
            <rect x="5.2" y="4" width="1" height="8" fill={hairColorObj.highlight} opacity="0.7" />
            <rect x="17.8" y="4" width="1" height="8" fill={hairColorObj.highlight} opacity="0.7" />
          </>
        )}

        {config.hairStyle === 3 && (
          // Black Power Volumoso
          <>
            <rect x="3.5" y="0" width="17" height="6.5" fill={outlineColor} />
            <rect x="4" y="0.5" width="16" height="5.5" fill={hairColorObj.hex} />
            <rect x="3.5" y="4" width="3.5" height="6" fill={hairColorObj.hex} />
            <rect x="17" y="4" width="3.5" height="6" fill={hairColorObj.hex} />
            <rect x="6" y="1" width="12" height="1.5" fill={hairColorObj.highlight} />
            <rect x="5" y="3" width="1.5" height="5" fill={hairColorObj.highlight} opacity="0.6" />
          </>
        )}

        {config.hairStyle === 4 && (
          // Tranças Box Braids com Anéis Dourados
          <>
            <rect x="5.5" y="0.8" width="13" height="3" fill={outlineColor} />
            <rect x="6" y="1.2" width="12" height="2.5" fill={hairColorObj.hex} />
            {/* Left Braids */}
            <rect x="4.5" y="2.5" width="2.8" height="10.5" fill={hairColorObj.hex} />
            <rect x="5.2" y="3" width="1" height="8" fill={hairColorObj.highlight} />
            {/* Right Braids */}
            <rect x="16.7" y="2.5" width="2.8" height="10.5" fill={hairColorObj.hex} />
            <rect x="17.5" y="3" width="1" height="8" fill={hairColorObj.highlight} />
            {/* Middle Braids */}
            <rect x="8" y="2" width="1.2" height="5" fill={hairColorObj.highlight} />
            <rect x="14.8" y="2" width="1.2" height="5" fill={hairColorObj.highlight} />
            {/* Golden beads/rings at ends */}
            <rect x="4.5" y="12" width="2.8" height="1.8" fill="#facc15" stroke="#713f12" strokeWidth="0.3" />
            <rect x="16.7" y="12" width="2.8" height="1.8" fill="#facc15" stroke="#713f12" strokeWidth="0.3" />
          </>
        )}

        {config.hairStyle === 5 && (
          // Coque Alto com Mechas / Franja (Feminino Sofisticado)
          <>
            {/* Top Bun with Hair Clip */}
            <rect x="8.5" y="0" width="7" height="3" fill={outlineColor} />
            <rect x="9" y="0.5" width="6" height="2.2" fill={hairColorObj.hex} />
            <rect x="10" y="0.5" width="4" height="0.8" fill={hairColorObj.highlight} />
            <rect x="11.5" y="1" width="1" height="1.5" fill="#facc15" />
            {/* Head Hair & Side Strands */}
            <rect x="6" y="2" width="12" height="2.5" fill={hairColorObj.hex} />
            <rect x="5.5" y="3" width="2" height="5" fill={hairColorObj.hex} />
            <rect x="16.5" y="3" width="2" height="5" fill={hairColorObj.hex} />
          </>
        )}

        {config.hairStyle === 6 && (
          // Raspado / Neutro (Base limpa raspada, contorno suave)
          <>
            <rect x="7" y="1.5" width="10" height="1.5" fill={hairColorObj.hex} opacity="0.3" />
            <rect x="6.5" y="2.5" width="1" height="2" fill={hairColorObj.hex} opacity="0.3" />
            <rect x="16.5" y="2.5" width="1" height="2" fill={hairColorObj.hex} opacity="0.3" />
          </>
        )}

        {/* --- ACCESSORIES --- */}
        {config.accessory === 1 && (
          // Gravata Parlamentar (Vermelho vibrante)
          <>
            <polygon points="11,11 13,11 12,13.5" fill="#dc2626" />
            <rect x="11.2" y="13" width="1.6" height="5.5" fill="#dc2626" />
            <polygon points="10.8,17.5 13.2,17.5 12,19.5" fill="#dc2626" />
            <rect x="11.8" y="14" width="0.5" height="4" fill="#f87171" />
          </>
        )}

        {config.accessory === 2 && (
          // Faixa de Deputada / Deputado (Verde e Amarela transversal com franja dourada)
          <>
            <polygon points="6,12 8.5,11 16.5,19 14,19" fill="#15803d" />
            <polygon points="7,12 8.5,11 15.5,19 14.5,19" fill="#facc15" />
            <rect x="14" y="18" width="2" height="1" fill="#ca8a04" />
          </>
        )}

        {config.accessory === 3 && (
          // Óculos Retrô (Aro preto marcante com leve reflexo)
          <>
            <rect x="7" y="3.8" width="4.5" height="3.2" fill="#38bdf8" fillOpacity="0.25" stroke="#09090b" strokeWidth="0.8" />
            <rect x="12.5" y="3.8" width="4.5" height="3.2" fill="#38bdf8" fillOpacity="0.25" stroke="#09090b" strokeWidth="0.8" />
            <rect x="11.2" y="4.8" width="1.6" height="0.8" fill="#09090b" />
          </>
        )}

        {config.accessory === 4 && (
          // Crachá Oficial da Câmara
          <>
            <rect x="14" y="12" width="3.5" height="5" fill="#ffffff" stroke="#1d4ed8" strokeWidth="0.6" />
            <rect x="14.8" y="13" width="1.8" height="1.2" fill="#1d4ed8" />
            <rect x="14.5" y="15" width="2.5" height="0.8" fill="#1e293b" />
          </>
        )}
      </svg>
    </div>
  );
};
