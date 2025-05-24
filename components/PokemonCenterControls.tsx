/**
 * PokemonCenterControls.tsx
 *
 * このコンポーネントは、「ポケモンセンター」エリアを担当します。
 * プレイヤーが手持ちのポケモン全員のHPを回復するためのボタンを提供します。
 * 全滅時には特に目立つように表示されます。
 */
import React from 'react';

interface PokemonCenterControlsProps {
  onHealAllPokemon: () => void; 
  canHeal: boolean; 
  allPlayerPokemonFainted: boolean; 
}

export const PokemonCenterControls: React.FC<PokemonCenterControlsProps> = ({ 
  onHealAllPokemon,
  canHeal,
  allPlayerPokemonFainted
}) => {
  return (
    <div className={`nes-panel ${allPlayerPokemonFainted ? 'bg-red-200 border-red-600' : ''}`}>
      <h2 className={`text-lg font-bold text-center mb-2 ${allPlayerPokemonFainted ? 'text-red-700' : 'text-pink-600'}`}>ポケモンセンター</h2>
      
      {allPlayerPokemonFainted && (
        <p className="text-center text-red-700 font-semibold mb-1 nes-text-sm">
          目の前が真っ暗になった！ ポケモンを回復しよう！
        </p>
      )}

      <button
        onClick={onHealAllPokemon}
        disabled={!canHeal}
        className={`nes-button w-full text-xs
          ${!canHeal 
            ? 'is-disabled' 
            : allPlayerPokemonFainted 
              ? 'is-error' 
              : 'is-success' // 通常時は緑色のボタン
          }`}
      >
        {allPlayerPokemonFainted ? '全員回復(HP/PP全快)' : 'ポケモン回復(HP/PP全快)'}
      </button>
      {!canHeal && !allPlayerPokemonFainted && (
        <p className="nes-text-xs text-gray-600 mt-1 text-center">
          みんな元気いっぱいのようだ！
        </p>
      )}
    </div>
  );
};