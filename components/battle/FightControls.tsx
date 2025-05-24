/**
 * FightControls.tsx
 * 戦闘コマンドのUI（たたかう、ポケモン、どうぐ、にげる）と技選択UIを提供します。
 */
import React, { useState } from 'react';
import { OwnedPokemonDetails, Move } from '../../types';
import { MoveButton } from './MoveButton'; 
import { POKEMONS } from '../../constants';

interface FightControlsProps {
  playerPokemon: OwnedPokemonDetails | null;
  onAttack: (moveId: string) => void;
  onSwitchPokemon: (pokemonIndex: number) => void; 
  onUseItem: () => void; 
  onRun: () => void;
  disabled: boolean; 
  getMoveData: (moveId: string) => Move | undefined;
  ownedPokemonDetailsList: OwnedPokemonDetails[]; 
  currentPokemonIndex: number;
  isAutoBattleUnlocked: boolean;
  isAutoBattleActive: boolean;
  onToggleAutoBattle: () => void;
}

export const FightControls: React.FC<FightControlsProps> = ({
  playerPokemon,
  onAttack,
  onSwitchPokemon,
  onUseItem,
  onRun,
  disabled,
  getMoveData,
  ownedPokemonDetailsList,
  currentPokemonIndex,
  isAutoBattleUnlocked,
  isAutoBattleActive,
  onToggleAutoBattle,
}) => {
  const [showMoves, setShowMoves] = useState(false);
  const [showPokemonSwitch, setShowPokemonSwitch] = useState(false);

  if (!playerPokemon || playerPokemon.currentHp <= 0) {
    return (
      <div className="nes-panel p-2 text-center">
        <p className="nes-text-sm text-gray-600">たたかえるポケモンがいません...</p>
      </div>
    );
  }

  const handleShowMoves = () => {
    setShowMoves(true);
    setShowPokemonSwitch(false);
  };

  const handleShowPokemonSwitch = () => {
    setShowPokemonSwitch(true);
    setShowMoves(false);
  }

  const handleBackToMainCommands = () => {
    setShowMoves(false);
    setShowPokemonSwitch(false);
  };

  const handleSelectMove = (moveId: string) => {
    onAttack(moveId);
  };

  const handleSelectSwitchPokemon = (index: number) => {
    onSwitchPokemon(index);
    setShowPokemonSwitch(false);
  }
  
  const mainControlsDisabled = disabled || isAutoBattleActive;

  return (
    <div className="nes-panel p-2">
      {!showMoves && !showPokemonSwitch && (
        <>
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={handleShowMoves}
              disabled={mainControlsDisabled || playerPokemon.learnedMoves.length === 0}
              className="nes-button is-error text-xs" 
            >
              たたかう
            </button>
            <button
              onClick={handleShowPokemonSwitch}
              disabled={mainControlsDisabled || ownedPokemonDetailsList.filter(p => p.currentHp > 0).length <= 1}
              className="nes-button is-success text-xs" 
            >
              ポケモン
            </button>
            <button
              onClick={onUseItem}
              disabled={mainControlsDisabled} 
              className="nes-button is-primary text-xs" 
            >
              どうぐ
            </button>
            <button
              onClick={onRun}
              disabled={mainControlsDisabled}
              className="nes-button is-warning text-xs" 
            >
              にげる
            </button>
          </div>
          {isAutoBattleUnlocked && (
            <button
              onClick={onToggleAutoBattle}
              disabled={disabled && !isAutoBattleActive} // 戦闘処理中は停止もできないようにする(または許可する)
              className={`nes-button w-full text-xs mt-1 ${isAutoBattleActive ? 'is-error' : 'is-success'}`}
            >
              {isAutoBattleActive ? 'オートバトル停止' : 'オートバトル開始'}
            </button>
          )}
        </>
      )}

      {showMoves && (
        <div>
          <div className="grid grid-cols-2 gap-1 mb-1">
            {playerPokemon.learnedMoves.map((learnedMove) => {
              const moveData = getMoveData(learnedMove.moveId);
              if (!moveData) return null;
              return (
                <MoveButton
                  key={moveData.id}
                  move={moveData}
                  currentPP={learnedMove.currentPP}
                  onClick={() => handleSelectMove(moveData.id)}
                  disabled={mainControlsDisabled || learnedMove.currentPP <= 0}
                />
              );
            })}
          </div>
          <button
            onClick={handleBackToMainCommands}
            disabled={mainControlsDisabled}
            className="nes-button is-normal w-full text-xs"
          >
            もどる
          </button>
        </div>
      )}

      {showPokemonSwitch && (
        <div>
            <p className="nes-text-xs text-center mb-1 text-gray-700">どのポケモンに交代する？</p>
            <div className="grid grid-cols-2 gap-1 mb-1 max-h-28 overflow-y-auto custom-scrollbar">
                {ownedPokemonDetailsList.map((pkmnDetails, index) => {
                    if (index === currentPokemonIndex) return null; 
                    const pokemonData = POKEMONS.find(p => p.id === pkmnDetails.id);
                    const isFainted = pkmnDetails.currentHp <= 0;
                    return (
                        <button
                            key={pkmnDetails.id}
                            onClick={() => handleSelectSwitchPokemon(index)}
                            disabled={mainControlsDisabled || isFainted}
                            className={`nes-button text-2xs p-1 ${isFainted ? 'is-disabled' : 'is-primary'}`}
                        >
                            {pokemonData?.name} (Lv.{pkmnDetails.level})
                            <br/>HP:{pkmnDetails.currentHp}/{pkmnDetails.currentMaxHp}
                            {isFainted && " (ひんし)"}
                        </button>
                    );
                })}
            </div>
             <button
                onClick={handleBackToMainCommands}
                disabled={mainControlsDisabled}
                className="nes-button is-normal w-full text-xs"
            >
                もどる
            </button>
        </div>
      )}
    </div>
  );
};
