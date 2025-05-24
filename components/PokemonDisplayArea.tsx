/**
 * PokemonDisplayArea.tsx
 *
 * このコンポーネントは、ゲームの中心となるポケモン表示エリアを担当します。
 * 現在選択されているポケモンの画像、名前、HP、現在の所持ポケドル、秒間獲得ポケドル（PDS）、
 * そして応援バフの状態などを表示します。
 * ユーザーがポケモンをクリック（応援）したり、表示するポケモンを切り替える操作もここで行います。
 */
import React, { useState, useEffect } from 'react';
import { PokemonData, CheerBuffState, PokemonType, DamagePopupData, BaseStats, StatName, StatusCondition, Ability } from '../types';
import { CURRENCY_SYMBOL, MAX_LEVEL, EXPERIENCE_FOR_LEVEL_UP, POKEMON_TYPE_COLORS, EVOLUTION_ANIMATION_DURATION_MS, POKEMONS, STAT_RANK_DISPLAY_THRESHOLD, STATUS_CONDITION_COLORS, STATUS_CONDITION_TEXT, ABILITIES_DATA } from '../constants';

interface PokemonDisplayAreaProps {
  pokemon: PokemonData | undefined;
  currentHp: number;
  maxHp: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  experienceForCurrentLevel: number;
  isFainted: boolean;
  pokeDollars: number;
  pokeDollarsPerSecond: number;
  onPokemonCheer: () => void;
  ownedPokemonCount: number;
  currentPokemonDisplayIndex: number; // 表示中のポケモンが何番目か (0-indexed)
  cheerBuff: CheerBuffState;
  allPlayerPokemonFainted: boolean;
  pokemonTypes: PokemonType[];
  pokemonTypeColors: Record<PokemonType, string>;
  damagePopups: DamagePopupData[];
  onPreviousPokemon: () => void;
  onNextPokemon: () => void;
  canSwitchDisplayedPokemon: boolean; // 切り替えボタンを有効/無効化
  evolvingPokemonVisualId: string | null; // 進化演出中のポケモンID (進化前か進化後)
  battleTempStatModifiers: Partial<Record<StatName, number>>;
  statusCondition: StatusCondition;
  confusionTurns: number;
  currentAbility: Ability | null;
}

const formatNumber = (num: number, digits: number = 0): string => {
  return num.toLocaleString('ja-JP', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};

const formatTime = (ms: number): string => {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

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


export const PokemonDisplayArea: React.FC<PokemonDisplayAreaProps> = ({
  pokemon,
  currentHp,
  maxHp,
  level,
  experience,
  experienceToNextLevel,
  experienceForCurrentLevel,
  isFainted,
  pokeDollars,
  pokeDollarsPerSecond,
  onPokemonCheer,
  ownedPokemonCount,
  currentPokemonDisplayIndex,
  cheerBuff,
  allPlayerPokemonFainted,
  pokemonTypes,
  pokemonTypeColors,
  damagePopups,
  onPreviousPokemon,
  onNextPokemon,
  canSwitchDisplayedPokemon,
  evolvingPokemonVisualId,
  battleTempStatModifiers,
  statusCondition,
  confusionTurns,
  currentAbility,
}) => {
  const [isShaking, setIsShaking] = useState(false);
  const [isSparkling, setIsSparkling] = useState(false);
  const [flashPdsText, setFlashPdsText] = useState(false);
  const [prevPokeDollars, setPrevPokeDollars] = useState(pokeDollars);
  const [isEvolvingAnimation, setIsEvolvingAnimation] = useState(false);
  const [evolutionDisplayPokemon, setEvolutionDisplayPokemon] = useState<PokemonData | undefined>(pokemon);


  const handleCheer = () => {
    if (!isFainted && !allPlayerPokemonFainted && !evolvingPokemonVisualId) {
      onPokemonCheer();
      setIsShaking(true);
      setIsSparkling(true);
      setTimeout(() => setIsShaking(false), 250); // Animation duration
      setTimeout(() => setIsSparkling(false), 600); // Particle animation duration
    }
  };

  useEffect(() => {
    if (pokeDollars > prevPokeDollars && (pokeDollars - prevPokeDollars) === (pokeDollarsPerSecond / (1000 / 100)) ) {
      setFlashPdsText(true);
      const timer = setTimeout(() => setFlashPdsText(false), 350);
      return () => clearTimeout(timer);
    }
    setPrevPokeDollars(pokeDollars);
  }, [pokeDollars, pokeDollarsPerSecond, prevPokeDollars]);

  useEffect(() => {
    if (evolvingPokemonVisualId && pokemon && evolvingPokemonVisualId === pokemon.id) { // 進化完了の合図
        setIsEvolvingAnimation(false);
        setEvolutionDisplayPokemon(pokemon);
    } else if (evolvingPokemonVisualId) { // 進化開始の合図
        setIsEvolvingAnimation(true);
        const currentDisplayForEvo = POKEMONS.find(p => p.id === evolvingPokemonVisualId);
        setEvolutionDisplayPokemon(currentDisplayForEvo || pokemon);
    } else {
        setIsEvolvingAnimation(false);
        setEvolutionDisplayPokemon(pokemon);
    }
  }, [evolvingPokemonVisualId, pokemon]);


  const displayData = isEvolvingAnimation && evolutionDisplayPokemon ? evolutionDisplayPokemon : pokemon;

  if (!displayData) {
    return (
      <div className="nes-panel flex flex-col items-center justify-center space-y-2 min-h-[300px] text-center">
        <p className="nes-text-sm">ポケモンを捕まえよう！</p>
        <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
            alt="モンスターボール"
            className="w-16 h-16 opacity-50 pixelated-img"
        />
      </div>
    );
  }

  const cheerTimeLeftMs = cheerBuff.isActive && cheerBuff.endTime ? Math.max(0, cheerBuff.endTime - Date.now()) : 0;
  let playerHpPercentage = maxHp > 0 ? (currentHp / maxHp) * 100 : 0;
  playerHpPercentage = Math.max(0, Math.min(100, playerHpPercentage));

  const actualExperienceForThisLevel = experience;
  const expNeededToLevelUp = experienceToNextLevel - experienceForCurrentLevel;

  const experiencePercentage = level < MAX_LEVEL && expNeededToLevelUp > 0
    ? (actualExperienceForThisLevel / expNeededToLevelUp) * 100
    : (level >= MAX_LEVEL ? 100 : 0);

  let hpBarClass = 'nes-progress-bar-hp';
  if (isFainted) hpBarClass = 'nes-progress-bar-hp-fainted';
  else if (playerHpPercentage < 25) hpBarClass = 'nes-progress-bar-hp-low';
  else if (playerHpPercentage < 50) hpBarClass = 'nes-progress-bar-hp-medium';

  const displayStatusCondition = confusionTurns > 0 ? StatusCondition.CONFUSION : statusCondition;
  const abilityName = currentAbility && currentAbility !== Ability.NONE && ABILITIES_DATA[currentAbility] ? ABILITIES_DATA[currentAbility].name : null;


  return (
    <div className={`nes-panel flex flex-col items-center justify-start space-y-1 relative ${isFainted ? 'bg-gray-300' : ''} ${isEvolvingAnimation ? 'animate-pulse' : ''}`}>
      <div className="flex items-center justify-between w-full px-1">
        <button
          onClick={onPreviousPokemon}
          disabled={!canSwitchDisplayedPokemon || ownedPokemonCount <= 1 || isEvolvingAnimation}
          className={`nes-button is-small text-xs py-0 px-1 ${(!canSwitchDisplayedPokemon || ownedPokemonCount <= 1 || isEvolvingAnimation) ? 'is-disabled' : 'is-normal'}`}
          aria-label="前のポケモンを表示"
        >
          &lt;
        </button>
        <div className="flex flex-col items-center">
            <h2 className={`text-base font-bold select-none ${isFainted ? 'text-gray-500' : 'text-yellow-700'}`}>{displayData.name}</h2>
             <p className={`nes-text-2xs text-gray-500 select-none -mt-0.5`}>({currentPokemonDisplayIndex + 1}/{ownedPokemonCount})</p>
        </div>
        <button
          onClick={onNextPokemon}
          disabled={!canSwitchDisplayedPokemon || ownedPokemonCount <= 1 || isEvolvingAnimation}
          className={`nes-button is-small text-xs py-0 px-1 ${(!canSwitchDisplayedPokemon || ownedPokemonCount <= 1 || isEvolvingAnimation) ? 'is-disabled' : 'is-normal'}`}
          aria-label="次のポケモンを表示"
        >
          &gt;
        </button>
      </div>
      
      <div className="flex items-baseline justify-center space-x-2 w-full">
        <p className={`text-xs font-semibold select-none ${isFainted ? 'text-gray-500' : 'text-indigo-700'}`} aria-live="polite">
          Lv. {level}
        </p>
        {abilityName && <p className="nes-text-2xs text-gray-500 select-none">特性: {abilityName}</p>}
      </div>


      <div className="flex justify-center space-x-1 my-0.5">
        {(displayData.types).map(type => (
          <span
            key={type}
            className="nes-text-xs px-1 py-0.5 text-white pixel-border-sm"
            style={{ backgroundColor: pokemonTypeColors[type] || '#777', borderColor: 'black', boxShadow: '1px 1px 0px black' }}
          >
            {type}
          </span>
        ))}
      </div>
      
      <div className="flex flex-wrap justify-center gap-x-1 gap-y-0 my-0.5 leading-none">
        {(Object.keys(battleTempStatModifiers) as StatName[]).map(statKey => {
          const rank = battleTempStatModifiers[statKey] || 0;
          if (rank === 0) return null;
          const indicator = getStatRankIndicator(rank);
          const color = rank > 0 ? 'text-green-600' : 'text-red-600';
          return (
            <span key={statKey} className={`nes-text-2xs font-semibold ${color}`}>
              {statNamesJpShort[statKey]}{indicator}
            </span>
          );
        })}
      </div>


      {level < MAX_LEVEL && (
        <div className="w-full max-w-[150px] mx-auto my-0.5">
          <div className="nes-progress-bar-container">
            <div
              className={`nes-progress-bar nes-progress-bar-xp`}
              style={{ width: `${experiencePercentage}%` }}
              role="progressbar"
              aria-valuenow={actualExperienceForThisLevel}
              aria-valuemin={0}
              aria-valuemax={expNeededToLevelUp}
              aria-label={`${displayData.name}の経験値`}
            ></div>
          </div>
          <p className="nes-text-2xs text-gray-600 select-none mt-0.5">
            あと {formatNumber(Math.max(0, expNeededToLevelUp - actualExperienceForThisLevel))} EXP
          </p>
        </div>
      )}
      {level >= MAX_LEVEL && (
         <p className="nes-text-xs text-sky-700 select-none mt-0.5 mb-0.5">最大レベル！</p>
      )}

      <div className="w-full max-w-[150px] mx-auto my-0.5">
        <div className="flex justify-between items-baseline">
            <p className={`nes-text-xs text-gray-800 select-none ${isFainted ? 'text-gray-500' : ''}`} aria-live="polite">
            HP: {Math.ceil(currentHp)} / {Math.ceil(maxHp)}
            </p>
            {displayStatusCondition !== StatusCondition.NONE && (
                <span className={`nes-text-2xs font-bold px-0.5`} style={{ color: STATUS_CONDITION_COLORS[displayStatusCondition] }}>
                    {STATUS_CONDITION_TEXT[displayStatusCondition]}
                </span>
            )}
        </div>
        <div className="nes-progress-bar-container">
          <div
            className={`nes-progress-bar ${hpBarClass}`}
            style={{ width: `${playerHpPercentage}%` }}
            role="progressbar"
            aria-valuenow={currentHp}
            aria-valuemin={0}
            aria-valuemax={maxHp}
            aria-label={`${displayData.name}のHP`}
          ></div>
        </div>
      </div>

      <div className={`relative my-0.5 h-24 w-24 md:h-28 md:w-28 pokemon-image-wrapper ${isSparkling ? 'sparkle' : ''}`}>
        <img
          src={isEvolvingAnimation && evolvingPokemonVisualId !== displayData.id ? POKEMONS.find(p=>p.id === evolvingPokemonVisualId)?.imageUrl || displayData.imageUrl : displayData.imageUrl}
          alt={displayData.name}
          className={`pixelated-img w-full h-full object-contain cursor-pointer transition-transform duration-150 ease-in-out hover