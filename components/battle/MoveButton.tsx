/**
 * MoveButton.tsx
 * 個々の技を表示し、選択するためのボタンコンポーネント。
 */
import React from 'react';
import { Move, PokemonType } from '../../types';
import { POKEMON_TYPE_COLORS } from '../../constants';

interface MoveButtonProps {
  move: Move;
  currentPP: number;
  onClick: () => void;
  disabled: boolean;
}

export const MoveButton: React.FC<MoveButtonProps> = ({ move, currentPP, onClick, disabled }) => {
  const typeColor = POKEMON_TYPE_COLORS[move.type] || '#777'; 

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`nes-button w-full p-1 text-left text-xs ${disabled ? 'is-disabled' : 'is-normal'}`}
      title={move.description}
    >
      <div className="flex justify-between items-center mb-0.5">
        <span className="font-semibold truncate nes-text-sm" style={{ color: typeColor }}>{move.name}</span>
        <span className="nes-text-2xs px-1 py-0.5 text-white pixel-border-sm" style={{ backgroundColor: typeColor, borderColor:'black', boxShadow:'1px 1px 0 black' }}>
          {move.type}
        </span>
      </div>
      <div className="flex justify-between items-center nes-text-2xs text-gray-700">
        <span>威力: {move.power ?? '—'}</span>
        <span>PP: {currentPP}/{move.pp}</span>
      </div>
    </button>
  );
};