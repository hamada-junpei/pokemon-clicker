/**
 * PokedexModal.tsx
 *
 * このコンポーネントは、ポケモン図鑑のモーダル表示を担当します。
 * 捕まえたポケモンとまだ捕まえていないポケモンを一覧表示し、
 * 捕獲済みのポケモンについては詳細情報（説明文、初捕獲日時など）も確認できます。
 */
import React, { useState, useCallback } from 'react';
import { PokemonData, OwnedPokemonDetails, Move, PokemonType } from '../types'; 

interface PokedexModalProps {
  // Fix: Added missing isOpen prop to PokedexModalProps interface
  isOpen: boolean; 
  allPokemonData: PokemonData[]; 
  ownedPokemonDetails: Record<string, OwnedPokemonDetails>; 
  firstCaughtAt: Record<string, number>; 
  onClose: () => void; 
  getMoveData: (moveId: string) => Move | undefined;
  pokemonTypeColors: Record<PokemonType, string>;
}

const formatDateTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const PokedexModal: React.FC<PokedexModalProps> = ({
  isOpen,
  allPokemonData,
  ownedPokemonDetails, 
  firstCaughtAt,
  onClose,
  getMoveData,
  pokemonTypeColors,
}) => {
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonData | null>(null);
  const [selectedPokemonCurrentDetails, setSelectedPokemonCurrentDetails] = useState<OwnedPokemonDetails | null>(null);

  const handlePokemonCardClick = useCallback((pokemon: PokemonData) => {
    if (ownedPokemonDetails[pokemon.id]) { 
      setSelectedPokemon(pokemon);
      setSelectedPokemonCurrentDetails(ownedPokemonDetails[pokemon.id]);
    }
  }, [ownedPokemonDetails]);

  const handleCloseDetail = useCallback(() => {
    setSelectedPokemon(null);
    setSelectedPokemonCurrentDetails(null);
  }, []);

  const caughtCount = Object.keys(ownedPokemonDetails).length;
  const totalPokemonCount = allPokemonData.length;

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-2"
      onClick={onClose} 
      role="dialog"
      aria-modal="true"
      aria-labelledby="pokedex-title"
    >
      <div 
        className="nes-panel-modal w-full max-w-lg h-[90vh] max-h-[500px] flex flex-col"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex justify-between items-center nes-header">
          <h2 id="pokedex-title" className="text-lg">ポケモン図鑑</h2>
          <p className="nes-text-sm">
            発見: {caughtCount}/{totalPokemonCount}
          </p>
          <button 
            onClick={onClose} 
            className="nes-close-button"
            aria-label="図鑑を閉じる"
          >
            &times; 
          </button>
        </div>

        <div className="flex-grow flex flex-col md:flex-row gap-2 overflow-hidden">
          <div className={`custom-scrollbar overflow-y-auto pr-1 ${selectedPokemon ? 'w-full md:w-3/5' : 'w-full'}`}>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
              {allPokemonData.map((pokemon, index) => {
                const isCaught = !!ownedPokemonDetails[pokemon.id];
                return (
                  <div
                    key={pokemon.id}
                    className={`p-1 pixel-border-sm text-center transition-all duration-150 ease-in-out
                      ${isCaught 
                        ? 'bg-sky-200 hover:bg-sky-300 cursor-pointer pixel-shadow-sm' 
                        : 'bg-gray-300'
                      }`}
                    onClick={() => handlePokemonCardClick(pokemon)}
                    role="button"
                    tabIndex={isCaught ? 0 : -1}
                    aria-label={isCaught ? `${pokemon.name} の詳細を見る` : `${pokemon.name} (未発見)`}
                  >
                    <img
                      src={pokemon.imageUrl}
                      alt={isCaught ? pokemon.name : '未発見'}
                      className={`pixelated-img w-12 h-12 mx-auto object-contain ${!isCaught && 'filter brightness-0 opacity-50'}`}
                      draggable="false"
                    />
                    <p className="nes-text-2xs truncate">
                      {isCaught ? pokemon.name : '？？？'}
                    </p>
                    <p className="nes-text-2xs text-slate-600">No.{String(index + 1).padStart(3, '0')}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedPokemon && selectedPokemonCurrentDetails && (
            <div className="w-full md:w-2/5 bg-white p-2 pixel-border flex flex-col items-center overflow-y-auto custom-scrollbar mt-2 md:mt-0">
              <img 
                src={selectedPokemon.imageUrl} 
                alt={selectedPokemon.name} 
                className="pixelated-img w-20 h-20 object-contain mb-1"
                draggable="false"
              />
              <h3 className="text-sm font-bold text-yellow-700 mb-0.5">{selectedPokemon.name}</h3>
              <p className="nes-text-xs text-slate-700 mb-0.5">
                Lv: <span className="font-semibold">{selectedPokemonCurrentDetails.level}</span>
              </p>
              <div className="flex justify-center space-x-1 mb-1">
                {selectedPokemon.types.map(type => (
                  <span
                    key={type}
                    className="px-1 py-0.5 nes-text-2xs text-white pixel-border-sm"
                    style={{ backgroundColor: pokemonTypeColors[type] || '#777', borderColor:'black', boxShadow:'1px 1px 0 black' }}
                  >
                    {type}
                  </span>
                ))}
              </div>
              <p className="nes-text-xs text-slate-600 mb-1">No. {String(allPokemonData.findIndex(p => p.id === selectedPokemon.id) + 1).padStart(3, '0')}</p>
              
              <div className="bg-slate-200 p-1 pixel-border-sm w-full mb-1 text-xs text-slate-800 text-left">
                <p className="font-semibold mb-0.5 nes-text-xs">図鑑説明:</p>
                <p className="leading-tight nes-text-2xs">{selectedPokemon.description}</p>
              </div>
              
              {firstCaughtAt[selectedPokemon.id] && (
                <div className="bg-slate-200 p-1 pixel-border-sm w-full text-xs text-slate-800 text-left mb-1">
                  <p className="font-semibold mb-0.5 nes-text-xs">初捕獲:</p>
                  <p className="nes-text-2xs">{formatDateTime(firstCaughtAt[selectedPokemon.id])}</p>
                </div>
              )}

              <div className="bg-slate-200 p-1 pixel-border-sm w-full text-xs text-slate-800 text-left mb-1">
                  <p className="font-semibold mb-0.5 nes-text-xs">ステータス:</p>
                  <p className="nes-text-2xs">HP: {Math.ceil(selectedPokemonCurrentDetails.currentMaxHp)}</p>
                  <p className="nes-text-2xs">こうげき: {selectedPokemonCurrentDetails.stats.attack}</p>
                  <p className="nes-text-2xs">ぼうぎょ: {selectedPokemonCurrentDetails.stats.defense}</p>
                  <p className="nes-text-2xs">とくこう: {selectedPokemonCurrentDetails.stats.specialAttack}</p>
                  <p className="nes-text-2xs">とくぼう: {selectedPokemonCurrentDetails.stats.specialDefense}</p>
                  <p className="nes-text-2xs">すばやさ: {selectedPokemonCurrentDetails.stats.speed}</p>
                  
                  <p className="font-semibold mt-0.5 mb-0.5 nes-text-xs">覚えている技:</p>
                  {selectedPokemonCurrentDetails.learnedMoves.length > 0 ? (
                    <ul className="list-disc list-inside pl-2">
                        {selectedPokemonCurrentDetails.learnedMoves.map(lm => {
                            const move = getMoveData(lm.moveId);
                            return <li key={lm.moveId} className="nes-text-2xs">{move ? move.name : lm.moveId}</li>;
                        })}
                    </ul>
                  ) : (
                    <p className="nes-text-2xs">なし</p>
                  )}
              </div>

              <button 
                onClick={handleCloseDetail}
                className="nes-button is-error mt-auto text-xs self-stretch"
                aria-label={`${selectedPokemon.name} の詳細を閉じる`}
              >
                閉じる
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};