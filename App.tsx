/**
 * App.tsx
 *
 * このファイルは、ポケクリッカークエストアプリケーションの心臓部です。
 * ゲーム全体のロジック、状態管理（state）、UIコンポーネントの組み立てを行います。
 * ポケドルの増減、アップグレードの購入、ポケモンの捕獲（冒険）、応援バフ、
 * そして野生ポケモンとの戦闘、プレイヤーポケモンのHP管理など、ゲームの主要な機能はすべてここで処理・管理されます。
 */
import React, { useState, useEffect, useCallback } from 'react';
import { PokemonDisplayArea } from './components/PokemonDisplayArea';
import { AdventureControls } from './components/AdventureControls';
import { PokedexModal } from './components/PokedexModal';
import { EnemyDisplay } from './components/EnemyDisplay';
import { PokemonCenterControls } from './components/PokemonCenterControls';
import { InventoryPanel } from './components/InventoryPanel';
import { FightControls } from './components/battle/FightControls';
import { BattleLog } from './components/battle/BattleLog';
import { PokemonSelectionModal } from './components/ui/PokemonSelectionModal';
import { MapDisplayArea } from './components/MapDisplayArea';
import { DeveloperPanel } from './components/DeveloperPanel';
import { ShopModalWrapper } from './components/ShopModalWrapper';
import { UpgradesPanel } from './components/UpgradesPanel';
import { FarmModal } from './components/FarmModal';
import * as SoundManager from './SoundManager';
import {
  POKEMONS, UPGRADES, ITEMS, MOVES, TYPE_CHART, POKEMON_TYPE_COLORS,
  INITIAL_POKE_DOLLARS, INITIAL_OWNED_ITEMS, GAME_TICK_MS, MAX_POKEMON_TO_OWN,
  INITIAL_CHEER_MULTIPLIER, INITIAL_CHEER_DURATION_MS, CURRENCY_SYMBOL,
  MAP_AREAS, INITIAL_AREA_ID, MIN_CATCH_CHANCE, MAX_CATCH_CHANCE, CATCH_CHANCE_HP_FACTOR,
  EXPERIENCE_FOR_LEVEL_UP, MAX_LEVEL, PDS_INCREASE_PER_LEVEL_FACTOR, MAX_LEARNED_MOVES,
  BATTLE_LOG_MAX_ENTRIES, DAMAGE_VARIATION, BASE_CRITICAL_HIT_CHANCE, CRITICAL_HIT_MULTIPLIER,
  AUTO_BATTLE_INTERVAL_MS, ADVENTURE_OPTIONS, INITIAL_BASE_CLICK_INCOME,
  BASE_CLICK_BUFF_EXTEND_MS, MAX_TOTAL_BUFF_DURATION_MS_ADDITION,
  EVOLUTION_ANIMATION_DURATION_MS, INITIAL_FARM_PLOTS, MAX_FARM_PLOTS,
  BERRIES, FARM_GROWTH_TICK_MS, FARM_GROWTH_STAGES, ABILITIES_DATA,
  SAVE_DATA_KEY, AUTO_SAVE_INTERVAL_MS, MAX_STAT_RANK, STAT_RANK_MULTIPLIERS,
  STATUS_DAMAGE_FRACTION, PARALYSIS_CHANCE_TO_SKIP_TURN, BURN_ATTACK_MODIFIER,
  CONFUSION_SELF_ATTACK_CHANCE, CONFUSION_SELF_ATTACK_POWER,
  MIN_SLEEP_TURNS, MAX_SLEEP_TURNS, MIN_CONFUSION_TURNS, MAX_CONFUSION_TURNS,
  PARALYSIS_SPEED_MODIFIER, STATUS_CONDITION_TEXT,
} from './constants';
import {
    PokemonData, UpgradeDefinition, UpgradeType, OwnedUpgrade, AdventureState,
    CheerBuffState, EnemyPokemon, OwnedPokemonDetails, OwnedItems, Item,
    ItemCategory, Move, MoveCategory, PokemonType, LearnedMove, BattleLogEntry,
    MapArea, AreaProgress, WildPokemonDefinitionInArea, AdventureOption,
    EvolutionInfo, DamagePopupData, FarmPlotState, BerryData,
    SoundType, BgmType, BaseStats, StatName, StatusCondition, Ability,
} from './types';
import { nanoid } from 'nanoid';


const formatNumber = (num: number, digits: number = 0): string => {
  return num.toLocaleString('ja-JP', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};

// Helper function to calculate Pokemon stats based on base stats, level
const calculateStatsForPokemon = (basePokemonData: PokemonData, level: number): { currentMaxHp: number, stats: BaseStats } => {
  const { baseStats } = basePokemonData;
  const calculatedStats: BaseStats = {
    hp: Math.floor(((baseStats.hp * 2 * level) / 100) + level + 10),
    attack: Math.floor(((baseStats.attack * 2 * level) / 100) + 5),
    defense: Math.floor(((baseStats.defense * 2 * level) / 100) + 5),
    specialAttack: Math.floor(((baseStats.specialAttack * 2 * level) / 100) + 5),
    specialDefense: Math.floor(((baseStats.specialDefense * 2 * level) / 100) + 5),
    speed: Math.floor(((baseStats.speed * 2 * level) / 100) + 5),
  };
  return { currentMaxHp: calculatedStats.hp, stats: calculatedStats };
};


const getMoveDataPlain = (moveId: string): Move | undefined => MOVES.find(m => m.id === moveId);

const getInitialLearnedMovesPlain = (pokemonId: string): LearnedMove[] => {
    const pokemonData = POKEMONS.find(p => p.id === pokemonId);
    if (!pokemonData) return [];
    return pokemonData.levelUpMoves
        .filter(lm => lm.level === 1)
        .slice(0, MAX_LEARNED_MOVES)
        .map(lm => {
            const moveData = getMoveDataPlain(lm.moveId);
            return { moveId: lm.moveId, currentPP: moveData?.pp ?? 0 };
        });
};

const initializePokemonDetails = (pokemonData: PokemonData, level: number = 1): OwnedPokemonDetails => {
    const { currentMaxHp, stats } = calculateStatsForPokemon(pokemonData, level);
    return {
        id: pokemonData.id,
        currentHp: currentMaxHp,
        level: level,
        experience: EXPERIENCE_FOR_LEVEL_UP[level - 1] || 0,
        currentMaxHp: currentMaxHp,
        learnedMoves: getInitialLearnedMovesPlain(pokemonData.id),
        stats: stats,
        statusCondition: StatusCondition.NONE,
        statusTurns: 0,
        confusionTurns: 0,
        battleSpeedModifier: 1.0,
        battleTempStatModifiers: {},
        currentAbility: pokemonData.abilities?.[0] || Ability.NONE,
        isFlashFireActive: false,
    };
};


// Appコンポーネント本体
const App: React.FC = () => {
  const [pokeDollars, setPokeDollars] = useState<number>(INITIAL_POKE_DOLLARS);
  const [ownedUpgrades, setOwnedUpgrades] = useState<Record<string, OwnedUpgrade>>({});

  const initialPlayerPokemonId = POKEMONS.find(p => p.id === 'pikachu')?.id || POKEMONS[0].id;

  const [ownedPokemonDetails, setOwnedPokemonDetails] = useState<Record<string, OwnedPokemonDetails>>(() => {
    const initialDetails: Record<string, OwnedPokemonDetails> = {};
    const initialPokemonData = POKEMONS.find(p => p.id === initialPlayerPokemonId);
    if (initialPokemonData) {
      initialDetails[initialPokemonData.id] = initializePokemonDetails(initialPokemonData, 1);
    }
    return initialDetails;
  });

  const getMoveData = useCallback((moveId: string): Move | undefined => getMoveDataPlain(moveId), []);
  const getInitialLearnedMoves = useCallback((pokemonId: string): LearnedMove[] => getInitialLearnedMovesPlain(pokemonId), []);


  const [ownedPokemonIds, setOwnedPokemonIds] = useState<string[]>([initialPlayerPokemonId]);
  const [firstCaughtAt, setFirstCaughtAt] = useState<Record<string, number>>(() => {
    const initialRecord: Record<string, number> = {};
    initialRecord[initialPlayerPokemonId] = Date.now();
    return initialRecord;
  });

  const [currentPokemonIndex, setCurrentPokemonIndex] = useState<number>(0);
  const [adventure, setAdventure] = useState<AdventureState>({
    isOnAdventure: false, startTime: null, message: null, selectedAdventureOptionId: null, currentAdventureDurationMs: null,
  });
  const [cheerBuff, setCheerBuff] = useState<CheerBuffState>({
    isActive: false, currentMultiplier: INITIAL_CHEER_MULTIPLIER, currentDurationMs: INITIAL_CHEER_DURATION_MS, endTime: null, baseActivatedTime: null,
  });
  const [isPokedexOpen, setIsPokedexOpen] = useState<boolean>(false);
  const [pokeDollarsPerSecond, setPokeDollarsPerSecond] = useState<number>(0);
  const [baseClickIncome, setBaseClickIncome] = useState<number>(INITIAL_BASE_CLICK_INCOME);
  const [clickBuffExtendMs, setClickBuffExtendMs] = useState<number>(BASE_CLICK_BUFF_EXTEND_MS);
  const [currentEnemy, setCurrentEnemy] = useState<EnemyPokemon | null>(null);
  const [allPlayerPokemonFainted, setAllPlayerPokemonFainted] = useState<boolean>(false);
  const [ownedItems, setOwnedItems] = useState<OwnedItems>(INITIAL_OWNED_ITEMS);
  const [battleLogs, setBattleLogs] = useState<BattleLogEntry[]>([]);
  const [isBattleProcessing, setIsBattleProcessing] = useState<boolean>(false);
  const [isItemSelectionModalOpen, setIsItemSelectionModalOpen] = useState<boolean>(false);
  const [itemToUse, setItemToUse] = useState<Item | null>(null);
  const [damagePopups, setDamagePopups] = useState<DamagePopupData[]>([]);
  const [currentAreaId, setCurrentAreaId] = useState<string>(INITIAL_AREA_ID);
  const [areaProgress, setAreaProgress] = useState<AreaProgress>({ defeatCount: 0 });
  const [defeatedGyms, setDefeatedGyms] = useState<Record<string, boolean>>({});
  const [isAutoBattleUnlocked, setIsAutoBattleUnlocked] = useState<boolean>(false);
  const [isAutoBattleActive, setIsAutoBattleActive] = useState<boolean>(false);
  const [isDeveloperMode, setIsDeveloperMode] = useState<boolean>(false);
  const [devKeySequence, setDevKeySequence] = useState<string[]>([]);
  const [isUpgradesShopOpen, setIsUpgradesShopOpen] = useState<boolean>(false);
  const [isFarmModalOpen, setIsFarmModalOpen] = useState<boolean>(false);
  const [evolvingPokemonVisualId, setEvolvingPokemonVisualId] = useState<string | null>(null);
  const [farmPlots, setFarmPlots] = useState<FarmPlotState[]>(() =>
    Array(INITIAL_FARM_PLOTS).fill(null).map(() => ({
      plantedBerryId: null, plantTime: null, growthStage: 0, isHarvestable: false,
    }))
  );
  const [isMuted, setIsMuted] = useState<boolean>(SoundManager.getIsMuted());


  const currentPokemonDataGlobal = POKEMONS.find(p => p.id === ownedPokemonIds[currentPokemonIndex]);
  const currentPlayerPokemonDetails = currentPokemonDataGlobal ? ownedPokemonDetails[currentPokemonDataGlobal.id] : null;
  const currentMapArea = MAP_AREAS.find(area => area.id === currentAreaId);
  const canSwitchDisplayedPokemon = !isBattleProcessing && !isAutoBattleActive && !evolvingPokemonVisualId;

  const addBattleLog = useCallback((message: string, type: BattleLogEntry['type'] = 'info') => {
    setBattleLogs(prevLogs => {
      const newLog: BattleLogEntry = { id: nanoid(), message, type, timestamp: Date.now() };
      const updatedLogs = [newLog, ...prevLogs];
      return updatedLogs.slice(0, BATTLE_LOG_MAX_ENTRIES);
    });
  }, []);
  
  const saveGameState = useCallback(() => {
    try {
      const gameStateToSave = {
        pokeDollars, ownedUpgrades, ownedPokemonIds, ownedPokemonDetails, firstCaughtAt,
        currentPokemonIndex, adventure, cheerBuff, 
        allPlayerPokemonFainted, ownedItems, 
        currentAreaId, areaProgress, defeatedGyms, isAutoBattleUnlocked, isAutoBattleActive,
        farmPlots, isMuted,
      };
      localStorage.setItem(SAVE_DATA_KEY, JSON.stringify(gameStateToSave));
      addBattleLog('ゲームデータを保存しました。', 'system');
    } catch (error) {
      console.error("ゲームデータの保存に失敗しました:", error);
      addBattleLog('ゲームデータの保存に失敗しました。コンソールを確認してください。', 'system');
    }
  }, [pokeDollars, ownedUpgrades, ownedPokemonIds, ownedPokemonDetails, firstCaughtAt,
      currentPokemonIndex, adventure, cheerBuff, allPlayerPokemonFainted, ownedItems,
      currentAreaId, areaProgress, defeatedGyms, isAutoBattleUnlocked, isAutoBattleActive,
      farmPlots, isMuted, addBattleLog]);

  const createDamagePopup = useCallback((value: number | string, targetId: string, type: DamagePopupData['type'], critical: boolean = false) => {
    const id = nanoid();
    const x = Math.random() * 40 - 20;
    const y = Math.random() * 20 - 50;
    setDamagePopups(prev => [...prev, { id, value, x, y, type, critical, targetId }]);
    setTimeout(() => setDamagePopups(prev => prev.filter(p => p.id !== id)), 1100);
    if (type === 'enemy') SoundManager.playSoundEffect(SoundType.DAMAGE_ENEMY, 0.8);
    else if (type === 'player') SoundManager.playSoundEffect(SoundType.DAMAGE_PLAYER, 0.8);
    else if (type === 'heal') SoundManager.playSoundEffect(SoundType.HEAL, 0.7);
    else if (type === 'currency' && typeof value === 'string' && parseInt(value) > 100) SoundManager.playSoundEffect(SoundType.CURRENCY_GAIN_LARGE, 0.6);
    else if (type === 'currency') SoundManager.playSoundEffect(SoundType.CURRENCY_GAIN_SMALL, 0.5);
  }, []);

  const addItemToInventory = useCallback((itemId: string, quantity: number) => {
    setOwnedItems(prevItems => {
      const currentQuantity = prevItems[itemId] || 0;
      const itemDefinition = ITEMS.find(item => item.id === itemId);
      const maxStack = itemDefinition?.maxStack ?? 99;
      const newQuantity = Math.min(currentQuantity + quantity, maxStack);
      return { ...prevItems, [itemId]: newQuantity };
    });
    SoundManager.playSoundEffect(SoundType.ITEM_GET);
  }, []);

  const removeItemFromInventory = useCallback((itemId: string, quantity: number) => {
    setOwnedItems(prevItems => {
      const currentQuantity = prevItems[itemId] || 0;
      const newQuantity = Math.max(0, currentQuantity - quantity);
      if (newQuantity === 0) {
        const { [itemId]: _, ...restItems } = prevItems;
        return restItems;
      }
      return { ...prevItems, [itemId]: newQuantity };
    });
  }, []);

 const handleEvolution = useCallback((pokemonToEvolveOriginalId: string, evolutionInfo: EvolutionInfo) => {
    const newPokemonData = POKEMONS.find(p => p.id === evolutionInfo.toPokemonId);
    const originalPokemonDetails = ownedPokemonDetails[pokemonToEvolveOriginalId];
    const originalPokemonName = POKEMONS.find(p => p.id === pokemonToEvolveOriginalId)?.name || 'ポケモン';
    
    if (!newPokemonData || !originalPokemonDetails) return;
    const evolvedPokemonName = newPokemonData.name;

    addBattleLog(`おや……！？ ${originalPokemonName} のようすが……！`, 'evolution');
    SoundManager.playSoundEffect(SoundType.EVOLUTION_START);
    SoundManager.playBGM(BgmType.EVOLUTION_THEME, false);
    setEvolvingPokemonVisualId(pokemonToEvolveOriginalId);
    setCurrentEnemy(null); 
    setIsBattleProcessing(true); 

    setTimeout(() => {
        setOwnedPokemonDetails(prevDetails => {
            const { [pokemonToEvolveOriginalId]: _, ...restDetails } = prevDetails;
            const evolvedDetails = initializePokemonDetails(newPokemonData, originalPokemonDetails.level);
            evolvedDetails.currentHp = evolvedDetails.currentMaxHp; // Full heal on evolution
            
            let finalLearnedMoves = [...evolvedDetails.learnedMoves];
            originalPokemonDetails.learnedMoves.forEach(oldMove => {
                if (!finalLearnedMoves.find(nm => nm.moveId === oldMove.moveId) && finalLearnedMoves.length < MAX_LEARNED_MOVES) {
                    finalLearnedMoves.push(oldMove);
                }
            });
            evolvedDetails.learnedMoves = finalLearnedMoves.slice(0, MAX_LEARNED_MOVES);

            return { ...restDetails, [newPokemonData.id]: evolvedDetails };
        });

        setOwnedPokemonIds(prevIds => prevIds.map(id => id === pokemonToEvolveOriginalId ? newPokemonData.id : id));
        
        const currentDisplayedPokemonId = ownedPokemonIds[currentPokemonIndex];
        if (currentDisplayedPokemonId === pokemonToEvolveOriginalId) {
            setCurrentPokemonIndex(prevIdx => ownedPokemonIds.findIndex(id => id === newPokemonData.id) !== -1 ? ownedPokemonIds.findIndex(id => id === newPokemonData.id) : prevIdx);
        }

        if (!firstCaughtAt[newPokemonData.id]) {
            setFirstCaughtAt(prev => ({ ...prev, [newPokemonData.id]: Date.now() }));
        }

        addBattleLog(`おめでとう！ ${originalPokemonName} は ${evolvedPokemonName} に進化した！`, 'evolution');
        SoundManager.playSoundEffect(SoundType.LEVEL_UP);
        setEvolvingPokemonVisualId(newPokemonData.id); 
        setTimeout(() => {
            setEvolvingPokemonVisualId(null);
            setIsBattleProcessing(false);
            if (SoundManager.getCurrentBgmType() === BgmType.EVOLUTION_THEME) {
                SoundManager.playBGM(BgmType.MAIN_THEME);
            }
        }, EVOLUTION_ANIMATION_DURATION_MS / 2);
    }, EVOLUTION_ANIMATION_DURATION_MS / 2);

 }, [addBattleLog, firstCaughtAt, ownedPokemonDetails, ownedPokemonIds, currentPokemonIndex]);


  const addExperienceAndLevelUp = useCallback((pokemonId: string, experienceGained: number) => {
    setOwnedPokemonDetails(prevDetails => {
      const details = prevDetails[pokemonId];
      if (!details || details.level >= MAX_LEVEL) return prevDetails;

      const basePokemon = POKEMONS.find(p => p.id === details.id); 
      if (!basePokemon) return prevDetails;

      addBattleLog(`${basePokemon.name}は ${experienceGained} の経験値を獲得した！`, 'info');

      let newExperience = details.experience + experienceGained;
      let newLevel = details.level;
      let newLearnedMoves = [...details.learnedMoves];
      let newStats = details.stats;
      let newMaxHp = details.currentMaxHp;
      let newCurrentHp = details.currentHp;
      let evolvedThisIteration = false;
      let didLevelUp = false;

      while (newLevel < MAX_LEVEL && newExperience >= EXPERIENCE_FOR_LEVEL_UP[newLevel]) {
        newExperience -= EXPERIENCE_FOR_LEVEL_UP[newLevel];
        newLevel++;
        didLevelUp = true;

        const calculatedNewStats = calculateStatsForPokemon(basePokemon, newLevel);
        newMaxHp = calculatedNewStats.currentMaxHp;
        newStats = calculatedNewStats.stats;
        const hpIncrease = newMaxHp - details.currentMaxHp; // Use previous maxHP for calc
        newCurrentHp = Math.min(newMaxHp, newCurrentHp + Math.max(0, hpIncrease)); // Add HP gained from level up
        
        addBattleLog(`${basePokemon.name}は レベル ${newLevel} にあがった！`, 'info');

        const movesToLearnThisLevel = basePokemon.levelUpMoves.filter(lm => lm.level === newLevel);
        for (const moveInfo of movesToLearnThisLevel) {
            const newMoveData = getMoveData(moveInfo.moveId);
            if (newMoveData && !newLearnedMoves.find(m => m.moveId === newMoveData.id)) {
                addBattleLog(`${basePokemon.name}は ${newMoveData.name} を覚えようとしている！`, 'info');
                if (newLearnedMoves.length < MAX_LEARNED_MOVES) {
                    newLearnedMoves.push({ moveId: newMoveData.id, currentPP: newMoveData.pp });
                    addBattleLog(`${basePokemon.name}は ${newMoveData.name} を覚えた！`, 'info');
                } else {
                    addBattleLog(`しかし、覚えられる技は${MAX_LEARNED_MOVES}つまでだ！ ${newMoveData.name}を覚えられなかった...`, 'system');
                }
            }
        }
        if (basePokemon.evolution && basePokemon.evolution.condition.level && newLevel >= basePokemon.evolution.condition.level && !basePokemon.evolution.condition.itemId) {
            handleEvolution(pokemonId, basePokemon.evolution);
            evolvedThisIteration = true;
            break; 
        }
      }

      if (didLevelUp && !evolvedThisIteration) {
        SoundManager.playSoundEffect(SoundType.LEVEL_UP);
      }

      if (evolvedThisIteration) return prevDetails; // handleEvolution will trigger its own state update

      newExperience = Math.max(0, newExperience);
      return {
        ...prevDetails,
        [pokemonId]: {
          ...details,
          level: newLevel,
          experience: newExperience,
          currentMaxHp: newMaxHp,
          currentHp: newCurrentHp,
          learnedMoves: newLearnedMoves,
          stats: newStats,
        }
      };
    });
  }, [addBattleLog, getMoveData, handleEvolution]);

  const handleCloseItemSelectionModal = useCallback(() => {
    setIsItemSelectionModalOpen(false); setItemToUse(null); SoundManager.playSoundEffect(SoundType.UI_BUTTON_CLICK);
  }, []);

  const handleUseItemOnPokemon = useCallback((pokemonIdToUseOn: string) => {
    if (!itemToUse || !itemToUse.effect) return;
    const targetPokemonDetails = ownedPokemonDetails[pokemonIdToUseOn];
    const targetPokemonData = POKEMONS.find(p => p.id === targetPokemonDetails?.id);
    if (!targetPokemonDetails || !targetPokemonData) return;

    let success = false;
    let message = `${targetPokemonData.name} に ${itemToUse.name} を使った！`;
    SoundManager.playSoundEffect(SoundType.ITEM_GET);
    let detailsChanged = false;

    const updatedDetails: OwnedPokemonDetails = { ...targetPokemonDetails };

    switch (itemToUse.effect.type) {
      case 'heal_hp_flat':
        if (updatedDetails.currentHp > 0 && updatedDetails.currentHp < updatedDetails.currentMaxHp) {
          const healAmount = itemToUse.effect.value || 0;
          const newHp = Math.min(updatedDetails.currentMaxHp, updatedDetails.currentHp + healAmount);
          const actualHeal = newHp - updatedDetails.currentHp;
          if (actualHeal > 0) {
            updatedDetails.currentHp = newHp;
            message += ` HPが ${actualHeal} 回復した！`;
            createDamagePopup(actualHeal, updatedDetails.id, 'heal');
            success = true; detailsChanged = true;
          } else { message += ` ...しかし効果がなかった！`; }
        } else if (updatedDetails.currentHp <= 0) { message += ` ...しかしひんし状態では効果がない！`;
        } else { message += ` ...しかしHPはまんたんだ！`; }
        break;
      case 'exp_gain':
        if (updatedDetails.level < MAX_LEVEL) {
          const expAmount = itemToUse.effect.value || 0;
          addExperienceAndLevelUp(pokemonIdToUseOn, expAmount); 
          message = `${targetPokemonData.name} の経験値が上昇した！ (アイテム効果)`; 
          success = true; 
        } else { message += ` ...しかし ${targetPokemonData.name} は既に最大レベルだ！`; }
        break;
      case 'evolve':
        if (itemToUse.effect.requiredPokemonId === updatedDetails.id && itemToUse.effect.evolvesToPokemonId) {
            handleEvolution(pokemonIdToUseOn, { toPokemonId: itemToUse.effect.evolvesToPokemonId, condition: { itemId: itemToUse.id } });
            success = true; message = ""; 
        } else { message += ` ...しかし ${targetPokemonData.name} には効果がないようだ。`; }
        break;
      case 'teach_move':
        const moveIdToTeach = itemToUse.effect.moveId;
        const moveDataToTeach = moveIdToTeach ? getMoveData(moveIdToTeach) : undefined;
        if (moveDataToTeach) {
            if (updatedDetails.learnedMoves.some(m => m.moveId === moveIdToTeach)) {
                message = `${targetPokemonData.name}は既に${moveDataToTeach.name}を覚えている！`;
            } else if (updatedDetails.learnedMoves.length >= MAX_LEARNED_MOVES) {
                message = `${targetPokemonData.name}はこれ以上技を覚えられない！`;
            } else {
                const compatibleTypes = itemToUse.effect.compatiblePokemonTypes;
                const isCompatible = !compatibleTypes || compatibleTypes.length === 0 || targetPokemonData.types.some(type => compatibleTypes.includes(type));
                if (isCompatible) {
                    updatedDetails.learnedMoves = [...updatedDetails.learnedMoves, { moveId: moveIdToTeach, currentPP: moveDataToTeach.pp }];
                    message = `${targetPokemonData.name}は${moveDataToTeach.name}を覚えた！`;
                    SoundManager.playSoundEffect(SoundType.LEVEL_UP); 
                    success = true; detailsChanged = true;
                } else {
                    message = `${targetPokemonData.name}はタイプ的に${moveDataToTeach.name}を覚えられない！`;
                }
            }
        } else { message = `覚えさせようとした技が見つからない！`; }
        break;
      case 'cure_status':
        const conditionToCure = itemToUse.effect.conditionToCure;
        let curedThisSpecific = false;
        if (conditionToCure && updatedDetails.statusCondition === conditionToCure) {
          updatedDetails.statusCondition = StatusCondition.NONE;
          updatedDetails.statusTurns = 0;
          if (conditionToCure === StatusCondition.PARALYSIS) updatedDetails.battleSpeedModifier = 1.0;
          message += ` ${targetPokemonData.name} の ${STATUS_CONDITION_TEXT[conditionToCure]} が治った！`;
          curedThisSpecific = true;
        } else if (conditionToCure === StatusCondition.CONFUSION && updatedDetails.confusionTurns > 0) {
          // This case is for items that cure only confusion, not part of 'cure_all_major_status'
           updatedDetails.confusionTurns = 0;
           message += ` ${targetPokemonData.name} の こんらん が治った！`;
           curedThisSpecific = true;
        }
        
        if (curedThisSpecific) {
            success = true; detailsChanged = true;
            SoundManager.playSoundEffect(SoundType.HEAL);
        } else { message += ` ...しかし効果がなかった！`; }
        break;
      case 'cure_all_major_status':
        let curedSomething = false;
        if (updatedDetails.statusCondition !== StatusCondition.NONE) {
            if (updatedDetails.statusCondition === StatusCondition.PARALYSIS) updatedDetails.battleSpeedModifier = 1.0;
            message += ` ${targetPokemonData.name} の ${STATUS_CONDITION_TEXT[updatedDetails.statusCondition]} が治った！`;
            updatedDetails.statusCondition = StatusCondition.NONE;
            updatedDetails.statusTurns = 0;
            curedSomething = true;
        }
        if (updatedDetails.confusionTurns > 0) {
            updatedDetails.confusionTurns = 0;
            message += ` ${targetPokemonData.name} の こんらん が治った！`;
            curedSomething = true;
        }
        if (curedSomething) {
            success = true; detailsChanged = true;
            SoundManager.playSoundEffect(SoundType.HEAL);
        } else { message += ` ...しかし効果がなかった！`; }
        break;

      default: message += ` ...しかし効果はまだ実装されていない！`;
    }

    if (detailsChanged) {
        setOwnedPokemonDetails(prev => ({ ...prev, [pokemonIdToUseOn]: updatedDetails }));
    }
    if (success) removeItemFromInventory(itemToUse.id, 1);
    if (message) addBattleLog(message, success ? 'status_cured' : 'system');
    handleCloseItemSelectionModal();
  }, [itemToUse, ownedPokemonDetails, removeItemFromInventory, addBattleLog, createDamagePopup, addExperienceAndLevelUp, handleEvolution, handleCloseItemSelectionModal, getMoveData]);

  const calculateUpgradeCost = useCallback((upgradeDef: UpgradeDefinition): number => {
    const currentLevel = ownedUpgrades[upgradeDef.id]?.level || 0;
    return Math.floor(upgradeDef.initialCost * Math.pow(upgradeDef.costMultiplier, currentLevel));
  }, [ownedUpgrades]);

  const applyStatChange = useCallback((targetPokemon: OwnedPokemonDetails | EnemyPokemon, isPlayerTarget: boolean, stat: StatName, change: number, sourceName: string) => {
    const statNamesJp: Record<StatName, string> = { hp: 'HP', attack: 'こうげき', defense: 'ぼうぎょ', specialAttack: 'とくこう', specialDefense: 'とくぼう', speed: 'すばやさ' };
    
    const newModifiers = { ...(targetPokemon.battleTempStatModifiers || {}) };
    const currentRank = newModifiers[stat] || 0;
    const newRank = Math.max(-MAX_STAT_RANK, Math.min(MAX_STAT_RANK, currentRank + change));
    
    const targetName = POKEMONS.find(p => p.id === targetPokemon.id)?.name || targetPokemon.name;

    if (newRank === currentRank) {
        addBattleLog(`${targetName}の ${statNamesJp[stat]}は これ以上 ${change > 0 ? 'あがらない' : 'さがらない'}！`, 'info');
        return targetPokemon; 
    }
    newModifiers[stat] = newRank;
    addBattleLog(`${targetName}の ${statNamesJp[stat]}が ${newRank > currentRank ? (newRank - currentRank >= 2 ? 'グーンと あがった' : 'あがった') : (currentRank - newRank >= 2 ? 'ガクッと さがった' : 'さがった')}！ (${sourceName})`, change > 0 ? 'buff' : 'debuff', );
    SoundManager.playSoundEffect(change > 0 ? SoundType.STAT_UP : SoundType.STAT_DOWN);
    
    const updatedTarget = { ...targetPokemon, battleTempStatModifiers: newModifiers };

    if (isPlayerTarget) {
        setOwnedPokemonDetails(prev => ({...prev, [targetPokemon.id]: updatedTarget as OwnedPokemonDetails }));
    } else {
        setCurrentEnemy(updatedTarget as EnemyPokemon);
    }
    return updatedTarget;
  }, [addBattleLog]);
  
  const applyStatusCondition = useCallback((target: OwnedPokemonDetails | EnemyPokemon, isPlayerTarget: boolean, condition: StatusCondition, chance: number, turnsMin?: number, turnsMax?: number, sourceName?: string) => {
    // Major statuses don't stack (except confusion can co-exist)
    if (target.statusCondition !== StatusCondition.NONE && condition !== StatusCondition.CONFUSION) {
        addBattleLog(`${target.name}はすでに状態異常だ！ (${STATUS_CONDITION_TEXT[target.statusCondition]})`, 'info');
        return target;
    }
    if (condition === StatusCondition.CONFUSION && target.confusionTurns > 0) {
        addBattleLog(`${target.name}はすでにこんらんしている！`, 'info');
        return target;
    }
    if (condition === StatusCondition.NONE) { // Attempting to apply NONE means nothing happens
        return target;
    }


    if (Math.random() < chance) {
        SoundManager.playSoundEffect(SoundType.STATUS_APPLY);
        const targetName = POKEMONS.find(p => p.id === target.id)?.name || target.name;
        let newStatusTurns = target.statusTurns; // Preserve existing sleep turns if any
        let newConfusionTurns = target.confusionTurns;
        let newStatusCondition = target.statusCondition;
        let newBattleSpeedModifier = target.battleSpeedModifier;

        if (condition === StatusCondition.SLEEP) {
            newStatusTurns = Math.floor(Math.random() * ((turnsMax || MAX_SLEEP_TURNS) - (turnsMin || MIN_SLEEP_TURNS) + 1)) + (turnsMin || MIN_SLEEP_TURNS);
            newStatusCondition = StatusCondition.SLEEP;
            addBattleLog(`${targetName}は ねむってしまった！ (${sourceName ? `${sourceName}のこうか` : ''})`, 'status_inflicted');
        } else if (condition === StatusCondition.CONFUSION) {
            newConfusionTurns = Math.floor(Math.random() * ((turnsMax || MAX_CONFUSION_TURNS) - (turnsMin || MIN_CONFUSION_TURNS) + 1)) + (turnsMin || MIN_CONFUSION_TURNS);
            addBattleLog(`${targetName}は こんらんした！ (${sourceName ? `${sourceName}のこうか` : ''})`, 'status_inflicted');
        } else {
            // For Poison, Burn, Paralysis
            newStatusCondition = condition;
            addBattleLog(`${targetName}は ${STATUS_CONDITION_TEXT[condition]} 状態になった！ (${sourceName ? `${sourceName}のこうか` : ''})`, 'status_inflicted');
        }
        
        if (newStatusCondition === StatusCondition.PARALYSIS) {
            newBattleSpeedModifier = PARALYSIS_SPEED_MODIFIER;
            addBattleLog(`${targetName}の すばやさが がくっとさがった！`, 'debuff');
        }
        
        const updatedTarget = { 
            ...target, 
            statusCondition: newStatusCondition, 
            statusTurns: newStatusTurns, 
            confusionTurns: newConfusionTurns,
            battleSpeedModifier: newBattleSpeedModifier,
        };
        
        if (isPlayerTarget) {
            setOwnedPokemonDetails(prev => ({...prev, [target.id]: updatedTarget as OwnedPokemonDetails}));
        } else {
            setCurrentEnemy(updatedTarget as EnemyPokemon);
        }
        return updatedTarget;
    }
    return target; 
  }, [addBattleLog]);


  const spawnNewEnemy = useCallback(() => {
    if (!currentMapArea || currentMapArea.enemyDefinitions.length === 0 || evolvingPokemonVisualId || isBattleProcessing) {
      if (!evolvingPokemonVisualId && !isBattleProcessing && !isFarmModalOpen && !isPokedexOpen && !isUpgradesShopOpen && !adventure.isOnAdventure) {
         if (SoundManager.getCurrentBgmType() !== BgmType.MAIN_THEME) SoundManager.playBGM(BgmType.MAIN_THEME);
      }
      return;
    }

    let selectedEnemyDef: WildPokemonDefinitionInArea | undefined;
    if (currentMapArea.isGym && !defeatedGyms[currentMapArea.id]) {
        selectedEnemyDef = currentMapArea.enemyDefinitions.find(def => def.isGymLeader);
        if (selectedEnemyDef) {
            addBattleLog(`ジムリーダー、${POKEMONS.find(p=>p.id===selectedEnemyDef!.pokemonId)?.name || '不明なリーダー'} が待ち構えている！`, 'gym_leader_intro');
            SoundManager.playBGM(BgmType.BATTLE_THEME_GYM);
        }
    }

    if (!selectedEnemyDef) {
        const availableEnemies = currentMapArea.enemyDefinitions.filter(def => !def.isGymLeader);
        if (availableEnemies.length === 0) {
             if (currentMapArea.isGym && defeatedGyms[currentMapArea.id]) addBattleLog(`${currentMapArea.name} のジムリーダーはすでに倒されている。`, 'info');
             else addBattleLog(`${currentMapArea.name} にはもう野生のポケモンはいないようだ...`, 'info');
             if (!evolvingPokemonVisualId && !isBattleProcessing && !isFarmModalOpen && !isPokedexOpen && !isUpgradesShopOpen && !adventure.isOnAdventure) {
                 if (SoundManager.getCurrentBgmType() !== BgmType.MAIN_THEME) SoundManager.playBGM(BgmType.MAIN_THEME);
             }
             return;
        }
        const totalWeight = availableEnemies.reduce((sum, def) => sum + def.spawnWeight, 0);
        let randomRoll = Math.random() * totalWeight;
        for (const def of availableEnemies) { if (randomRoll < def.spawnWeight) { selectedEnemyDef = def; break; } randomRoll -= def.spawnWeight; }
        if (!selectedEnemyDef) selectedEnemyDef = availableEnemies[0];
    }

    const basePokemonData = POKEMONS.find(p => p.id === selectedEnemyDef!.pokemonId);
    if (!basePokemonData) {
      console.error(`野生のポケモンの定義に誤りがあります: ID ${selectedEnemyDef!.pokemonId} のポケモンが見つかりません。`);
      if (!evolvingPokemonVisualId && !isBattleProcessing && !isFarmModalOpen && !isPokedexOpen && !isUpgradesShopOpen && !adventure.isOnAdventure) {
          if (SoundManager.getCurrentBgmType() !== BgmType.MAIN_THEME) SoundManager.playBGM(BgmType.MAIN_THEME);
      }
      return;
    }

    let enemyMoves: { moveId: string }[] = [];
    if (selectedEnemyDef!.moves && selectedEnemyDef!.moves.length > 0) enemyMoves = selectedEnemyDef!.moves.map(id => ({ moveId: id}));
    else enemyMoves = basePokemonData.levelUpMoves.filter(lm => lm.level <= selectedEnemyDef!.level).slice(-MAX_LEARNED_MOVES).map(lm => ({ moveId: lm.moveId }));
    if(enemyMoves.length === 0) enemyMoves.push({ moveId: 'tackle' });

    const enemyLevel = selectedEnemyDef!.level;
    const initializedEnemy = initializePokemonDetails(basePokemonData, enemyLevel); // This sets ability too
    
    const newEnemy: EnemyPokemon = {
      ...initializedEnemy,
      name: basePokemonData.name,
      imageUrl: basePokemonData.imageUrl,
      types: basePokemonData.types,
      rewardPokeDollars: selectedEnemyDef!.rewardPokeDollars ?? currentMapArea.defaultRewardPokeDollars,
      moves: enemyMoves, 
      baseCatchRate: selectedEnemyDef!.baseCatchRate ?? 0.2,
      drops: selectedEnemyDef!.drops ?? [], 
      givesExperience: selectedEnemyDef!.givesExperience ?? currentMapArea.defaultGivesExperience,
      isBoss: selectedEnemyDef!.isBoss ?? false, 
      isGymLeader: selectedEnemyDef!.isGymLeader ?? false,
      battleTempStatModifiers: {}, // Reset for new enemy
      isFlashFireActive: false,
    };
    setCurrentEnemy(newEnemy);

    if (!newEnemy.isGymLeader) {
      addBattleLog(`野生の ${newEnemy.name} (Lv.${newEnemy.level}) が現れた！ (${currentMapArea.name})`, 'system');
      SoundManager.playBGM(BgmType.BATTLE_THEME_WILD);
    } else if (SoundManager.getCurrentBgmType() !== BgmType.BATTLE_THEME_GYM) {
       SoundManager.playBGM(BgmType.BATTLE_THEME_GYM);
    }
    
    // On switch-in abilities
    if (currentPlayerPokemonDetails && currentPlayerPokemonDetails.currentAbility === Ability.INTIMIDATE) {
        const abilityData = ABILITIES_DATA[Ability.INTIMIDATE];
        addBattleLog(`${POKEMONS.find(p=>p.id===currentPlayerPokemonDetails.id)?.name}の ${abilityData.name}が 発動！`, 'ability_activation');
        applyStatChange(newEnemy, false, 'attack', -1, abilityData.name);
    }
    if (newEnemy.currentAbility === Ability.INTIMIDATE && currentPlayerPokemonDetails) {
        const abilityData = ABILITIES_DATA[Ability.INTIMIDATE];
        addBattleLog(`${newEnemy.name}の ${abilityData.name}が 発動！`, 'ability_activation');
        applyStatChange(currentPlayerPokemonDetails, true, 'attack', -1, abilityData.name);
    }

  }, [addBattleLog, currentMapArea, defeatedGyms, evolvingPokemonVisualId, isBattleProcessing, isPokedexOpen, isUpgradesShopOpen, adventure.isOnAdventure, getMoveData, isFarmModalOpen, applyStatChange, currentPlayerPokemonDetails]);

  const switchToNextAvailablePokemon = useCallback((showLog = true): boolean => {
    const currentIndex = currentPokemonIndex;
    for (let i = 1; i <= ownedPokemonIds.length; i++) {
      const nextIndex = (currentIndex + i) % ownedPokemonIds.length;
      const nextPokemonId = ownedPokemonIds[nextIndex];
      const nextPokemonDetails = ownedPokemonDetails[nextPokemonId];
      if (nextPokemonDetails && nextPokemonDetails.currentHp > 0) {
        setCurrentPokemonIndex(nextIndex);
        const nextPokemonData = POKEMONS.find(p=>p.id === nextPokemonDetails.id);
        if(showLog && nextPokemonData) addBattleLog(`${nextPokemonData.name}、君に決めた！`, 'system');
        
        setOwnedPokemonDetails(prev => ({...prev, [nextPokemonId]: {...prev[nextPokemonId], battleTempStatModifiers: {}, battleSpeedModifier: prev[nextPokemonId].statusCondition === StatusCondition.PARALYSIS ? PARALYSIS_SPEED_MODIFIER : 1.0, isFlashFireActive: false}}));
        
        const newActivePokemonDetails = ownedPokemonDetails[nextPokemonId]; // Get the latest
        if (newActivePokemonDetails.currentAbility === Ability.INTIMIDATE && currentEnemy && currentEnemy.currentHp > 0) { // Ensure enemy is still there
            const abilityData = ABILITIES_DATA[Ability.INTIMIDATE];
            addBattleLog(`${nextPokemonData?.name}の ${abilityData.name}が 発動！`, 'ability_activation');
            applyStatChange(currentEnemy, false, 'attack', -1, abilityData.name);
        }

        SoundManager.playSoundEffect(SoundType.UI_BUTTON_CLICK);
        return true;
      }
    }
    return false;
  }, [ownedPokemonIds, ownedPokemonDetails, currentPokemonIndex, addBattleLog, currentEnemy, applyStatChange]);

  const checkAreaClearCondition = useCallback((defeatedEnemy: EnemyPokemon) => {
    if (!currentMapArea) return false;
    const newProgress = { ...areaProgress }; let cleared = false;
    if (currentMapArea.unlockConditionToNext.type === 'defeatCount') {
      newProgress.defeatCount += 1;
      if (newProgress.defeatCount >= (currentMapArea.unlockConditionToNext.count || Infinity)) cleared = true;
    } else if (currentMapArea.unlockConditionToNext.type === 'defeatBoss') {
      if ((defeatedEnemy.isBoss || defeatedEnemy.isGymLeader) && defeatedEnemy.id === currentMapArea.unlockConditionToNext.bossPokemonId) {
        newProgress.bossDefeated = true; cleared = true;
      }
    }
    setAreaProgress(newProgress); return cleared;
  }, [currentMapArea, areaProgress]);

  const handleEnemyDefeated = useCallback((defeatedEnemy: EnemyPokemon) => {
    addBattleLog(`${defeatedEnemy.name}を倒した！`, 'victory');
    SoundManager.playBGM(defeatedEnemy.isGymLeader ? BgmType.VICTORY_THEME_TRAINER : BgmType.VICTORY_THEME_WILD, false);
    setPokeDollars(prev => prev + defeatedEnemy.rewardPokeDollars);
    createDamagePopup(`+${formatNumber(defeatedEnemy.rewardPokeDollars)} ${CURRENCY_SYMBOL.substring(0,1)}`, defeatedEnemy.id, 'currency');

    if (currentPlayerPokemonDetails) {
        let updatedPlayerDetails = {...currentPlayerPokemonDetails, battleTempStatModifiers: {}, battleSpeedModifier: currentPlayerPokemonDetails.statusCondition === StatusCondition.PARALYSIS ? PARALYSIS_SPEED_MODIFIER : 1.0, isFlashFireActive: false };
        if (currentPlayerPokemonDetails.currentAbility === Ability.MOXIE) {
            const abilityData = ABILITIES_DATA[Ability.MOXIE];
            addBattleLog(`${POKEMONS.find(p=>p.id===currentPlayerPokemonDetails.id)?.name}の ${abilityData.name}が 発動！`, 'ability_activation');
            updatedPlayerDetails = applyStatChange(updatedPlayerDetails, true, 'attack', 1, abilityData.name) as OwnedPokemonDetails;
        }
        setOwnedPokemonDetails(prev => ({...prev, [currentPlayerPokemonDetails.id]: updatedPlayerDetails }));
    }


    if (defeatedEnemy.isGymLeader && currentMapArea) {
        setDefeatedGyms(prev => ({ ...prev, [currentMapArea.id]: true }));
        addBattleLog(`${currentMapArea.name} のジムリーダー、${defeatedEnemy.name} を打ち破った！`, 'gym_leader_defeat');
        const badgeItem = defeatedEnemy.drops?.find(d => ITEMS.find(i => i.id === d.itemId)?.category === ItemCategory.GYM_BADGE);
        if (badgeItem) {
             addItemToInventory(badgeItem.itemId, 1); 
             addBattleLog(`${ITEMS.find(i => i.id === badgeItem.itemId)?.name} を手に入れた！`, 'info');
        }
    }
    defeatedEnemy.drops?.forEach(drop => {
      if (Math.random() < drop.dropRate) {
        const quantity = Math.floor(Math.random() * (drop.quantityMax - drop.quantityMin + 1)) + drop.quantityMin;
        addItemToInventory(drop.itemId, quantity);
        addBattleLog(`${ITEMS.find(i => i.id === drop.itemId)?.name} を ${quantity}個 手に入れた！`, 'info');
      }
    });
    if (currentPlayerPokemonDetails && currentPlayerPokemonDetails.currentHp > 0) {
      addExperienceAndLevelUp(ownedPokemonIds[currentPokemonIndex], defeatedEnemy.givesExperience);
    }
    const areaCleared = checkAreaClearCondition(defeatedEnemy);
    if (areaCleared && currentMapArea && currentMapArea.nextAreaId) {
      addBattleLog(`${currentMapArea.name} をクリアした！ 次のエリアに進めるようになった！`, 'map_progress');
    }
    setTimeout(() => {
        setCurrentEnemy(null); 
        setIsBattleProcessing(false);
        if (SoundManager.getCurrentBgmType() === BgmType.VICTORY_THEME_WILD || SoundManager.getCurrentBgmType() === BgmType.VICTORY_THEME_TRAINER) {
            SoundManager.playBGM(BgmType.MAIN_THEME);
        }
    }, 2500); 
  }, [addItemToInventory, currentPlayerPokemonDetails, addExperienceAndLevelUp, addBattleLog, checkAreaClearCondition, currentMapArea, createDamagePopup, ownedPokemonIds, currentPokemonIndex, applyStatChange]);

  const calculateDamage = useCallback((attackerInput: OwnedPokemonDetails | EnemyPokemon, defenderInput: OwnedPokemonDetails | EnemyPokemon, move: Move): {damage: number, critical: boolean, effectivePower: number, typeEffective: boolean} => {
    let attacker = {...attackerInput}; 
    let defender = {...defenderInput};
    const attackerName = POKEMONS.find(p=>p.id === attacker.id)?.name || attacker.name;
    const defenderName = POKEMONS.find(p=>p.id === defender.id)?.name || defender.name;

    if (move.power === null || move.category === MoveCategory.STATUS) return {damage: 0, critical: false, effectivePower: 0, typeEffective: true};

    if (defender.currentAbility === Ability.LEVITATE && move.type === PokemonType.GROUND) {
        addBattleLog(`${defenderName}の ${ABILITIES_DATA[Ability.LEVITATE].name} で効果がないようだ！`, 'ability_activation');
        return {damage: 0, critical: false, effectivePower: 0, typeEffective: false};
    }
    if (defender.currentAbility === Ability.FLASH_FIRE && move.type === PokemonType.FIRE) {
        addBattleLog(`${defenderName}の ${ABILITIES_DATA[Ability.FLASH_FIRE].name} でほのおを吸収した！`, 'ability_activation');
        if (defender.id === currentPlayerPokemonDetails?.id) {
            setOwnedPokemonDetails(prev => ({...prev, [defender.id]: {...prev[defender.id], isFlashFireActive: true}}));
        } else if (defender.id === currentEnemy?.id) {
            setCurrentEnemy(prev => prev ? {...prev, isFlashFireActive: true} : null);
        }
        return {damage: 0, critical: false, effectivePower: 0, typeEffective: false};
    }

    const attackerLevel = attacker.level;
    let attackerEffectiveStat = move.category === MoveCategory.PHYSICAL ? attacker.stats.attack : attacker.stats.specialAttack;
    let defenderEffectiveStat = move.category === MoveCategory.PHYSICAL ? defender.stats.defense : defender.stats.specialDefense;

    const attackerModStat = move.category === MoveCategory.PHYSICAL ? 'attack' : 'specialAttack';
    const defenderModStat = move.category === MoveCategory.PHYSICAL ? 'defense' : 'specialDefense';

    attackerEffectiveStat *= STAT_RANK_MULTIPLIERS[attacker.battleTempStatModifiers[attackerModStat] || 0] || 1;
    defenderEffectiveStat *= STAT_RANK_MULTIPLIERS[defender.battleTempStatModifiers[defenderModStat] || 0] || 1;
    
    if (move.category === MoveCategory.PHYSICAL && attacker.statusCondition === StatusCondition.BURN) {
        attackerEffectiveStat *= BURN_ATTACK_MODIFIER;
        addBattleLog(`${attackerName}はやけどで攻撃が弱っている！`, 'status_effect');
    }
    attackerEffectiveStat = Math.max(1, Math.floor(attackerEffectiveStat));
    defenderEffectiveStat = Math.max(1, Math.floor(defenderEffectiveStat));

    let effectiveMovePower = move.power;
    const hpRatio = attacker.currentHp / attacker.currentMaxHp;
    if (hpRatio <= 1/3) {
        if (attacker.currentAbility === Ability.OVERGROW && move.type === PokemonType.GRASS) { addBattleLog(`${attackerName}の ${ABILITIES_DATA[Ability.OVERGROW].name}！`, 'ability_activation'); effectiveMovePower = Math.floor(effectiveMovePower * 1.5); }
        else if (attacker.currentAbility === Ability.BLAZE && move.type === PokemonType.FIRE) { addBattleLog(`${attackerName}の ${ABILITIES_DATA[Ability.BLAZE].name}！`, 'ability_activation'); effectiveMovePower = Math.floor(effectiveMovePower * 1.5); }
        else if (attacker.currentAbility === Ability.TORRENT && move.type === PokemonType.WATER) { addBattleLog(`${attackerName}の ${ABILITIES_DATA[Ability.TORRENT].name}！`, 'ability_activation'); effectiveMovePower = Math.floor(effectiveMovePower * 1.5); }
    }
    if (attacker.isFlashFireActive && move.type === PokemonType.FIRE) {
        addBattleLog(`${attackerName}の ${ABILITIES_DATA[Ability.FLASH_FIRE].name}の効果でほのお技が強くなった！`, 'ability_activation');
        effectiveMovePower = Math.floor(effectiveMovePower * 1.5);
    }

    let damage = Math.floor( ( ( ( (attackerLevel * 2 / 5) + 2 ) * effectiveMovePower * attackerEffectiveStat / defenderEffectiveStat ) / 50 ) + 2 );

    const attackerBaseData = POKEMONS.find(p => p.id === attacker.id);
    if (attackerBaseData && attackerBaseData.types.includes(move.type)) damage = Math.floor(damage * 1.5); // STAB

    let typeMultiplier = 1;
    const defenderBaseData = POKEMONS.find(p => p.id === defender.id);
    if (defenderBaseData) defenderBaseData.types.forEach(defenderType => { typeMultiplier *= TYPE_CHART[move.type]?.[defenderType] ?? 1; });
    
    let typeEffectiveMessage = true;
    if (typeMultiplier > 1) addBattleLog("こうかは ばつぐんだ！", "info");
    else if (typeMultiplier < 1 && typeMultiplier > 0) addBattleLog("こうかは いまひとつの ようだ...", "info");
    else if (typeMultiplier === 0) { addBattleLog("こうかが ない みたいだ...", "info"); typeEffectiveMessage = false; }
    damage = Math.floor(damage * typeMultiplier);

    let critical = false;
    if (Math.random() < BASE_CRITICAL_HIT_CHANCE) { addBattleLog("きゅうしょに あたった！", "info"); damage = Math.floor(damage * CRITICAL_HIT_MULTIPLIER); critical = true; }
    
    damage = Math.floor(damage * (1 + (Math.random() * (DAMAGE_VARIATION * 2)) - DAMAGE_VARIATION));
    return {damage: Math.max(typeMultiplier === 0 ? 0 : 1, damage), critical, effectivePower: effectiveMovePower, typeEffective: typeEffectiveMessage};
  }, [addBattleLog, currentPlayerPokemonDetails, currentEnemy]);

  const applyDamageToEnemy = useCallback((damage: number, critical: boolean, enemy: EnemyPokemon) => {
    const newHp = Math.max(0, enemy.currentHp - damage);
    addBattleLog(`${enemy.name} に ${damage} のダメージ！`, 'enemy_damage');
    createDamagePopup(damage > 0 ? damage : 'Miss!', enemy.id, 'enemy', critical);
    
    let updatedEnemy = {...enemy, currentHp: newHp};
    if (newHp === 0) {
        updatedEnemy = {...updatedEnemy, statusCondition: StatusCondition.NONE, statusTurns: 0, confusionTurns: 0, battleSpeedModifier: 1.0, battleTempStatModifiers: {}, isFlashFireActive: false };
        setCurrentEnemy(updatedEnemy); 
        handleEnemyDefeated(updatedEnemy);
    } else {
        setCurrentEnemy(updatedEnemy);
    }
  }, [handleEnemyDefeated, addBattleLog, createDamagePopup]);

  const applyDamageToPlayer = useCallback((damage: number, critical: boolean, playerPokemonOriginalId: string) => {
    const playerPokemonDetails = ownedPokemonDetails[playerPokemonOriginalId];
    if (!playerPokemonDetails) return;
    const newHp = Math.max(0, playerPokemonDetails.currentHp - damage);
    const pokemonData = POKEMONS.find(p => p.id === playerPokemonDetails.id);
    if(pokemonData) addBattleLog(`${pokemonData.name} は ${damage} のダメージを受けた！`, 'player_damage');
    createDamagePopup(damage > 0 ? damage : 'Miss!', playerPokemonDetails.id, 'player', critical);
    
    let updatedDetails = {...playerPokemonDetails, currentHp: newHp};
    if (newHp === 0) {
        if(pokemonData) addBattleLog(`${pokemonData.name}は たおれた！`, 'info');
        updatedDetails = {...updatedDetails, statusCondition: StatusCondition.NONE, statusTurns: 0, confusionTurns: 0, battleSpeedModifier: 1.0, battleTempStatModifiers: {}, isFlashFireActive: false };
        SoundManager.playSoundEffect(SoundType.POKEMON_FAINT);
    }
    setOwnedPokemonDetails(prev => ({ ...prev, [playerPokemonOriginalId]: updatedDetails }));

    if (newHp === 0) {
        if (!switchToNextAvailablePokemon(true)) { /* All fainted, useEffect will handle */ }
    }
  }, [addBattleLog, switchToNextAvailablePokemon, createDamagePopup, ownedPokemonDetails]);

  const consumePlayerMovePP = useCallback((moveId: string) => {
    if (!currentPlayerPokemonDetails) return;
    const playerOriginalId = ownedPokemonIds[currentPokemonIndex];
    const moveIndex = currentPlayerPokemonDetails.learnedMoves.findIndex(m => m.moveId === moveId);
    if (moveIndex === -1) return;
    const newLearnedMoves = [...currentPlayerPokemonDetails.learnedMoves];
    newLearnedMoves[moveIndex] = { ...newLearnedMoves[moveIndex], currentPP: Math.max(0, newLearnedMoves[moveIndex].currentPP - 1) };
    setOwnedPokemonDetails(prev => ({ ...prev, [playerOriginalId]: { ...prev[playerOriginalId], learnedMoves: newLearnedMoves } }));
  }, [currentPlayerPokemonDetails, ownedPokemonIds, currentPokemonIndex]);

  const handleTurnEffects = useCallback((pokemon: OwnedPokemonDetails | EnemyPokemon, isPlayer: boolean): { canMove: boolean, pokemonAfterEffects: OwnedPokemonDetails | EnemyPokemon } => {
    let currentPokemon = { ...pokemon }; 
    let canMove = true;
    const pokemonName = POKEMONS.find(p => p.id === currentPokemon.id)?.name || currentPokemon.name;

    if (currentPokemon.confusionTurns > 0) {
        addBattleLog(`${pokemonName}は こんらんしている！`, 'status_effect');
        currentPokemon.confusionTurns--;
        if (currentPokemon.confusionTurns <= 0) {
            addBattleLog(`${pokemonName}は こんらんが とけた！`, 'status_cured');
        } else {
            if (Math.random() < CONFUSION_SELF_ATTACK_CHANCE) {
                addBattleLog(`${pokemonName}は わけもわからず 自分を攻撃した！`, 'status_effect');
                const selfDamageMove: Move = { id: 'confusion-self-hit', name: 'じぶんをこうげき', type: PokemonType.NORMAL, category: MoveCategory.PHYSICAL, power: CONFUSION_SELF_ATTACK_POWER, accuracy: null, pp: 0, description: '' };
                const { damage: selfDamage } = calculateDamage(currentPokemon, currentPokemon, selfDamageMove);
                
                const newHp = Math.max(0, currentPokemon.currentHp - selfDamage);
                createDamagePopup(selfDamage, currentPokemon.id, isPlayer ? 'player' : 'enemy');
                currentPokemon.currentHp = newHp;
                if (newHp === 0) {
                     addBattleLog(`${pokemonName}はたおれた！`, 'info');
                     currentPokemon = {...currentPokemon, statusCondition: StatusCondition.NONE, statusTurns: 0, confusionTurns: 0, battleSpeedModifier: 1.0, battleTempStatModifiers: {}, isFlashFireActive: false };
                     SoundManager.playSoundEffect(SoundType.POKEMON_FAINT);
                }
                canMove = false;
            }
        }
    }

    if (!canMove) return { canMove, pokemonAfterEffects: currentPokemon };

    if (currentPokemon.statusCondition === StatusCondition.SLEEP) {
        if (currentPokemon.statusTurns > 0) {
            addBattleLog(`${pokemonName}は ぐうぐうねむっている！`, 'status_effect');
            currentPokemon.statusTurns--;
            canMove = false;
        }
        if (currentPokemon.statusTurns <= 0 && !canMove) { // Woke up this turn
            addBattleLog(`${pokemonName}は めをさました！`, 'status_cured');
            currentPokemon.statusCondition = StatusCondition.NONE;
        }
    }

    if (!canMove) return { canMove, pokemonAfterEffects: currentPokemon };

    if (currentPokemon.statusCondition === StatusCondition.PARALYSIS) {
        if (Math.random() < PARALYSIS_CHANCE_TO_SKIP_TURN) {
            addBattleLog(`${pokemonName}は からだがしびれて うごけない！`, 'status_effect');
            canMove = false;
        }
    }
    
    return { canMove, pokemonAfterEffects: currentPokemon };
  }, [addBattleLog, calculateDamage, createDamagePopup]);

  const handleEndOfTurnStatusDamage = useCallback((pokemon: OwnedPokemonDetails | EnemyPokemon, isPlayer: boolean) => {
    let currentPokemon = { ...pokemon };
    const pokemonName = POKEMONS.find(p => p.id === currentPokemon.id)?.name || currentPokemon.name;

    if (currentPokemon.currentHp > 0) { 
        if (currentPokemon.statusCondition === StatusCondition.POISON || currentPokemon.statusCondition === StatusCondition.BURN) {
            const damage = Math.max(1, Math.floor(currentPokemon.currentMaxHp * STATUS_DAMAGE_FRACTION));
            addBattleLog(`${pokemonName}は ${STATUS_CONDITION_TEXT[currentPokemon.statusCondition]} のダメージを受けている！`, 'status_effect');
            const newHp = Math.max(0, currentPokemon.currentHp - damage);
            createDamagePopup(damage, currentPokemon.id, isPlayer ? 'player' : 'enemy');
            currentPokemon.currentHp = newHp;

            if (newHp === 0) {
                 addBattleLog(`${pokemonName}はたおれた！`, 'info');
                 currentPokemon = {...currentPokemon, statusCondition: StatusCondition.NONE, statusTurns: 0, confusionTurns: 0, battleSpeedModifier: 1.0, battleTempStatModifiers: {}, isFlashFireActive: false };
                 SoundManager.playSoundEffect(SoundType.POKEMON_FAINT);
            }
        }
    }
    
    if (isPlayer) {
        setOwnedPokemonDetails(prev => ({ ...prev, [pokemon.id]: currentPokemon as OwnedPokemonDetails }));
        if (currentPokemon.currentHp === 0 && !allPlayerPokemonFainted) { // Ensure not to call if game is already over
            if (!switchToNextAvailablePokemon(true)) { /* All fainted handled by useEffect */ }
        }
    } else {
        setCurrentEnemy(currentPokemon as EnemyPokemon);
        if (currentPokemon.currentHp === 0) {
            handleEnemyDefeated(currentPokemon as EnemyPokemon);
        }
    }

  }, [addBattleLog, createDamagePopup, switchToNextAvailablePokemon, handleEnemyDefeated, allPlayerPokemonFainted]);


  const handleEnemyAttack = useCallback(() => {
    if (!currentEnemy || currentEnemy.currentHp <= 0 || !currentPlayerPokemonDetails || currentPlayerPokemonDetails.currentHp <= 0 || isBattleProcessing) {
      setIsBattleProcessing(false);
      return;
    }
    setIsBattleProcessing(true);

    const { canMove: enemyCanMove, pokemonAfterEffects: enemyAfterTurnEffects } = handleTurnEffects(currentEnemy, false);
    let finalEnemyState = enemyAfterTurnEffects as EnemyPokemon; 

    if (!enemyCanMove) {
        setCurrentEnemy(finalEnemyState); 
        if(finalEnemyState.currentHp <=0) { handleEnemyDefeated(finalEnemyState); }
         else { handleEndOfTurnStatusDamage(finalEnemyState, false); }
        setIsBattleProcessing(false);
        return;
    }
    
    const enemyMoveDef = finalEnemyState.moves[Math.floor(Math.random() * finalEnemyState.moves.length)];
    const enemyMoveData = getMoveData(enemyMoveDef.moveId);

    if (!enemyMoveData) {
      addBattleLog(`${finalEnemyState.name} は様子を見ている... (技データなし)`, 'system');
      handleEndOfTurnStatusDamage(finalEnemyState, false);
      setIsBattleProcessing(false);
      return;
    }

    addBattleLog(`${finalEnemyState.name} の ${enemyMoveData.name}！`, 'enemy_attack');
    SoundManager.playSoundEffect(SoundType.DAMAGE_PLAYER); 

    let moveHit = true;
    if (enemyMoveData.accuracy !== null && Math.random() >= (enemyMoveData.accuracy / 100)) {
        addBattleLog(`${finalEnemyState.name}の こうげきは はずれた！`, 'info');
        moveHit = false;
    }

    if (moveHit && currentPlayerPokemonDetails) {
        if (enemyMoveData.category === MoveCategory.STATUS) {
            if (enemyMoveData.statChanges) {
                enemyMoveData.statChanges.forEach(sc => {
                     if (sc.chance === undefined || Math.random() < sc.chance) {
                        const targetIsSelf = sc.target === 'self';
                        let targetPokemon = targetIsSelf ? finalEnemyState : currentPlayerPokemonDetails;
                        if (targetPokemon) targetPokemon = applyStatChange(targetPokemon, targetIsSelf ? false : true, sc.stat, sc.change, enemyMoveData.name) as typeof targetPokemon;
                        if (targetIsSelf) finalEnemyState = targetPokemon as EnemyPokemon;
                    }
                });
            }
            if (enemyMoveData.statusEffect && currentPlayerPokemonDetails) {
                applyStatusCondition(currentPlayerPokemonDetails, true, enemyMoveData.statusEffect.condition, enemyMoveData.statusEffect.chance, enemyMoveData.statusEffect.turnsMin, enemyMoveData.statusEffect.turnsMax, enemyMoveData.name);
            }
        } else if (enemyMoveData.power !== null && currentPlayerPokemonDetails) {
            const { damage, critical, typeEffective } = calculateDamage(finalEnemyState, currentPlayerPokemonDetails, enemyMoveData);
            if (typeEffective) applyDamageToPlayer(damage, critical, ownedPokemonIds[currentPokemonIndex]);
            
            if (enemyMoveData.isContactMove && currentPlayerPokemonDetails.currentAbility === Ability.STATIC && Math.random() < 0.3 && currentPlayerPokemonDetails.currentHp > 0) { // Check player still alive
                 addBattleLog(`${POKEMONS.find(p=>p.id === currentPlayerPokemonDetails.id)?.name}の ${ABILITIES_DATA[Ability.STATIC].name}が 発動！`, 'ability_activation');
                 finalEnemyState = applyStatusCondition(finalEnemyState, false, StatusCondition.PARALYSIS, 1.0, undefined, undefined, ABILITIES_DATA[Ability.STATIC].name) as EnemyPokemon;
            }
        }
    }
    setCurrentEnemy(finalEnemyState); 
    handleEndOfTurnStatusDamage(finalEnemyState, false);
    if (currentPlayerPokemonDetails && currentPlayerPokemonDetails.currentHp > 0) handleEndOfTurnStatusDamage(currentPlayerPokemonDetails, true);


    setIsBattleProcessing(false); 
  }, [currentEnemy, currentPlayerPokemonDetails, ownedPokemonIds, currentPokemonIndex, calculateDamage, applyDamageToPlayer, addBattleLog, getMoveData, applyStatChange, applyStatusCondition, handleTurnEffects, handleEndOfTurnStatusDamage, isBattleProcessing, handleEnemyDefeated]);


  const handlePlayerAttack = useCallback((moveId: string) => {
    if (!currentEnemy || !currentPlayerPokemonDetails || currentPlayerPokemonDetails.currentHp <= 0 || isBattleProcessing || allPlayerPokemonFainted) return;
    
    const moveData = getMoveData(moveId);
    if (!moveData) return;
     if (currentPlayerPokemonDetails.learnedMoves.find(m => m.moveId === moveId)?.currentPP === 0) {
        addBattleLog(`${moveData.name}のPPがない！`, 'system');
        return;
    }

    setIsBattleProcessing(true);
    const attackerName = POKEMONS.find(p => p.id === currentPlayerPokemonDetails.id)?.name || 'ポケモン';
    
    const {canMove: playerCanMove, pokemonAfterEffects: playerAfterTurnEffects} = handleTurnEffects(currentPlayerPokemonDetails, true);
    let finalPlayerState = playerAfterTurnEffects as OwnedPokemonDetails;

    if (!playerCanMove) {
        setOwnedPokemonDetails(prev => ({...prev, [finalPlayerState.id]: finalPlayerState }));
        if(finalPlayerState.currentHp <= 0 && !allPlayerPokemonFainted) { switchToNextAvailablePokemon(true); } // Check allPlayerFainted to avoid loop
        else { handleEndOfTurnStatusDamage(finalPlayerState, true); }
        
        if (currentEnemy && currentEnemy.currentHp > 0 && finalPlayerState.currentHp > 0 && !allPlayerPokemonFainted) { // Ensure player isn't fainted before enemy attacks
            setTimeout(() => { handleEnemyAttack(); }, 1000);
        } else {
            setIsBattleProcessing(false);
        }
        return;
    }

    addBattleLog(`${attackerName} の ${moveData.name}！`, 'player_attack');
    SoundManager.playSoundEffect(SoundType.DAMAGE_ENEMY); 
    consumePlayerMovePP(moveId);

    let moveHit = true;
    if (moveData.accuracy !== null && Math.random() >= (moveData.accuracy / 100)) {
        addBattleLog(`${attackerName}の こうげきは はずれた！`, 'info');
        moveHit = false;
    }

    if (moveHit && currentEnemy) {
        if (moveData.category === MoveCategory.STATUS) {
             if (moveData.statChanges) {
                moveData.statChanges.forEach(sc => {
                    if (sc.chance === undefined || Math.random() < sc.chance) {
                        const targetIsSelf = sc.target === 'self';
                        let targetPokemon = targetIsSelf ? finalPlayerState : currentEnemy;
                        if(targetPokemon) targetPokemon = applyStatChange(targetPokemon, targetIsSelf ? true : false, sc.stat, sc.change, moveData.name) as typeof targetPokemon;
                        if(targetIsSelf) finalPlayerState = targetPokemon as OwnedPokemonDetails;
                    }
                });
            }
            if (moveData.statusEffect && currentEnemy) {
                 applyStatusCondition(currentEnemy, false, moveData.statusEffect.condition, moveData.statusEffect.chance, moveData.statusEffect.turnsMin, moveData.statusEffect.turnsMax, moveData.name);
            }
        } else if (moveData.power !== null) {
            const { damage, critical, typeEffective } = calculateDamage(finalPlayerState, currentEnemy, moveData);
            if (typeEffective) {
                 applyDamageToEnemy(damage, critical, currentEnemy);
                 if (moveData.isContactMove && currentEnemy && currentEnemy.currentAbility === Ability.STATIC && Math.random() < 0.3 && currentEnemy.currentHp > 0) {
                     addBattleLog(`${currentEnemy.name}の ${ABILITIES_DATA[Ability.STATIC].name}が 発動！`, 'ability_activation');
                     finalPlayerState = applyStatusCondition(finalPlayerState, true, StatusCondition.PARALYSIS, 1.0, undefined, undefined, ABILITIES_DATA[Ability.STATIC].name) as OwnedPokemonDetails;
                 }
            }
        }
    }
    
    setOwnedPokemonDetails(prev => ({...prev, [finalPlayerState.id]: finalPlayerState })); 
    handleEndOfTurnStatusDamage(finalPlayerState, true);
    if (currentEnemy && currentEnemy.currentHp > 0) { handleEndOfTurnStatusDamage(currentEnemy, false); }


    if (currentEnemy && currentEnemy.currentHp > 0 && finalPlayerState.currentHp > 0 && !allPlayerPokemonFainted) { 
        setTimeout(() => {
            if(currentEnemy.currentHp > 0 && finalPlayerState.currentHp > 0 && !allPlayerPokemonFainted) { 
                handleEnemyAttack();
            } else {
                setIsBattleProcessing(false); 
            }
        }, 1000); 
    } else { 
        setIsBattleProcessing(false); 
    }
  }, [currentEnemy, currentPlayerPokemonDetails, isBattleProcessing, allPlayerPokemonFainted, calculateDamage, applyDamageToEnemy, handleEnemyAttack, addBattleLog, getMoveData, consumePlayerMovePP, applyStatChange, applyStatusCondition, handleTurnEffects, handleEndOfTurnStatusDamage, switchToNextAvailablePokemon]);

  const tryCatchPokemon = useCallback(() => {
    if (!currentEnemy || isBattleProcessing || currentEnemy.isGymLeader || ownedPokemonIds.length >= MAX_POKEMON_TO_OWN || allPlayerPokemonFainted) {
      if(currentEnemy?.isGymLeader) addBattleLog("ジムリーダーは捕獲できません！", "system");
      if(ownedPokemonIds.length >= MAX_POKEMON_TO_OWN) addBattleLog("これ以上ポケモンを持てません！", "system");
      return;
    }
    if ((ownedItems['poke-ball'] || 0) <= 0) { addBattleLog("モンスターボールがない！", "system"); return; }

    setIsBattleProcessing(true);
    addBattleLog(`モンスターボールを投げた！`, 'info');
    SoundManager.playSoundEffect(SoundType.BALL_THROW);
    removeItemFromInventory('poke-ball', 1);

    let attempt = 0;
    const maxAttempts = 3;
    const shakeInterval = 800; 

    const shakeAndCheck = () => {
        if (attempt < maxAttempts) {
            attempt++;
            addBattleLog(`ボールが揺れている... (${attempt}/3)`, 'info');
            SoundManager.playSoundEffect(SoundType.BALL_SHAKE);
            const statusBonus = currentEnemy.statusCondition === StatusCondition.SLEEP || currentEnemy.statusCondition === StatusCondition.PARALYSIS ? 1.5 : currentEnemy.statusCondition !== StatusCondition.NONE ? 1.2 : 1;
            const baseCatchRate = currentEnemy.baseCatchRate * (currentEnemy.maxHp / Math.max(1, currentEnemy.currentHp) * CATCH_CHANCE_HP_FACTOR) * statusBonus;
            const pokemonDataForCatchBonus = POKEMONS.find(p => p.id === currentEnemy.id);
            const finalCatchChance = Math.min(MAX_CATCH_CHANCE, Math.max(MIN_CATCH_CHANCE, baseCatchRate * (pokemonDataForCatchBonus?.catchRateBonus ?? 1)));

            if (Math.random() <= finalCatchChance) { 
                setTimeout(() => {
                    SoundManager.playSoundEffect(SoundType.CATCH_SUCCESS_FANFARE);
                    addBattleLog(`${currentEnemy.name} を捕まえた！`, 'catch_success');
                    setPokeDollars(prev => prev + currentEnemy.rewardPokeDollars / 2); 
                    createDamagePopup(`+${formatNumber(currentEnemy.rewardPokeDollars / 2)} ${CURRENCY_SYMBOL.substring(0,1)}`, currentEnemy.id, 'currency');

                    const newPokemonData = POKEMONS.find(p => p.id === currentEnemy.id);
                    if (newPokemonData) {
                        if (!ownedPokemonDetails[newPokemonData.id]) { 
                            const newDetails = initializePokemonDetails(newPokemonData, currentEnemy.level);
                            setOwnedPokemonDetails(prev => ({ ...prev, [newPokemonData.id]: newDetails }));
                            if (!ownedPokemonIds.includes(newPokemonData.id)) setOwnedPokemonIds(prev => [...prev, newPokemonData.id]);
                            if (!firstCaughtAt[newPokemonData.id]) setFirstCaughtAt(prev => ({ ...prev, [newPokemonData.id]: Date.now() }));
                        } else { 
                            addBattleLog(`${newPokemonData.name} は既に持っているので、経験値を獲得した！`, 'info');
                            if (currentPlayerPokemonDetails) addExperienceAndLevelUp(ownedPokemonIds[currentPokemonIndex], currentEnemy.givesExperience);
                        }
                    }
                    setCurrentEnemy(null);
                    setIsBattleProcessing(false);
                }, shakeInterval);
                return; 
            }
            if (attempt < maxAttempts) {
              setTimeout(shakeAndCheck, shakeInterval);
            } else { 
              setTimeout(() => {
                addBattleLog(`${currentEnemy.name} はボールから出てきた！`, 'catch_fail');
                if (currentEnemy && currentEnemy.currentHp > 0 && !allPlayerPokemonFainted) handleEnemyAttack(); else setIsBattleProcessing(false);
              }, shakeInterval);
            }
        }
    };
    setTimeout(shakeAndCheck, shakeInterval); 

  }, [currentEnemy, isBattleProcessing, ownedPokemonIds, ownedItems, allPlayerPokemonFainted, removeItemFromInventory, addBattleLog, getMoveData, handleEnemyAttack, createDamagePopup, addExperienceAndLevelUp, getInitialLearnedMoves, ownedPokemonDetails, firstCaughtAt, currentPlayerPokemonDetails, currentPokemonIndex]);

  const handleRunAttempt = useCallback(() => {
    if (!currentEnemy || isBattleProcessing || allPlayerPokemonFainted) return;
    setIsBattleProcessing(true);
    addBattleLog("逃げようとしている...", "info");
    SoundManager.playSoundEffect(SoundType.UI_BUTTON_CLICK);

    setTimeout(() => {
      if (Math.random() < 0.6) { 
        addBattleLog("うまく逃げ切れた！", "system");
        setCurrentEnemy(null); 
        if (currentPlayerPokemonDetails) {
            setOwnedPokemonDetails(prev => ({...prev, [currentPlayerPokemonDetails.id]: {...prev[currentPlayerPokemonDetails.id], battleTempStatModifiers: {}, battleSpeedModifier: prev[currentPlayerPokemonDetails.id].statusCondition === StatusCondition.PARALYSIS ? PARALYSIS_SPEED_MODIFIER : 1.0, isFlashFireActive: false}}));
        }
        setIsBattleProcessing(false);
        if (SoundManager.getCurrentBgmType() !== BgmType.MAIN_THEME) SoundManager.playBGM(BgmType.MAIN_THEME);
      } else {
        addBattleLog("逃げられなかった！", "system");
        if (!allPlayerPokemonFainted) handleEnemyAttack(); else setIsBattleProcessing(false);
      }
    }, 1000);
  }, [currentEnemy, isBattleProcessing, allPlayerPokemonFainted, handleEnemyAttack, addBattleLog, currentPlayerPokemonDetails]);


  const healAllPokemon = useCallback(() => {
    setOwnedPokemonDetails(prevDetails => {
      const newDetails: Record<string, OwnedPokemonDetails> = {};
      for (const id in prevDetails) {
        const baseData = POKEMONS.find(p => p.id === prevDetails[id].id);
        if (baseData) {
            const initialized = initializePokemonDetails(baseData, prevDetails[id].level);
            newDetails[id] = {
                ...initialized, // This resets status, temp stats, speed mod, flash fire
                experience: prevDetails[id].experience, 
                learnedMoves: prevDetails[id].learnedMoves.map(lm => { 
                    const moveData = getMoveData(lm.moveId);
                    return { ...lm, currentPP: moveData?.pp ?? 0 };
                }),
            };
        }
      }
      return newDetails;
    });
    addBattleLog('手持ちのポケモンはみんな元気になった！', 'system');
    SoundManager.playSoundEffect(SoundType.HEAL);
    setAllPlayerPokemonFainted(false); 
    if (SoundManager.getCurrentBgmType() !== BgmType.MAIN_THEME && !currentEnemy) SoundManager.playBGM(BgmType.MAIN_THEME);

  }, [addBattleLog, getMoveData, currentEnemy]);


  const handlePokemonCheer = useCallback(() => {
    if (evolvingPokemonVisualId) return;
    if (currentPlayerPokemonDetails && currentPlayerPokemonDetails.currentHp <= 0) return;

    SoundManager.playSoundEffect(SoundType.GENERIC_CLICK);

    setPokeDollars(prev => {
        const incomeThisClick = cheerBuff.isActive ? Math.floor(baseClickIncome * cheerBuff.currentMultiplier) : baseClickIncome;
        if (incomeThisClick > 0) {
            createDamagePopup(`+${incomeThisClick}`, currentPlayerPokemonDetails?.id || 'player', 'currency');
        }
        return prev + incomeThisClick;
    });

    if (!cheerBuff.isActive) {
      setCheerBuff(prev => ({ ...prev, isActive: true, endTime: Date.now() + prev.currentDurationMs, baseActivatedTime: Date.now() }));
    } else {
      setCheerBuff(prev => {
        const newEndTime = (prev.endTime || Date.now()) + clickBuffExtendMs;
        const maxPossibleEndTime = (prev.baseActivatedTime || Date.now()) + prev.currentDurationMs + MAX_TOTAL_BUFF_DURATION_MS_ADDITION;
        return { ...prev, endTime: Math.min(newEndTime, maxPossibleEndTime) };
      });
    }
  }, [baseClickIncome, cheerBuff, clickBuffExtendMs, currentPlayerPokemonDetails, createDamagePopup, evolvingPokemonVisualId]);

  const calculatePDS = useCallback(() => {
    let totalPDS = 0;
    ownedPokemonIds.forEach(id => {
      const pokemonData = POKEMONS.find(p => p.id === id);
      const details = ownedPokemonDetails[id];
      if (pokemonData && details && details.currentHp > 0) {
        let pdsForThisPokemon = pokemonData.baseAutoIncomePerSecond;
        pdsForThisPokemon *= (1 + (details.level -1) * PDS_INCREASE_PER_LEVEL_FACTOR); 
        totalPDS += pdsForThisPokemon;
      }
    });

    let multiplier = 1;
    for (const upgradeId in ownedUpgrades) {
      const upgradeDef = UPGRADES.find(u => u.id === upgradeId);
      const owned = ownedUpgrades[upgradeId];
      if (upgradeDef && owned) {
        if (upgradeDef.type === UpgradeType.AUTO_INCOME_BOOST) {
          totalPDS += upgradeDef.effectValue * owned.level;
        } else if (upgradeDef.type === UpgradeType.AUTO_INCOME_MULTIPLIER) {
          multiplier *= Math.pow(upgradeDef.effectValue, owned.level);
        }
      }
    }
    totalPDS *= multiplier;
    return totalPDS;
  }, [ownedPokemonIds, ownedPokemonDetails, ownedUpgrades]);

  const handleBuyUpgrade = useCallback((upgradeId: string) => {
    const upgradeDef = UPGRADES.find(u => u.id === upgradeId);
    if (!upgradeDef) return;

    const cost = calculateUpgradeCost(upgradeDef);
    if (pokeDollars >= cost) {
      const currentLevel = ownedUpgrades[upgradeId]?.level || 0;
      if (upgradeDef.maxLevel !== undefined && currentLevel >= upgradeDef.maxLevel) {
        addBattleLog(`${upgradeDef.name} は既に最大レベルです。`, 'system');
        return;
      }

      setPokeDollars(prev => prev - cost);
      setOwnedUpgrades(prev => ({
        ...prev,
        [upgradeId]: { level: (prev[upgradeId]?.level || 0) + 1 }
      }));
      addBattleLog(`${upgradeDef.name} を購入しました！ (Lv.${currentLevel + 1})`, 'shop_action');
      SoundManager.playSoundEffect(SoundType.SHOP_TRANSACTION);

      if (upgradeDef.type === UpgradeType.FEATURE_UNLOCK && upgradeDef.id === 'autoBattleChip') {
        setIsAutoBattleUnlocked(true);
      }
      if (upgradeDef.type === UpgradeType.FARM_PLOT_INCREASE) {
        setFarmPlots(prevPlots => {
            const newPlotsToAdd = upgradeDef.effectValue;
            const newPlotArray = [...prevPlots];
            for(let i = 0; i < newPlotsToAdd && newPlotArray.length < MAX_FARM_PLOTS; i++) {
                newPlotArray.push({ plantedBerryId: null, plantTime: null, growthStage: 0, isHarvestable: false });
            }
            return newPlotArray;
        });
      }
       saveGameState();
    } else {
      addBattleLog(`${CURRENCY_SYMBOL}が足りません！`, 'system');
    }
  }, [pokeDollars, ownedUpgrades, calculateUpgradeCost, addBattleLog, saveGameState]);

  const handleBuyItem = useCallback((itemId: string, quantity: number) => {
    const itemDef = ITEMS.find(i => i.id === itemId);
    if (!itemDef || !itemDef.buyPrice) return;

    const totalCost = itemDef.buyPrice * quantity;
    if (pokeDollars >= totalCost) {
      setPokeDollars(prev => prev - totalCost);
      addItemToInventory(itemId, quantity);
      addBattleLog(`${itemDef.name} を ${quantity}個 購入しました！`, 'shop_action');
      SoundManager.playSoundEffect(SoundType.SHOP_TRANSACTION);
      saveGameState();
    } else {
      addBattleLog(`${CURRENCY_SYMBOL}が足りません！`, 'system');
    }
  }, [pokeDollars, addItemToInventory, addBattleLog, saveGameState]);

  const handleSellItem = useCallback((itemId: string, quantity: number) => {
    const itemDef = ITEMS.find(i => i.id === itemId);
    if (!itemDef || !itemDef.sellPrice || (ownedItems[itemId] || 0) < quantity) return;

    const totalGain = itemDef.sellPrice * quantity;
    setPokeDollars(prev => prev + totalGain);
    removeItemFromInventory(itemId, quantity);
    addBattleLog(`${itemDef.name} を ${quantity}個 売却しました！ (+${totalGain}${CURRENCY_SYMBOL})`, 'shop_action');
    SoundManager.playSoundEffect(SoundType.SHOP_TRANSACTION);
    saveGameState();
  }, [ownedItems, removeItemFromInventory, addBattleLog, saveGameState]);

  const handleStartAdventure = useCallback((adventureOptionId: string) => {
    const option = ADVENTURE_OPTIONS.find(opt => opt.id === adventureOptionId);
    if (option && !adventure.isOnAdventure && !allPlayerPokemonFainted) {
      setAdventure({ isOnAdventure: true, startTime: Date.now(), message: null, selectedAdventureOptionId: adventureOptionId, currentAdventureDurationMs: option.durationMs });
      addBattleLog(`${option.name} に出発した！ (${formatNumber(option.durationMs / (60 * 1000))}分)`, 'system');
      SoundManager.playBGM(BgmType.MAIN_THEME); 
      saveGameState();
    }
  }, [adventure.isOnAdventure, allPlayerPokemonFainted, addBattleLog, saveGameState]);

  const handleClearAdventureMessage = useCallback(() => {
    setAdventure(prev => ({ ...prev, message: null }));
    SoundManager.playSoundEffect(SoundType.UI_BUTTON_CLICK);
  }, []);

  const handleMoveToNextArea = useCallback(() => {
    if (currentMapArea && currentMapArea.nextAreaId) {
        const nextArea = MAP_AREAS.find(area => area.id === currentMapArea.nextAreaId);
        if(nextArea) {
            setCurrentAreaId(currentMapArea.nextAreaId);
            setAreaProgress({ defeatCount: 0, bossDefeated: false }); 
            setCurrentEnemy(null); 
            addBattleLog(`${nextArea.name} に移動した！`, 'map_progress');
            SoundManager.playSoundEffect(SoundType.UI_BUTTON_CLICK);
            saveGameState();
        } else {
            addBattleLog('次のエリアが見つかりません。', 'system');
        }
    }
  }, [currentMapArea, addBattleLog, saveGameState]);

  const handleOpenItemSelectionModal = useCallback((item: Item) => {
    setItemToUse(item);
    setIsItemSelectionModalOpen(true);
    SoundManager.playSoundEffect(SoundType.UI_BUTTON_CLICK);
  }, []);

  const handleToggleAutoBattle = useCallback(() => {
    if (isAutoBattleUnlocked) {
      setIsAutoBattleActive(prev => {
        const newActiveState = !prev;
        addBattleLog(`オートバトルを${newActiveState ? '開始' : '停止'}しました。`, 'system');
        SoundManager.playSoundEffect(SoundType.UI_BUTTON_CLICK);
        return newActiveState;
      });
    }
  }, [isAutoBattleUnlocked, addBattleLog]);

  // --- Developer Panel Functions ---
  const dev_addPokeDollars = useCallback((amount: number) => setPokeDollars(p => p + amount), []);
  const dev_addItem = useCallback((itemId: string, quantity: number) => addItemToInventory(itemId, quantity), [addItemToInventory]);
  const dev_setPlayerPokemonLevel = useCallback((level: number) => {
    if (currentPlayerPokemonDetails) {
        const targetLevel = Math.max(1, Math.min(MAX_LEVEL, level));
        const basePokemon = POKEMONS.find(p => p.id === currentPlayerPokemonDetails.id);
        if(basePokemon) {
            const updatedDetails = initializePokemonDetails(basePokemon, targetLevel);
            setOwnedPokemonDetails(prev => ({ ...prev, [currentPlayerPokemonDetails.id]: { ...updatedDetails, experience: EXPERIENCE_FOR_LEVEL_UP[targetLevel-1] || 0 }}));
            addBattleLog(`${basePokemon.name}のレベルを${targetLevel}に設定しました。(開発)`, 'system');
        }
    }
  }, [currentPlayerPokemonDetails, addBattleLog]);
  const dev_addPlayerPokemonExperience = useCallback((experience: number) => {
    if (currentPlayerPokemonDetails) addExperienceAndLevelUp(currentPlayerPokemonDetails.id, experience);
  }, [currentPlayerPokemonDetails, addExperienceAndLevelUp]);
  const dev_moveToArea = useCallback((areaId: string) => {
    const areaExists = MAP_AREAS.find(a => a.id === areaId);
    if (areaExists) {
      setCurrentAreaId(areaId);
      setAreaProgress({ defeatCount: 0, bossDefeated: false });
      setCurrentEnemy(null);
      addBattleLog(`${areaExists.name} にワープしました。(開発)`, 'system');
    }
  }, [addBattleLog]);
  const dev_toggleDevMode = useCallback(() => setIsDeveloperMode(p => !p), []);


  // --- FARM FUNCTIONS ---
  const handlePlantSeed = useCallback((plotIndex: number, seedItemId: string) => {
    const seedItem = ITEMS.find(item => item.id === seedItemId);
    const berryIdToPlant = seedItem?.effect?.plantsBerryId;
    if (!seedItem || !berryIdToPlant || (ownedItems[seedItemId] || 0) <= 0) return;

    setFarmPlots(prevPlots => {
      const newPlots = [...prevPlots];
      if (newPlots[plotIndex] && !newPlots[plotIndex].plantedBerryId) {
        newPlots[plotIndex] = {
          plantedBerryId: berryIdToPlant,
          plantTime: Date.now(),
          growthStage: 1, 
          isHarvestable: false,
        };
        removeItemFromInventory(seedItemId, 1);
        addBattleLog(`${seedItem.name} をプロット ${plotIndex + 1} に植えた！`, 'farm_action');
        SoundManager.playSoundEffect(SoundType.FARM_ACTION);
        saveGameState();
      }
      return newPlots;
    });
  }, [ownedItems, removeItemFromInventory, addBattleLog, saveGameState]);

  const handleHarvestBerry = useCallback((plotIndex: number) => {
    setFarmPlots(prevPlots => {
      const newPlots = [...prevPlots];
      const plot = newPlots[plotIndex];
      if (plot && plot.isHarvestable && plot.plantedBerryId) {
        const berryData = BERRIES.find(b => b.id === plot.plantedBerryId);
        if (berryData) {
          const quantity = Math.floor(Math.random() * (berryData.harvestQuantityMax - berryData.harvestQuantityMin + 1)) + berryData.harvestQuantityMin;
          addItemToInventory(berryData.harvestItemId, quantity);
          addBattleLog(`${berryData.name} を ${quantity}個 収穫した！`, 'farm_action');
          SoundManager.playSoundEffect(SoundType.FARM_ACTION);
        }
        newPlots[plotIndex] = { plantedBerryId: null, plantTime: null, growthStage: 0, isHarvestable: false };
        saveGameState();
      }
      return newPlots;
    });
  }, [addItemToInventory, addBattleLog, saveGameState]);


  // --- useEffects ---
  useEffect(() => {
    const calculatedPds = calculatePDS();
    let basePds = calculatedPds;

    if (cheerBuff.isActive && cheerBuff.endTime && Date.now() < cheerBuff.endTime) {
      basePds *= cheerBuff.currentMultiplier;
    } else if (cheerBuff.isActive) {
      setCheerBuff(prev => ({ ...prev, isActive: false, baseActivatedTime: null }));
    }
    setPokeDollarsPerSecond(basePds);

    const intervalId = setInterval(() => {
      setPokeDollars(prev => prev + (basePds / (1000 / GAME_TICK_MS)));
    }, GAME_TICK_MS);

    return () => clearInterval(intervalId);
  }, [calculatePDS, cheerBuff, ownedPokemonDetails, ownedUpgrades]);

  useEffect(() => {
    let newMultiplier = INITIAL_CHEER_MULTIPLIER;
    let newDuration = INITIAL_CHEER_DURATION_MS;
    let newBaseClickIncome = INITIAL_BASE_CLICK_INCOME;
    let newClickBuffExtendMs = BASE_CLICK_BUFF_EXTEND_MS;

    for (const upgradeId in ownedUpgrades) {
      const upgradeDef = UPGRADES.find(u => u.id === upgradeId);
      const owned = ownedUpgrades[upgradeId];
      if (upgradeDef && owned) {
        if (upgradeDef.type === UpgradeType.CLICK_BOOST) newMultiplier += upgradeDef.effectValue * owned.level;
        if (upgradeDef.type === UpgradeType.CLICK_MULTIPLIER) newDuration += upgradeDef.effectValue * owned.level;
        if (upgradeDef.type === UpgradeType.CLICK_INCOME_BASE) newBaseClickIncome += upgradeDef.effectValue * owned.level;
        if (upgradeDef.type === UpgradeType.CLICK_BUFF_EXTENSION) newClickBuffExtendMs += upgradeDef.effectValue * owned.level;
      }
    }
    setCheerBuff(prev => ({ ...prev, currentMultiplier: newMultiplier, currentDurationMs: newDuration }));
    setBaseClickIncome(newBaseClickIncome);
    setClickBuffExtendMs(newClickBuffExtendMs);
  }, [ownedUpgrades]);


  useEffect(() => {
    if (adventure.isOnAdventure && adventure.startTime && adventure.currentAdventureDurationMs) {
      const checkAdventureEnd = () => {
        if (Date.now() >= (adventure.startTime! + adventure.currentAdventureDurationMs!)) {
          const option = ADVENTURE_OPTIONS.find(opt => opt.id === adventure.selectedAdventureOptionId);
          if (option) {
            let adventureMessage = `${option.name} から帰還した！`;
            const success = Math.random() < option.successRate;
            if (success) {
              SoundManager.playSoundEffect(SoundType.ADVENTURE_SUCCESS);
              const earnedPokeDollars = Math.floor(Math.random() * (option.rewards.pokeDollarsMax - option.rewards.pokeDollarsMin + 1)) + option.rewards.pokeDollarsMin;
              setPokeDollars(prev => prev + earnedPokeDollars);
              adventureMessage += ` ${formatNumber(earnedPokeDollars)}${CURRENCY_SYMBOL} を見つけた！`;
              if (option.rewards.experience > 0 && currentPlayerPokemonDetails && currentPlayerPokemonDetails.currentHp > 0) {
                 addExperienceAndLevelUp(ownedPokemonIds[currentPokemonIndex], option.rewards.experience);
                 adventureMessage += ` ${option.rewards.experience}EXP を獲得した！`;
              }
              option.rewards.items.forEach(itemDrop => {
                if (Math.random() < itemDrop.dropRate) {
                  const quantity = Math.floor(Math.random() * (itemDrop.quantityMax - itemDrop.quantityMin + 1)) + itemDrop.quantityMin;
                  addItemToInventory(itemDrop.itemId, quantity);
                  adventureMessage += ` ${ITEMS.find(i=>i.id===itemDrop.itemId)?.name} を ${quantity}個 見つけた！`;
                }
              });
            } else { 
              SoundManager.playSoundEffect(SoundType.ADVENTURE_FAIL);
              adventureMessage += ` ...しかし、何も見つからなかった...`;
              if (option.failureHpPenaltyPercentage > 0 && currentPlayerPokemonDetails && currentPlayerPokemonDetails.currentHp > 0) {
                const damage = Math.max(1, Math.floor(currentPlayerPokemonDetails.currentMaxHp * option.failureHpPenaltyPercentage));
                const playerOriginalId = ownedPokemonIds[currentPokemonIndex];
                setOwnedPokemonDetails(prev => {
                    const details = prev[playerOriginalId];
                    if(!details) return prev;
                    const newHp = Math.max(0, details.currentHp - damage);
                    adventureMessage += ` ${POKEMONS.find(p=>p.id===details.id)?.name} は ${damage} ダメージを受けた！`;
                    if (newHp === 0) {
                        adventureMessage += ` ${POKEMONS.find(p=>p.id===details.id)?.name} はひんしになった！`;
                    }
                    return { ...prev, [playerOriginalId]: { ...details, currentHp: newHp }};
                });
              }
            }
            setAdventure({ isOnAdventure: false, startTime: null, message: adventureMessage, selectedAdventureOptionId: null, currentAdventureDurationMs: null });
            saveGameState();
          }
        }
      };
      const intervalId = setInterval(checkAdventureEnd, 1000);
      return () => clearInterval(intervalId);
    }
  }, [adventure, addExperienceAndLevelUp, addItemToInventory, currentPlayerPokemonDetails, ownedPokemonIds, currentPokemonIndex, saveGameState]);

  useEffect(() => {
    const anyPokemonAlive = ownedPokemonIds.some(id => ownedPokemonDetails[id]?.currentHp > 0);
    if (!anyPokemonAlive && ownedPokemonIds.length > 0) {
      if(!allPlayerPokemonFainted) { 
        setAllPlayerPokemonFainted(true);
        addBattleLog('目の前が真っ暗になった！ ポケモンセンターへ行こう！', 'defeat');
        SoundManager.playSoundEffect(SoundType.POKEMON_FAINT, 1.2); 
        SoundManager.playBGM(BgmType.POKEMON_CENTER_THEME);
        if (currentEnemy) setCurrentEnemy(null); 
        setIsBattleProcessing(false); 
      }
    } else {
      setAllPlayerPokemonFainted(false);
    }
  }, [ownedPokemonDetails, ownedPokemonIds, addBattleLog, currentEnemy, allPlayerPokemonFainted]);

  useEffect(() => {
    let autoBattleTimer: NodeJS.Timeout | undefined;
    if (isAutoBattleActive && currentEnemy && currentPlayerPokemonDetails && currentPlayerPokemonDetails.currentHp > 0 && !isBattleProcessing && !allPlayerPokemonFainted && !evolvingPokemonVisualId) {
      autoBattleTimer = setTimeout(() => {
        const availableMoves = currentPlayerPokemonDetails.learnedMoves.filter(lm => lm.currentPP > 0);
        if (availableMoves.length > 0) {
          const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
          handlePlayerAttack(randomMove.moveId);
        } else {
          // Try tackle if no PP moves, ensure tackle exists or handle appropriately
          const tackleMove = currentPlayerPokemonDetails.learnedMoves.find(m => m.moveId === 'tackle') || POKEMONS.find(p => p.id === currentPlayerPokemonDetails.id)?.levelUpMoves.find(lum => lum.moveId === 'tackle');
          if (tackleMove) handlePlayerAttack('tackle'); 
          else addBattleLog('PPがある技がない！', 'system')
        }
      }, AUTO_BATTLE_INTERVAL_MS);
    }
    return () => clearTimeout(autoBattleTimer);
  }, [isAutoBattleActive, currentEnemy, currentPlayerPokemonDetails, isBattleProcessing, allPlayerPokemonFainted, handlePlayerAttack, evolvingPokemonVisualId, addBattleLog]);

  useEffect(() => {
    const targetSequence = ['SHIFT', 'D', 'D', 'D'];
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      let currentSequence = [...devKeySequence, key];
      if (currentSequence.length > targetSequence.length) {
        currentSequence.shift();
      }
      let match = true;
      if (currentSequence.length === targetSequence.length) {
        for (let i = 0; i < targetSequence.length; i++) {
          if (currentSequence[i] !== targetSequence[i]) {
            match = false; break;
          }
        }
        if (match) {
          setIsDeveloperMode(prev => {
            const newDevMode = !prev;
            addBattleLog(`開発者モードが${newDevMode ? '有効' : '無効'}になりました。`, 'system');
            return newDevMode;
          });
          currentSequence = []; 
        }
      }
      setDevKeySequence(currentSequence);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [devKeySequence, addBattleLog]);

  useEffect(() => {
    const farmInterval = setInterval(() => {
      setFarmPlots(prevPlots =>
        prevPlots.map(plot => {
          if (plot.plantedBerryId && plot.plantTime && !plot.isHarvestable) {
            const berryData = BERRIES.find(b => b.id === plot.plantedBerryId);
            if (berryData) {
              const elapsedTime = Date.now() - plot.plantTime;
              const progressRatio = elapsedTime / berryData.growthTimeMs;
              const currentGrowthStageBasedOnTime = Math.min(FARM_GROWTH_STAGES, Math.floor(progressRatio * FARM_GROWTH_STAGES) +1 );

              if (currentGrowthStageBasedOnTime >= FARM_GROWTH_STAGES) {
                return { ...plot, growthStage: FARM_GROWTH_STAGES, isHarvestable: true };
              }
              return { ...plot, growthStage: currentGrowthStageBasedOnTime };
            }
          }
          return plot;
        })
      );
    }, FARM_GROWTH_TICK_MS);
    return () => clearInterval(farmInterval);
  }, []);

  useEffect(() => {
    const autoSaveTimer = setInterval(saveGameState, AUTO_SAVE_INTERVAL_MS);
    return () => clearInterval(autoSaveTimer);
  }, [saveGameState]);

  useEffect(() => {
    const loadGameState = () => {
        const savedDataString = localStorage.getItem(SAVE_DATA_KEY);
        if (savedDataString) {
            try {
                const savedState = JSON.parse(savedDataString);
                setPokeDollars(savedState.pokeDollars || INITIAL_POKE_DOLLARS);
                setOwnedUpgrades(savedState.ownedUpgrades || {});
                const loadedOwnedPokemonIds = savedState.ownedPokemonIds && savedState.ownedPokemonIds.length > 0 ? savedState.ownedPokemonIds : [initialPlayerPokemonId];
                setOwnedPokemonIds(loadedOwnedPokemonIds);
                
                const loadedOwnedPokemonDetails = savedState.ownedPokemonDetails || {};
                const validatedDetails: Record<string, OwnedPokemonDetails> = {};
                loadedOwnedPokemonIds.forEach((id: string) => {
                    const detail = loadedOwnedPokemonDetails[id];
                    const baseData = POKEMONS.find(p => p.id === id);
                    if (detail && baseData) {
                        const initialized = initializePokemonDetails(baseData, detail.level || 1);
                        validatedDetails[id] = {
                            ...initialized, 
                            currentHp: Math.min(detail.currentHp ?? initialized.currentMaxHp, initialized.currentMaxHp),
                            experience: detail.experience || 0,
                            learnedMoves: detail.learnedMoves && detail.learnedMoves.length > 0 ? detail.learnedMoves : getInitialLearnedMoves(id),
                            statusCondition: detail.statusCondition || StatusCondition.NONE,
                            statusTurns: detail.statusTurns || 0,
                            confusionTurns: detail.confusionTurns || 0,
                            battleSpeedModifier: detail.statusCondition === StatusCondition.PARALYSIS ? PARALYSIS_SPEED_MODIFIER : 1.0,
                            battleTempStatModifiers: {}, 
                            currentAbility: detail.currentAbility || baseData.abilities?.[0] || Ability.NONE,
                            isFlashFireActive: false, 
                        };
                    } else if (baseData) { 
                        validatedDetails[id] = initializePokemonDetails(baseData, 1);
                    }
                });
                 if (Object.keys(validatedDetails).length === 0 && loadedOwnedPokemonIds.length > 0) { 
                    const firstPkmnData = POKEMONS.find(p => p.id === loadedOwnedPokemonIds[0]);
                     if (firstPkmnData) {
                         validatedDetails[firstPkmnData.id] = initializePokemonDetails(firstPkmnData, 1);
                     }
                 }
                setOwnedPokemonDetails(validatedDetails);

                setFirstCaughtAt(savedState.firstCaughtAt || { [initialPlayerPokemonId]: Date.now() });
                setCurrentPokemonIndex(savedState.currentPokemonIndex || 0);
                
                if (savedState.adventure) {
                    if (savedState.adventure.isOnAdventure && savedState.adventure.startTime && savedState.adventure.currentAdventureDurationMs) {
                        if (Date.now() < (savedState.adventure.startTime + savedState.adventure.currentAdventureDurationMs)) {
                            setAdventure(savedState.adventure);
                        } else { 
                           setAdventure({ isOnAdventure: false, startTime: null, message: "オフライン中に冒険が完了しました（結果は簡略化）。", selectedAdventureOptionId: null, currentAdventureDurationMs: null });
                        }
                    } else {
                        setAdventure(savedState.adventure);
                    }
                }

                if (savedState.cheerBuff) {
                    if (savedState.cheerBuff.isActive && savedState.cheerBuff.endTime && Date.now() < savedState.cheerBuff.endTime) {
                        setCheerBuff(savedState.cheerBuff);
                    } else {
                        setCheerBuff({ ...savedState.cheerBuff, isActive: false, baseActivatedTime: null });
                    }
                }
                setOwnedItems(savedState.ownedItems || INITIAL_OWNED_ITEMS);
                setCurrentAreaId(savedState.currentAreaId || INITIAL_AREA_ID);
                setAreaProgress(savedState.areaProgress || { defeatCount: 0 });
                setDefeatedGyms(savedState.defeatedGyms || {});
                setIsAutoBattleUnlocked(savedState.isAutoBattleUnlocked || false);
                setIsAutoBattleActive(false); 
                setFarmPlots(savedState.farmPlots || Array(INITIAL_FARM_PLOTS).fill(null).map(() => ({ plantedBerryId: null, plantTime: null, growthStage: 0, isHarvestable: false })));
                
                if (savedState.isMuted) {
                    SoundManager.forceMute(); 
                } else {
                    SoundManager.forceUnmute();
                }
                setIsMuted(savedState.isMuted ?? false);
                addBattleLog('ゲームデータをロードしました。', 'system');
            } catch (error) {
                console.error("セーブデータの解析に失敗:", error);
                addBattleLog('セーブデータの読み込みに失敗しました。新しいゲームを開始します。', 'system');
                localStorage.removeItem(SAVE_DATA_KEY); 
            }
        } else {
          addBattleLog('ポケクリッカークエストへようこそ！', 'system');
        }
    };
    loadGameState();
    SoundManager.preloadSounds();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
    if (!currentEnemy && !evolvingPokemonVisualId && !isBattleProcessing && !isFarmModalOpen && !isPokedexOpen && !isUpgradesShopOpen && !adventure.isOnAdventure && !allPlayerPokemonFainted) {
      spawnNewEnemy();
    }
  }, [currentEnemy, evolvingPokemonVisualId, isBattleProcessing, isFarmModalOpen, isPokedexOpen, isUpgradesShopOpen, adventure.isOnAdventure, allPlayerPokemonFainted, spawnNewEnemy]);

  const handleToggleMute = () => {
      const newMutedState = SoundManager.toggleMute();
      setIsMuted(newMutedState);
  }


  const currentDisplayedPokemon = POKEMONS.find(p => p.id === ownedPokemonIds[currentPokemonIndex]);
  const currentDisplayedPokemonDetails = currentDisplayedPokemon ? ownedPokemonDetails[currentDisplayedPokemon.id] : null;

  if (!currentDisplayedPokemon || !currentDisplayedPokemonDetails) {
    // This can happen briefly during initial load or if data is somehow corrupted
    // Attempt to set to the first Pokemon if available
    if (ownedPokemonIds.length > 0 && POKEMONS.find(p => p.id === ownedPokemonIds[0]) && ownedPokemonDetails[ownedPokemonIds[0]]) {
        setCurrentPokemonIndex(0);
        // The component will re-render, and this condition should not be met next time
        return <div className="p-4 text-center">ポケモン情報を再初期化中...</div>;
    }
    // If still no valid Pokemon, show error/loading
    return <div className="p-4 text-center">ポケモン情報をロード中... もしこのメッセージが消えない場合は、リロードしてください。</div>;
  }
  const currentMapAreaSafe = currentMapArea || MAP_AREAS[0];
  const areaIsCleared = currentMapAreaSafe.nextAreaId === null || 
    (currentMapAreaSafe.unlockConditionToNext.type === 'defeatCount' && areaProgress.defeatCount >= (currentMapAreaSafe.unlockConditionToNext.count || Infinity)) ||
    (currentMapAreaSafe.unlockConditionToNext.type === 'defeatBoss' && areaProgress.bossDefeated === true) ||
    (currentMapAreaSafe.isGym && !!defeatedGyms[currentMapAreaSafe.id]);


  return (
    <div className="game-container mx-auto p-1 md:p-2 max-w-5xl">
      <header className="flex justify-between items-center mb-1 md:mb-2">
        <h1 className="text-lg md:text-2xl font-bold text-yellow-600">ポケクリッカークエスト</h1>
        <div className="flex items-center space-x-1 md:space-x-2">
            <button onClick={() => { SoundManager.playSoundEffect(SoundType.UI_BUTTON_CLICK); setIsPokedexOpen(true); }} className="nes-button is-primary text-xs py-1 px-1 md:px-2">図鑑</button>
            <button onClick={() => { SoundManager.playSoundEffect(SoundType.UI_BUTTON_CLICK); setIsUpgradesShopOpen(true); }} className="nes-button is-success text-xs py-1 px-1 md:px-2">ショップ</button>
            <button onClick={() => { SoundManager.playSoundEffect(SoundType.UI_BUTTON_CLICK); setFarmPlots(prev => prev); setIsFarmModalOpen(true); }} className="nes-button text-xs py-1 px-1 md:px-2" style={{backgroundColor: '#90EE90', color: '#3A5F0B'}}>農園</button>
            <button onClick={handleToggleMute} className="nes-button is-error text-xs py-1 px-1 md:px-2">
                {isMuted ? 'ミュート中' : 'サウンドON'}
            </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-2">
        <div className="md:col-span-1">
          <PokemonDisplayArea
            pokemon={currentDisplayedPokemon}
            currentHp={currentDisplayedPokemonDetails.currentHp}
            maxHp={currentDisplayedPokemonDetails.currentMaxHp}
            level={currentDisplayedPokemonDetails.level}
            experience={currentDisplayedPokemonDetails.experience}
            experienceToNextLevel={EXPERIENCE_FOR_LEVEL_UP[currentDisplayedPokemonDetails.level] || Infinity}
            experienceForCurrentLevel={EXPERIENCE_FOR_LEVEL_UP[currentDisplayedPokemonDetails.level -1] || 0}
            isFainted={currentDisplayedPokemonDetails.currentHp <= 0}
            pokeDollars={pokeDollars}
            pokeDollarsPerSecond={pokeDollarsPerSecond}
            onPokemonCheer={handlePokemonCheer}
            ownedPokemonCount={ownedPokemonIds.length}
            currentPokemonDisplayIndex={currentPokemonIndex}
            cheerBuff={cheerBuff}
            allPlayerPokemonFainted={allPlayerPokemonFainted}
            pokemonTypes={currentDisplayedPokemon.types}
            pokemonTypeColors={POKEMON_TYPE_COLORS}
            damagePopups={damagePopups.filter(p => p.targetId === currentDisplayedPokemon?.id || (p.type === 'currency' && p.targetId === currentDisplayedPokemon?.id))}
            onPreviousPokemon={() => { setCurrentPokemonIndex(prev => (prev - 1 + ownedPokemonIds.length) % ownedPokemonIds.length); SoundManager.playSoundEffect(SoundType.UI_BUTTON_CLICK);}}
            onNextPokemon={() => { setCurrentPokemonIndex(prev => (prev + 1) % ownedPokemonIds.length); SoundManager.playSoundEffect(SoundType.UI_BUTTON_CLICK);}}
            canSwitchDisplayedPokemon={canSwitchDisplayedPokemon}
            evolvingPokemonVisualId={evolvingPokemonVisualId}
            battleTempStatModifiers={currentDisplayedPokemonDetails.battleTempStatModifiers}
            statusCondition={currentDisplayedPokemonDetails.statusCondition}
            confusionTurns={currentDisplayedPokemonDetails.confusionTurns}
            currentAbility={currentDisplayedPokemonDetails.currentAbility}
          />
        </div>

        <div className="md:col-span-1 flex flex-col space-y-1 md:space-y-2">
            <EnemyDisplay
                enemy={currentEnemy}
                onTryCatch={tryCatchPokemon}
                pokeBallCount={ownedItems['poke-ball'] || 0}
                canCatch={!isBattleProcessing && ownedPokemonIds.length < MAX_POKEMON_TO_OWN && !allPlayerPokemonFainted && !!currentEnemy && !currentEnemy.isGymLeader}
                pokemonTypeColors={POKEMON_TYPE_COLORS}
                damagePopups={damagePopups.filter(p => p.targetId === currentEnemy?.id)}
                battleTempStatModifiers={currentEnemy?.battleTempStatModifiers}
                statusCondition={currentEnemy?.statusCondition}
                confusionTurns={currentEnemy?.confusionTurns}
                currentAbility={currentEnemy?.currentAbility}
            />
            {currentEnemy && currentPlayerPokemonDetails && (
              <FightControls
                playerPokemon={currentPlayerPokemonDetails}
                onAttack={handlePlayerAttack}
                onSwitchPokemon={(index) => {
                  if (currentPlayerPokemonDetails.currentHp > 0) { 
                      addBattleLog(`${POKEMONS.find(p=>p.id===currentPlayerPokemonDetails.id)?.name}、戻れ！`, 'system');
                      setOwnedPokemonDetails(prev => ({...prev, [currentPlayerPokemonDetails.id]: {...prev[currentPlayerPokemonDetails.id], battleTempStatModifiers: {}, battleSpeedModifier: prev[currentPlayerPokemonDetails.id].statusCondition === StatusCondition.PARALYSIS ? PARALYSIS_SPEED_MODIFIER : 1.0, isFlashFireActive: false}})); 
                  }
                  setCurrentPokemonIndex(index);
                  setIsBattleProcessing(true); 
                  setTimeout(() => {
                      if(currentEnemy && currentEnemy.currentHp > 0 && !allPlayerPokemonFainted) handleEnemyAttack(); else setIsBattleProcessing(false);
                  }, 1000);
                  SoundManager.playSoundEffect(SoundType.UI_BUTTON_CLICK);
                }}
                onUseItem={() => { handleOpenItemSelectionModal(ITEMS[0]); 
                }}
                onRun={handleRunAttempt}
                disabled={isBattleProcessing || allPlayerPokemonFainted || !currentEnemy || currentPlayerPokemonDetails.currentHp <= 0}
                getMoveData={getMoveData}
                ownedPokemonDetailsList={ownedPokemonIds.map(id => ownedPokemonDetails[id])}
                currentPokemonIndex={currentPokemonIndex}
                isAutoBattleUnlocked={isAutoBattleUnlocked}
                isAutoBattleActive={isAutoBattleActive}
                onToggleAutoBattle={handleToggleAutoBattle}
              />
            )}
            {!currentEnemy && !evolvingPokemonVisualId && (
                 <AdventureControls
                    adventure={adventure}
                    onStartAdventure={handleStartAdventure}
                    onClearMessage={handleClearAdventureMessage}
                    allPlayerPokemonFainted={allPlayerPokemonFainted}
                    adventureOptions={ADVENTURE_OPTIONS}
                  />
            )}
        </div>

        <div className="md:col-span-1 flex flex-col space-y-1 md:space-y-2">
          <PokemonCenterControls
            onHealAllPokemon={healAllPokemon}
            canHeal={ownedPokemonIds.some(id => ownedPokemonDetails[id] && (ownedPokemonDetails[id].currentHp < ownedPokemonDetails[id].currentMaxHp || ownedPokemonDetails[id].learnedMoves.some(lm => lm.currentPP < (getMoveData(lm.moveId)?.pp || 0)) || ownedPokemonDetails[id].statusCondition !== StatusCondition.NONE || ownedPokemonDetails[id].confusionTurns > 0))}
            allPlayerPokemonFainted={allPlayerPokemonFainted}
          />
          <InventoryPanel
            items={ITEMS}
            ownedItems={ownedItems}
            onUseItem={handleOpenItemSelectionModal}
            allPlayerPokemonFainted={allPlayerPokemonFainted}
          />
           <MapDisplayArea
              currentArea={currentMapAreaSafe}
              areaProgress={areaProgress}
              onMoveToNextArea={handleMoveToNextArea}
              isCleared={areaIsCleared}
              isGymLeaderDefeated={currentMapAreaSafe.isGym && !!defeatedGyms[currentMapAreaSafe.id]}
          />
        </div>
      </div>

      <div className="mt-1 md:mt-2">
        <BattleLog logs={battleLogs} />
      </div>

      <PokedexModal
        isOpen={isPokedexOpen}
        onClose={() => { SoundManager.playSoundEffect(SoundType.UI_BUTTON_CLICK); setIsPokedexOpen(false); }}
        allPokemonData={POKEMONS}
        ownedPokemonDetails={ownedPokemonDetails}
        firstCaughtAt={firstCaughtAt}
        getMoveData={getMoveData}
        pokemonTypeColors={POKEMON_TYPE_COLORS}
      />
      <ShopModalWrapper
        isOpen={isUpgradesShopOpen}
        onClose={() => { SoundManager.playSoundEffect(SoundType.UI_BUTTON_CLICK); setIsUpgradesShopOpen(false); }}
        title="フレンドリィショップ"
      >
        <UpgradesPanel
            upgrades={UPGRADES}
            ownedUpgrades={ownedUpgrades}
            pokeDollars={pokeDollars}
            onBuyUpgrade={handleBuyUpgrade}
            calculateUpgradeCost={calculateUpgradeCost}
            allPlayerPokemonFainted={allPlayerPokemonFainted}
            items={ITEMS}
            onBuyItem={handleBuyItem}
            onSellItem={handleSellItem}
            ownedItems={ownedItems}
        />
      </ShopModalWrapper>

      {itemToUse && (
        <PokemonSelectionModal
            isOpen={isItemSelectionModalOpen}
            onClose={handleCloseItemSelectionModal}
            item={itemToUse}
            ownedPokemonDetails={ownedPokemonDetails}
            allPokemonData={POKEMONS}
            onSelectPokemon={handleUseItemOnPokemon}
        />
      )}
      <FarmModal
        isOpen={isFarmModalOpen}
        onClose={() => { SoundManager.playSoundEffect(SoundType.UI_BUTTON_CLICK); setIsFarmModalOpen(false); }}
        farmPlots={farmPlots}
        ownedItems={ownedItems}
        allBerries={BERRIES}
        allItems={ITEMS}
        onPlantSeed={handlePlantSeed}
        onHarvestBerry={handleHarvestBerry}
        allPlayerPokemonFainted={allPlayerPokemonFainted}
      />

      {isDeveloperMode && (
        <DeveloperPanel
            allPokemonData={POKEMONS}
            allItems={ITEMS}
            allMapAreas={MAP_AREAS}
            currentPokemonId={currentDisplayedPokemon?.id || ""}
            onAddPokeDollars={dev_addPokeDollars}
            onAddItem={dev_addItem}
            onSetPokemonLevel={dev_setPlayerPokemonLevel}
            onAddPokemonExperience={dev_addPlayerPokemonExperience}
            onMoveToArea={dev_moveToArea}
            onHealAll={healAllPokemon}
            onToggleDevMode={dev_toggleDevMode}
        />
      )}
    </div>
  );
};

export default App;
