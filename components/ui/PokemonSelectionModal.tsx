/**
 * PokemonSelectionModal.tsx
 * アイテム使用時に対象のポケモンを選択するためのモーダル。
 */
import React from 'react';
import { OwnedPokemonDetails, PokemonData, Item } from '../../types';
import { POKEMON_TYPE_COLORS } from '../../constants'; 

interface PokemonSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item;
  ownedPokemonDetails: Record<string, OwnedPokemonDetails>;
  allPokemonData: PokemonData[]; 
  onSelectPokemon: (pokemonId: string) => void;
}

export const PokemonSelectionModal: React.FC<PokemonSelectionModalProps> = ({
  isOpen,
  onClose,
  item,
  ownedPokemonDetails,
  allPokemonData,
  onSelectPokemon,
}) => {
  if (!isOpen) return null;

  const ownedAndTargetablePokemon = Object.values(ownedPokemonDetails).filter(details => {
    const pokemonData = allPokemonData.find(p => p.id === details.id);
    if (!pokemonData) return false;

    if (item.effect?.type === 'revive') {
      return details.currentHp <= 0; 
    }
    if (item.effect?.type.startsWith('heal_')) {
      return details.currentHp > 0 && details.currentHp < details.currentMaxHp; 
    }
    return details.currentHp > 0; 
  });

  return (
    <div 
      className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-2"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pokemon-selection-modal-title"
    >
      <div 
        className="nes-panel-modal w-full max-w-sm max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center nes-header">
          <h2 id="pokemon-selection-modal-title" className="text-sm">
            だれに <span className="text-green-700">{item.name}</span> を？
          </h2>
          <button 
            onClick={onClose} 
            className="nes-close-button"
            aria-label="閉じる"
          >
            &times;
          </button>
        </div>
        
        <div className="nes-content-scrollable custom-scrollbar flex-grow py-1">
            {ownedAndTargetablePokemon.length > 0 ? (
            <ul className="space-y-1">
                {ownedAndTargetablePokemon.map(details => {
                const pokemonData = allPokemonData.find(p => p.id === details.id);
                if (!pokemonData) return null;
                const isFainted = details.currentHp <= 0;
                const canBeHealedByThisItem = 
                    (item.effect?.type === 'revive' && isFainted) ||
                    (item.effect?.type.startsWith('heal_') && !isFainted && details.currentHp < details.currentMaxHp);

                return (
                    <li key={details.id}>
                    <button
                        onClick={() => onSelectPokemon(details.id)}
                        disabled={!canBeHealedByThisItem}
                        className={`nes-button w-full flex items-center p-1 text-xs
                        ${!canBeHealedByThisItem 
                            ? 'is-disabled' 
                            : 'is-primary' 
                        }`}
                    >
                        <img src={pokemonData.imageUrl} alt={pokemonData.name} className={`pixelated-img w-8 h-8 mr-2 ${isFainted ? 'filter grayscale' : ''}`} />
                        <div className="text-left">
                        <p className="font-semibold nes-text-sm">{pokemonData.name} <span className="nes-text-xs">(Lv.{details.level})</span></p>
                        <p className="nes-text-2xs">HP: {details.currentHp}/{details.currentMaxHp}</p>
                        </div>
                        {!canBeHealedByThisItem && <span className="ml-auto nes-text-xs text-red-500">対象外</span>}
                    </button>
                    </li>
                );
                })}
            </ul>
            ) : (
                <p className="text-center text-gray-600 py-2 nes-text-sm">
                    {item.name} を使えるポケモンがいません。
                </p>
            )}
        </div>

        <button
          onClick={onClose}
          className="nes-button is-normal mt-2 text-xs"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
};