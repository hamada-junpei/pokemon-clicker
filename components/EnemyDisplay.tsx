/**
 * EnemyDisplay.tsx
 *
 * このコンポーネントは、現在戦っている野生の敵ポケモンの情報を表示します。
 * 敵ポケモンの名前、画像、現在のHPと最大HP、HPバーなどを表示します。
 * また、モンスターボールを使って捕獲を試みるボタンも提供します。
 */
import React from 'react';
import { EnemyPokemon, PokemonType, DamagePopupData, BaseStats, StatName } from '../types'; 
import { ITEMS, POKEMON_TYPE_COLORS, CURRENCY_SYMBOL, STAT_RANK_DISPLAY_THRESHOLD } from '../constants'; 

interface EnemyDisplayProps {
  enemy: EnemyPokemon | null; 
  onTryCatch: () => void; 
  pokeBallCount: number; 
  canCatch: boolean; 
  pokemonTypeColors: Record<PokemonType, string>;
  damagePopups: DamagePopupData[];
  battleTempStatModifiers?: Partial<Record<StatName, number>>;
}

const getStatRankIndicator = (rank: number): string => {
    if (rank === 0) return '';
    const arrow = rank > 0 ? '↑' : '↓';
    const count = Math.abs(rank);
    if (count >= STAT_RANK_DISPLAY_THRESHOLD) return arrow + arrow;
    return arrow;
};

const statNamesJpShort: Record<StatName, string> = {
    hp: 'HP', attack: '攻', defense: '防', specialAttack: '特攻', specialDefense: '特防', speed: '速'
};

export const EnemyDisplay: React.FC<EnemyDisplayProps> = ({ 
  enemy, 
  onTryCatch,
  pokeBallCount,
  canCatch,
  pokemonTypeColors,
  damagePopups,
  battleTempStatModifiers,
 }) => {
  if (!enemy) {
    return (
      <div className="nes-panel flex flex-col items-center justify-center space-y-2 min-h-[300px] text-center">
        <p className="nes-text-sm">野生のポケモンはいない...</p>
        <img 
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png" 
          alt="休息中" 
          className="w-16 h-16 opacity-60 pixelated-img" 
        />
      </div>
    );
  }

  let hpPercentage = enemy.maxHp > 0 ? (enemy.currentHp / enemy.maxHp) * 100 : 0;
  hpPercentage = Math.max(0, Math.min(100, hpPercentage)); 
  const pokeBallItem = ITEMS.find(item => item.id === 'poke-ball'); 

  const catchButtonDisabled = pokeBallCount <= 0 || !canCatch || enemy.isGymLeader;
  let catchButtonTooltip = '';
  if (enemy.isGymLeader) catchButtonTooltip = 'ジムリーダーは捕獲できません！';
  else if (!canCatch && pokeBallCount > 0) catchButtonTooltip = 'これ以上ポケモンを持てないか、チームが全滅している、または戦闘処理中です。';
  else if (pokeBallCount <= 0) catchButtonTooltip = 'モンスターボールがありません！';

  let hpBarClass = 'nes-progress-bar-enemy-hp'; 

  return (
    <div className="nes-panel flex flex-col items-center justify-between space-y-1 relative min-h-[350px]"> 
      <div className="w-full">
        {enemy.isGymLeader && (
          <p className="text-xs font-bold text-purple-600 select-none text-center -mb-1">ジムリーダー</p>
        )}
        <h2 className={`text-base font-bold select-none text-center ${enemy.isGymLeader ? 'text-purple-700' : 'text-red-700'}`}>
          {enemy.name} <span className="text-sm text-gray-600">Lv.{enemy.level}</span>
        </h2>
        
        <div className="flex justify-center space-x-1 my-1">
            {enemy.types.map(type => (
            <span
                key={type}
                className="nes-text-xs px-1 py-0.5 text-white pixel-border-sm"
                style={{ backgroundColor: pokemonTypeColors[type] || '#777', borderColor: 'black', boxShadow: '1px 1px 0px black' }}
            >
                {type}
            </span>
            ))}
        </div>

        {/* Stat Ranks Display for Enemy */}
        {battleTempStatModifiers && Object.keys(battleTempStatModifiers).length > 0 && (
          <div className="flex flex-wrap justify-center gap-x-1 gap-y-0 my-0.5 leading-none">
            {(Object.keys(battleTempStatModifiers) as StatName[]).map(statKey => {
              const rank = battleTempStatModifiers[statKey] || 0;
              if (rank === 0) return null;
              const indicator = getStatRankIndicator(rank);
              const color = rank > 0 ? 'text-green-600' : 'text-red-600';
              return (
                <span key={`enemy-${statKey}`} className={`nes-text-2xs font-semibold ${color}`}>
                  {statNamesJpShort[statKey]}{indicator}
                </span>
              );
            })}
          </div>
        )}
        
        <div className="relative my-1 h-24 w-24 md:h-28 md:w-28 mx-auto"> 
          <img
            src={enemy.imageUrl}
            alt={enemy.name}
            className="pixelated-img w-full h-full object-contain select-none"
            draggable="false"
            style={{ imageRendering: 'pixelated' }}
          />
          {damagePopups.map(popup => (
              <div
                  key={popup.id}
                  className={`damage-popup ${popup.type === 'player' ? 'damage-popup-player' : popup.type === 'heal' ? 'damage-popup-heal' : 'damage-popup-enemy'} ${popup.critical ? 'damage-popup-critical' : ''}`}
                  style={{
                      left: `calc(50% + ${popup.x}px)`, 
                      top: `calc(50% + ${popup.y}px)`,
                      transform: 'translate(-50%, -50%)' 
                  }}
              >
                  {popup.critical && 'CRITICAL! '}{popup.value}
              </div>
          ))}
        </div>

        <div className="w-full max-w-xs mx-auto">
          <p className="nes-text-xs text-gray-800 mb-0.5 select-none text-center" aria-live="polite">
            HP: {Math.ceil(enemy.currentHp)} / {enemy.maxHp}
          </p>
          <div className="nes-progress-bar-container">
            <div
              className={`nes-progress-bar ${hpBarClass}`}
              style={{ width: `${hpPercentage}%` }}
              role="progressbar"
              aria-valuenow={enemy.currentHp}
              aria-valuemin={0}
              aria-valuemax={enemy.maxHp}
              aria-label={`${enemy.name}のHP`}
            >
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mt-1">
        <p className="nes-text-2xs text-gray-600 text-center">
          討伐報酬: {enemy.rewardPokeDollars} {CURRENCY_SYMBOL} / EXP: {enemy.givesExperience}
        </p>
        
        <div className="mt-1">
          <button
            onClick={onTryCatch}
            disabled={catchButtonDisabled}
            className={`nes-button w-full text-xs ${catchButtonDisabled ? 'is-disabled' : 'is-warning'}`}
            aria-label={catchButtonDisabled ? catchButtonTooltip : `モンスターボールを使って${enemy.name}を捕獲する`}
            title={catchButtonDisabled ? catchButtonTooltip : ''}
          >
            {pokeBallItem && <span className="mr-1 text-base">{pokeBallItem.icon}</span>}
            捕獲 ({pokeBallCount})
          </button>
          {catchButtonDisabled && catchButtonTooltip && (
            <p className="nes-text-2xs text-red-600 mt-0.5 text-center">{catchButtonTooltip}</p>
          )}
           {!catchButtonDisabled && (
            <p className="nes-text-2xs text-gray-600 mt-0.5 text-center">
              HPが少ないほど捕まえやすい！
            </p>
          )}
        </div>
      </div>
    </div>
  );
};