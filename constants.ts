/**
 * constants.ts
 *
 * このファイルは、アプリケーション全体で使用される「定数」を定義しています。
 * 定数とは、プログラムの実行中に値が変わらないデータのことです。
 * 例えば、ゲームの初期設定値、ポケモンの基本情報、アップグレードの性能などが含まれます。
 * これらを一箇所にまとめておくことで、管理がしやすくなり、変更も容易になります。
 */
import { PokemonData, UpgradeDefinition, UpgradeType, Item, ItemCategory, WildPokemonDefinitionInArea, PokemonType, Move, MoveCategory, MapArea, AdventureOption, BerryData, BaseStats, StatName, StatusCondition, Ability, AbilityData } from './types'; // 型定義をインポート

// --- ゲームの基本設定 ---
export const INITIAL_POKE_DOLLARS = 0; // ゲーム開始時の初期ポケドル
export const CURRENCY_SYMBOL = 'ポケドル'; // ゲーム内通貨のシンボル（表示用）
export const MAX_LEARNED_MOVES = 4; // ポケモンが覚えられる技の最大数

// --- 応援システム関連の定数 ---
export const INITIAL_CHEER_MULTIPLIER = 1.5; // 応援バフの初期倍率 (例: 1.5倍)
export const INITIAL_CHEER_DURATION_MS = 10000; // 応援バフの初期持続時間 (ミリ秒単位、例: 10000ms = 10秒)
export const INITIAL_BASE_CLICK_INCOME = 1; // クリックごとの基本ポケドル獲得量の初期値
export const BASE_CLICK_BUFF_EXTEND_MS = 250; // クリックによる応援バフの基本延長時間 (0.25秒)
export const MAX_TOTAL_BUFF_DURATION_MS_ADDITION = 5000; // 応援バフの最大延長許容時間 (元の持続時間に加えられる最大時間、5秒)


// --- 戦闘関連の定数 ---
export const BASE_CRITICAL_HIT_CHANCE = 0.0625; // 約6.25% (1/16)
export const CRITICAL_HIT_MULTIPLIER = 1.5; // クリティカルヒット時のダメージ倍率 (原作は1.5または2)
export const AUTO_BATTLE_INTERVAL_MS = 2000; // オートバトル時の技使用間隔
export const MAX_STAT_RANK = 6; // 能力ランクの最大変動値 (±6)
export const STAT_RANK_MULTIPLIERS: Record<number, number> = {
  [-6]: 2 / 8, [-5]: 2 / 7, [-4]: 2 / 6, [-3]: 2 / 5, [-2]: 2 / 4, [-1]: 2 / 3,
  0: 1,
  1: 3 / 2, 2: 4 / 2, 3: 5 / 2, 4: 6 / 2, 5: 7 / 2, 6: 8 / 2,
};
export const STAT_RANK_DISPLAY_THRESHOLD = 2; // この値以上/以下のランク変動で矢印2つ表示

// --- 状態異常関連の定数 ---
export const STATUS_DAMAGE_FRACTION = 1 / 16; // どく・やけどのターン終了時ダメージ (最大HPに対する割合)
export const PARALYSIS_CHANCE_TO_SKIP_TURN = 0.25; // まひで行動不能になる確率 (25%)
export const PARALYSIS_SPEED_MODIFIER = 0.5; // まひ時のすばやさ補正 (原作は1/4や1/2の時期あり)
export const BURN_ATTACK_MODIFIER = 0.5; // やけど時の物理攻撃力補正
export const MIN_SLEEP_TURNS = 1;
export const MAX_SLEEP_TURNS = 3;
export const MIN_CONFUSION_TURNS = 2;
export const MAX_CONFUSION_TURNS = 5;
export const CONFUSION_SELF_ATTACK_CHANCE = 0.33; // 約33% (原作は時期により異なる、50%のことも)
export const CONFUSION_SELF_ATTACK_POWER = 40; // こんらん自傷ダメージの威力


// --- レベルシステム関連の定数 ---
export const MAX_LEVEL = 100; // ポケモンの最大レベル
const experienceToLevelUp: number[] = [0]; // レベル1は0
for (let level = 1; level < MAX_LEVEL; level++) {
    // Simple formula: level^3. Adjust as needed for game balance.
    // Common formula: Fast: (4 * n^3) / 5, Medium Fast: n^3, Medium Slow: (6/5 * n^3) - (15 * n^2) + (100 * n) - 140, Slow: (5 * n^3) / 4
    const expNeeded = Math.floor(Math.pow(level, 3) * 1.0); // Medium Fast like
    experienceToLevelUp.push(expNeeded);
}
export { experienceToLevelUp as EXPERIENCE_FOR_LEVEL_UP };

export const PDS_INCREASE_PER_LEVEL_FACTOR = 0.05; // 1レベルごとにPDSが元の5%増加する (例)


// --- ポケモンタイプ定義 ---
export const POKEMON_TYPE_COLORS: Record<PokemonType, string> = {
    [PokemonType.NORMAL]: '#A8A77A',
    [PokemonType.FIRE]: '#EE8130',
    [PokemonType.WATER]: '#6390F0',
    [PokemonType.GRASS]: '#7AC74C',
    [PokemonType.ELECTRIC]: '#F7D02C',
    [PokemonType.ICE]: '#96D9D6',
    [PokemonType.FIGHTING]: '#C22E28',
    [PokemonType.POISON]: '#A33EA1',
    [PokemonType.GROUND]: '#E2BF65',
    [PokemonType.FLYING]: '#A98FF3',
    [PokemonType.PSYCHIC]: '#F95587',
    [PokemonType.BUG]: '#A6B91A',
    [PokemonType.ROCK]: '#B6A136',
    [PokemonType.GHOST]: '#735797',
    [PokemonType.DRAGON]: '#6F35FC',
    [PokemonType.DARK]: '#705746',
    [PokemonType.STEEL]: '#B7B7CE',
    [PokemonType.FAIRY]: '#D685AD',
};

export const STATUS_CONDITION_COLORS: Record<StatusCondition, string> = {
    [StatusCondition.NONE]: '#000000', // Or some default
    [StatusCondition.POISON]: '#A33EA1', // Purple
    [StatusCondition.PARALYSIS]: '#F7D02C', // Yellow
    [StatusCondition.BURN]: '#EE8130', // Orange
    [StatusCondition.SLEEP]: '#A8A77A', // Grayish Normal color
    [StatusCondition.CONFUSION]: '#F95587', // Psychic Pink
};
export const STATUS_CONDITION_TEXT: Record<StatusCondition, string> = {
    [StatusCondition.NONE]: 'じょうたいなし',
    [StatusCondition.POISON]: 'どく',
    [StatusCondition.PARALYSIS]: 'まひ',
    [StatusCondition.BURN]: 'やけど',
    [StatusCondition.SLEEP]: 'ねむり',
    [StatusCondition.CONFUSION]: 'こんらん',
};

// --- 技データ ---
export const MOVES: Move[] = [
  { id: 'tackle', name: 'たいあたり', type: PokemonType.NORMAL, category: MoveCategory.PHYSICAL, power: 40, accuracy: 100, pp: 35, description: 'からだ ごと とっしんして こうげきする。', isContactMove: true},
  { id: 'growl', name: 'なきごえ', type: PokemonType.NORMAL, category: MoveCategory.STATUS, power: null, accuracy: 100, pp: 40, description: 'かわいらしく なきさけび あいての こうげきを さげさせる。', statChanges: [{ stat: 'attack', change: -1, target: 'opponent'}] },
  { id: 'scratch', name: 'ひっかく', type: PokemonType.NORMAL, category: MoveCategory.PHYSICAL, power: 40, accuracy: 100, pp: 35, description: 'するどいツメで あいてを ひっかいて こうげきする。', isContactMove: true},
  { id: 'ember', name: 'ひのこ', type: PokemonType.FIRE, category: MoveCategory.SPECIAL, power: 40, accuracy: 100, pp: 25, description: 'ちいさな ほのおを とばして こうげきする。やけど させることが ある。', statusEffect: { condition: StatusCondition.BURN, chance: 0.1, target: 'opponent' } },
  { id: 'water-gun', name: 'みずでっぽう', type: PokemonType.WATER, category: MoveCategory.SPECIAL, power: 40, accuracy: 100, pp: 25, description: 'みずを いきおいよく はっしゃして こうげきする。'},
  { id: 'vine-whip', name: 'つるのムチ', type: PokemonType.GRASS, category: MoveCategory.PHYSICAL, power: 45, accuracy: 100, pp: 25, description: 'しなやかな ムチで あいてを はたいて こうげきする。', isContactMove: true},
  { id: 'thundershock', name: 'でんきショック', type: PokemonType.ELECTRIC, category: MoveCategory.SPECIAL, power: 40, accuracy: 100, pp: 30, description: 'でんげきを あいてに はなって こうげきする。まひ させることが ある。', statusEffect: { condition: StatusCondition.PARALYSIS, chance: 0.1, target: 'opponent' } },
  { id: 'quick-attack', name: 'でんこうせっか', type: PokemonType.NORMAL, category: MoveCategory.PHYSICAL, power: 40, accuracy: 100, pp: 30, priority: 1, description: 'すばやい うごきで あいての ふところにとびこみ こうげきする。かならず せんせい こうげき できる。', isContactMove: true},
  { id: 'razor-leaf', name: 'はっぱカッター', type: PokemonType.GRASS, category: MoveCategory.PHYSICAL, power: 55, accuracy: 95, pp: 25, description: 'するどい はっぱを とばして こうげきする。きゅうしょに あたりやすい。'},
  { id: 'flamethrower', name: 'かえんほうしゃ', type: PokemonType.FIRE, category: MoveCategory.SPECIAL, power: 90, accuracy: 100, pp: 15, description: 'はげしい ほのおを あいてに あびせて こうげきする。やけど させることが ある。', statusEffect: { condition: StatusCondition.BURN, chance: 0.1, target: 'opponent' } },
  { id: 'hydro-pump', name: 'ハイドロポンプ', type: PokemonType.WATER, category: MoveCategory.SPECIAL, power: 110, accuracy: 80, pp: 5, description: 'みずを ものすごい いきおいではっしゃして こうげきする。'},
  { id: 'thunderbolt', name: '10まんボルト', type: PokemonType.ELECTRIC, category: MoveCategory.SPECIAL, power: 90, accuracy: 100, pp: 15, description: 'つよい でんげきを あいてに あびせて こうげきする。まひ させることが ある。', statusEffect: { condition: StatusCondition.PARALYSIS, chance: 0.1, target: 'opponent' } },
  { id: 'headbutt', name: 'ずつき', type: PokemonType.NORMAL, category: MoveCategory.PHYSICAL, power: 70, accuracy: 100, pp: 15, description: 'こうげきと はんどうで あたまが クラクラ するが あいてを ひるませる ことが ある。', isContactMove: true},
  { id: 'sleep-powder', name: 'ねむりごな', type: PokemonType.GRASS, category: MoveCategory.STATUS, power: null, accuracy: 75, pp: 15, description: 'ねむりを さそう こなを あいてに あびせる。', statusEffect: { condition: StatusCondition.SLEEP, chance: 1.0, target: 'opponent', turnsMin: MIN_SLEEP_TURNS, turnsMax: MAX_SLEEP_TURNS } },
  { id: 'poison-powder', name: 'どくのこな', type: PokemonType.POISON, category: MoveCategory.STATUS, power: null, accuracy: 75, pp: 35, description: 'どくのこなを あいてに あびせて どく じょうたいに する。', statusEffect: { condition: StatusCondition.POISON, chance: 1.0, target: 'opponent' } },
  { id: 'rock-throw', name: 'いわおとし', type: PokemonType.ROCK, category: MoveCategory.PHYSICAL, power: 50, accuracy: 90, pp: 15, description: 'ちいさな いわを なげつけて こうげきする。'},
  { id: 'bite', name: 'かみつく', type: PokemonType.DARK, category: MoveCategory.PHYSICAL, power: 60, accuracy: 100, pp: 25, description: 'するどいキバで あいてに かみついて こうげきする。ひるませる ことが ある。', isContactMove: true},
  { id: 'peck', name: 'つつく', type: PokemonType.FLYING, category: MoveCategory.PHYSICAL, power: 35, accuracy: 100, pp: 35, description: 'するどい くちばしで あいてを つついて こうげきする。', isContactMove: true},
  { id: 'absorb', name: 'すいとる', type: PokemonType.GRASS, category: MoveCategory.SPECIAL, power: 20, accuracy: 100, pp: 25, description: 'こうげきと どうじに あたえた ダメージの はんぶん HPを かいふくする。'},
  { id: 'rock-slide', name: 'いわなだれ', type: PokemonType.ROCK, category: MoveCategory.PHYSICAL, power: 75, accuracy: 90, pp: 10, description: 'おおきな いわを おおく なげつけて こうげきする。あいてを ひるませる ことが ある。'},
  { id: 'supersonic', name: 'ちょうおんぱ', type: PokemonType.NORMAL, category: MoveCategory.STATUS, power: null, accuracy: 55, pp: 20, description: 'とくしゅな おんぱで あいてを こんらん させる。', statusEffect: { condition: StatusCondition.CONFUSION, chance: 1.0, target: 'opponent', turnsMin: MIN_CONFUSION_TURNS, turnsMax: MAX_CONFUSION_TURNS } },
  { id: 'thunder-wave', name: 'でんじは', type: PokemonType.ELECTRIC, category: MoveCategory.STATUS, power: null, accuracy: 90, pp: 20, description: 'よわい でんきをながして あいてを まひさせる。', statusEffect: { condition: StatusCondition.PARALYSIS, chance: 1.0, target: 'opponent' } },
  { id: 'flame-wheel', name: 'かえんぐるま', type: PokemonType.FIRE, category: MoveCategory.PHYSICAL, power: 60, accuracy: 100, pp: 25, description: 'からだに ほのおを まといとっしんする。やけど させることも。', statusEffect: { condition: StatusCondition.BURN, chance: 0.1, target: 'opponent' }, isContactMove: true},
  { id: 'water-pulse', name: 'みずのはどう', type: PokemonType.WATER, category: MoveCategory.SPECIAL, power: 60, accuracy: 100, pp: 20, description: 'みずの しんどうで こうげき。こんらん させることも。', statusEffect: { condition: StatusCondition.CONFUSION, chance: 0.2, target: 'opponent' } },
  { id: 'swords-dance', name: 'つるぎのまい', type: PokemonType.NORMAL, category: MoveCategory.STATUS, power: null, accuracy: null, pp: 20, description: 'たたかいの まえに おどって きあいを たかめる。じぶんの こうげきを グーンと あげる。', statChanges: [{ stat: 'attack', change: 2, target: 'self' }] },
  { id: 'barrier', name: 'バリアー', type: PokemonType.PSYCHIC, category: MoveCategory.STATUS, power: null, accuracy: null, pp: 20, description: 'ふしぎな かべを つくりだし じぶんの ぼうぎょを グーンと あげる。', statChanges: [{ stat: 'defense', change: 2, target: 'self' }] },
  { id: 'agility', name: 'こうそくいどう', type: PokemonType.PSYCHIC, category: MoveCategory.STATUS, power: null, accuracy: null, pp: 30, description: 'からだを けいかいにして すばやさを グーンと あげる。', statChanges: [{ stat: 'speed', change: 2, target: 'self' }] },
  { id: 'screech', name: 'いやなおと', type: PokemonType.NORMAL, category: MoveCategory.STATUS, power: null, accuracy: 85, pp: 40, description: 'ものすごい ふかいな おとを だして あいての ぼうぎょを グーンと さげる。', statChanges: [{ stat: 'defense', change: -2, target: 'opponent' }] },
  { id: 'will-o-wisp', name: 'おにび', type: PokemonType.FIRE, category: MoveCategory.STATUS, power: null, accuracy: 85, pp: 15, description: 'あやしい ほのおを あいてに あびせて やけど じょうたいに する。', statusEffect: { condition: StatusCondition.BURN, chance: 1.0, target: 'opponent' }},
  { id: 'hypnosis', name: 'さいみんじゅつ', type: PokemonType.PSYCHIC, category: MoveCategory.STATUS, power: null, accuracy: 60, pp: 20, description: 'あいてを ふかく ねむらせる さいみんじゅつをかける。', statusEffect: { condition: StatusCondition.SLEEP, chance: 1.0, target: 'opponent', turnsMin: MIN_SLEEP_TURNS, turnsMax: MAX_SLEEP_TURNS }}
];

// --- タイプ相性表 (攻撃タイプ -> 防御タイプ -> 倍率) ---
export const TYPE_CHART: Record<PokemonType, Partial<Record<PokemonType, number>>> = {
  [PokemonType.NORMAL]: { [PokemonType.ROCK]: 0.5, [PokemonType.GHOST]: 0, [PokemonType.STEEL]: 0.5 },
  [PokemonType.FIRE]: { [PokemonType.FIRE]: 0.5, [PokemonType.WATER]: 0.5, [PokemonType.GRASS]: 2, [PokemonType.ICE]: 2, [PokemonType.BUG]: 2, [PokemonType.ROCK]: 0.5, [PokemonType.DRAGON]: 0.5, [PokemonType.STEEL]: 2 },
  [PokemonType.WATER]: { [PokemonType.FIRE]: 2, [PokemonType.WATER]: 0.5, [PokemonType.GRASS]: 0.5, [PokemonType.GROUND]: 2, [PokemonType.ROCK]: 2, [PokemonType.DRAGON]: 0.5 },
  [PokemonType.GRASS]: { [PokemonType.FIRE]: 0.5, [PokemonType.WATER]: 2, [PokemonType.GRASS]: 0.5, [PokemonType.POISON]: 0.5, [PokemonType.GROUND]: 2, [PokemonType.FLYING]: 0.5, [PokemonType.BUG]: 0.5, [PokemonType.ROCK]: 2, [PokemonType.DRAGON]: 0.5, [PokemonType.STEEL]: 0.5 },
  [PokemonType.ELECTRIC]: { [PokemonType.WATER]: 2, [PokemonType.GRASS]: 0.5, [PokemonType.ELECTRIC]: 0.5, [PokemonType.GROUND]: 0, [PokemonType.FLYING]: 2, [PokemonType.DRAGON]: 0.5 },
  [PokemonType.ICE]: { [PokemonType.FIRE]: 0.5, [PokemonType.WATER]: 0.5, [PokemonType.GRASS]: 2, [PokemonType.ICE]: 0.5, [PokemonType.GROUND]: 2, [PokemonType.FLYING]: 2, [PokemonType.DRAGON]: 2, [PokemonType.STEEL]: 0.5 },
  [PokemonType.FIGHTING]: { [PokemonType.NORMAL]: 2, [PokemonType.ICE]: 2, [PokemonType.POISON]: 0.5, [PokemonType.FLYING]: 0.5, [PokemonType.PSYCHIC]: 0.5, [PokemonType.BUG]: 0.5, [PokemonType.ROCK]: 2, [PokemonType.GHOST]: 0, [PokemonType.DARK]: 2, [PokemonType.STEEL]: 2, [PokemonType.FAIRY]: 0.5 },
  [PokemonType.POISON]: { [PokemonType.GRASS]: 2, [PokemonType.POISON]: 0.5, [PokemonType.GROUND]: 0.5, [PokemonType.ROCK]: 0.5, [PokemonType.GHOST]: 0.5, [PokemonType.STEEL]: 0, [PokemonType.FAIRY]: 2 },
  [PokemonType.GROUND]: { [PokemonType.FIRE]: 2, [PokemonType.GRASS]: 0.5, [PokemonType.ELECTRIC]: 2, [PokemonType.POISON]: 2, [PokemonType.FLYING]: 0, [PokemonType.BUG]: 0.5, [PokemonType.ROCK]: 2, [PokemonType.STEEL]: 2 },
  [PokemonType.FLYING]: { [PokemonType.GRASS]: 2, [PokemonType.ELECTRIC]: 0.5, [PokemonType.FIGHTING]: 2, [PokemonType.BUG]: 2, [PokemonType.ROCK]: 0.5, [PokemonType.STEEL]: 0.5 },
  [PokemonType.PSYCHIC]: { [PokemonType.FIGHTING]: 2, [PokemonType.POISON]: 2, [PokemonType.PSYCHIC]: 0.5, [PokemonType.DARK]: 0, [PokemonType.STEEL]: 0.5 },
  [PokemonType.BUG]: { [PokemonType.FIRE]: 0.5, [PokemonType.GRASS]: 2, [PokemonType.FIGHTING]: 0.5, [PokemonType.POISON]: 0.5, [PokemonType.FLYING]: 0.5, [PokemonType.PSYCHIC]: 2, [PokemonType.GHOST]: 0.5, [PokemonType.DARK]: 2, [PokemonType.STEEL]: 0.5, [PokemonType.FAIRY]: 0.5 },
  [PokemonType.ROCK]: { [PokemonType.FIRE]: 2, [PokemonType.ICE]: 2, [PokemonType.FIGHTING]: 0.5, [PokemonType.GROUND]: 0.5, [PokemonType.FLYING]: 2, [PokemonType.BUG]: 2, [PokemonType.STEEL]: 0.5 },
  [PokemonType.GHOST]: { [PokemonType.NORMAL]: 0, [PokemonType.PSYCHIC]: 2, [PokemonType.GHOST]: 2, [PokemonType.DARK]: 0.5 },
  [PokemonType.DRAGON]: { [PokemonType.DRAGON]: 2, [PokemonType.STEEL]: 0.5, [PokemonType.FAIRY]: 0 },
  [PokemonType.DARK]: { [PokemonType.FIGHTING]: 0.5, [PokemonType.PSYCHIC]: 2, [PokemonType.GHOST]: 2, [PokemonType.DARK]: 0.5, [PokemonType.FAIRY]: 0.5 },
  [PokemonType.STEEL]: { [PokemonType.FIRE]: 0.5, [PokemonType.WATER]: 0.5, [PokemonType.ELECTRIC]: 0.5, [PokemonType.ICE]: 2, [PokemonType.ROCK]: 2, [PokemonType.STEEL]: 0.5, [PokemonType.FAIRY]: 2 },
  [PokemonType.FAIRY]: { [PokemonType.FIRE]: 0.5, [PokemonType.FIGHTING]: 2, [PokemonType.POISON]: 0.5, [PokemonType.DRAGON]: 2, [PokemonType.DARK]: 2, [PokemonType.STEEL]: 0.5 },
};


// --- アイテム関連の定数 ---
export const ITEMS: Item[] = [
  { id: 'poke-ball', name: 'モンスターボール', description: '野生のポケモンを捕獲するためのボール。', icon: '🔴', category: ItemCategory.POKEBALL, maxStack: 99, buyPrice: 200, sellPrice: 100 },
  { id: 'super-ball', name: 'スーパーボール', description: 'モンスターボールより捕まえやすくなった、ちょっといいボール。', icon: '🔵', category: ItemCategory.POKEBALL, maxStack: 99, buyPrice: 600, sellPrice: 300 },
  { id: 'hyper-ball', name: 'ハイパーボール', description: 'スーパーボールよりさらに捕まえやすくなった、すごくいいボール。', icon: '🟡', category: ItemCategory.POKEBALL, maxStack: 99, buyPrice: 1200, sellPrice: 600 },
  { id: 'potion', name: 'キズぐすり', description: 'ポケモンのHPを20回復する。', icon: '🧪', category: ItemCategory.MEDICINE, effect: { type: 'heal_hp_flat', value: 20 }, maxStack: 99, buyPrice: 300, sellPrice: 150 },
  { id: 'good-potion', name: 'いいキズぐすり', description: 'ポケモンのHPを50回復する。', icon: '🧪✨', category: ItemCategory.MEDICINE, effect: { type: 'heal_hp_flat', value: 50 }, maxStack: 99, buyPrice: 700, sellPrice: 350 },
  { id: 'super-potion', name: 'すごいキズぐすり', description: 'ポケモンのHPを120回復する。', icon: '🧪🌟', category: ItemCategory.MEDICINE, effect: { type: 'heal_hp_flat', value: 120 }, maxStack: 99, buyPrice: 1200, sellPrice: 600 },
  { id: 'max-potion', name: 'まんたんのくすり', description: 'ポケモンのHPを全回復する。', icon: '🧪💯', category: ItemCategory.MEDICINE, effect: { type: 'heal_hp_flat', value: 9999 }, maxStack: 99, buyPrice: 2500, sellPrice: 1250 },
  { id: 'revive', name: 'げんきのかけら', description: 'ひんし状態のポケモンをHP半分で復活させる。(効果は未実装)', icon: '💖', category: ItemCategory.MEDICINE, effect: { type: 'revive' }, maxStack: 99, buyPrice: 1500, sellPrice: 750 },
  { id: 'plus-power', name: 'プラスパワー', description: '戦闘中、ポケモンのこうげきをあげる。(効果は未実装)', icon: '⚔️', category: ItemCategory.BATTLE, maxStack: 99, buyPrice: 550, sellPrice: 275 },
  { id: 'defender', name: 'ディフェンダー', description: '戦闘中、ポケモンのぼうぎょをあげる。(効果は未実装)', icon: '🛡️', category: ItemCategory.BATTLE, maxStack: 99, buyPrice: 550, sellPrice: 275 },
  { id: 'rare-candy', name: 'ふしぎなアメ', description: 'ポケモンのけいけんちを250ふやす。', icon: '🍬', category: ItemCategory.GENERAL, effect: { type: 'exp_gain', value: 250 }, maxStack: 99, sellPrice: 2400 },
  {
    id: 'thunder-stone',
    name: 'かみなりのいし',
    description: 'とくていの ポケモンを しんかさせる ふしぎな いし。',
    icon: '⚡️',
    category: ItemCategory.EVOLUTION_STONE,
    effect: { type: 'evolve', requiredPokemonId: 'pikachu', evolvesToPokemonId: 'raichu' },
    maxStack: 99,
    buyPrice: 3000,
    sellPrice: 1500,
  },
  {
    id: 'boulder-badge',
    name: 'ボルダーバッジ',
    description: 'ニビジムのタケシに勝利した証。',
    icon: '🔘',
    category: ItemCategory.GYM_BADGE,
    maxStack: 1,
    badgeImageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/boulder-badge.png'
  },
  { id: 'nugget', name: 'きんのたま', description: '純金のかたまり。ショップで高く売れる。', icon: '💰', category: ItemCategory.VALUABLE, maxStack: 99, sellPrice: 5000 },
  { id: 'oran-berry-seed', name: 'オレンのタネ', description: 'オレンのみが育つタネ。農園に植えられる。', icon: '🌰', category: ItemCategory.SEED, effect: { type: 'plant_berry', plantsBerryId: 'oran-berry' }, maxStack: 99, buyPrice: 50, sellPrice: 25 },
  { id: 'oran-berry', name: 'オレンのみ', description: 'ポケモンのHPを少し回復する。', icon: '🍊', category: ItemCategory.BERRY, effect: { type: 'heal_hp_flat', value: 10 }, maxStack: 99, sellPrice: 10 },
  { id: 'pecha-berry-seed', name: 'モモンのタネ', description: 'モモンのみが育つタネ。農園に植えられる。', icon: '🌰', category: ItemCategory.SEED, effect: { type: 'plant_berry', plantsBerryId: 'pecha-berry' }, maxStack: 99, buyPrice: 60, sellPrice: 30 },
  { id: 'pecha-berry', name: 'モモンのみ', description: 'ポケモンのどくを治す。', icon: '🍑', category: ItemCategory.BERRY, effect: { type: 'cure_status', conditionToCure: StatusCondition.POISON }, maxStack: 99, sellPrice: 15 },
  { id: 'cheri-berry-seed', name: 'チーゴのタネ', description: 'チーゴのみが育つタネ。農園に植えられる。', icon: '🌰', category: ItemCategory.SEED, effect: { type: 'plant_berry', plantsBerryId: 'cheri-berry' }, maxStack: 99, buyPrice: 70, sellPrice: 35 },
  { id: 'cheri-berry', name: 'チーゴのみ', description: 'ポケモンのまひを治す。', icon: '🍒', category: ItemCategory.BERRY, effect: { type: 'cure_status', conditionToCure: StatusCondition.PARALYSIS }, maxStack: 99, sellPrice: 20 },
  { id: 'antidote', name: 'どくけし', description: 'ポケモンのどく状態を治す。', icon: '🩹', category: ItemCategory.MEDICINE, effect: { type: 'cure_status', conditionToCure: StatusCondition.POISON }, buyPrice: 100, sellPrice: 50 },
  { id: 'paralyze-heal', name: 'まひなおし', description: 'ポケモンのまひ状態を治す。', icon: '🩹', category: ItemCategory.MEDICINE, effect: { type: 'cure_status', conditionToCure: StatusCondition.PARALYSIS }, buyPrice: 200, sellPrice: 100 },
  { id: 'burn-heal', name: 'やけどなおし', description: 'ポケモンのやけど状態を治す。', icon: '🩹', category: ItemCategory.MEDICINE, effect: { type: 'cure_status', conditionToCure: StatusCondition.BURN }, buyPrice: 250, sellPrice: 125 },
  { id: 'awakening', name: 'ねむけざまし', description: 'ポケモンのねむり状態を治す。', icon: '🩹', category: ItemCategory.MEDICINE, effect: { type: 'cure_status', conditionToCure: StatusCondition.SLEEP }, buyPrice: 250, sellPrice: 125 },
  { id: 'full-heal', name: 'なんでもなおし', description: 'ポケモンのすべての状態異常を治す。', icon: '🌟🩹', category: ItemCategory.MEDICINE, effect: { type: 'cure_all_major_status' }, buyPrice: 600, sellPrice: 300 },
  // わざマシン
  { id: 'tm01-headbutt', name: 'TM01 ずつき', description: 'ノーマルタイプの物理技「ずつき」を覚えさせる。', icon: '💿', category: ItemCategory.TM, effect: { type: 'teach_move', moveId: 'headbutt'}, buyPrice: 2000, sellPrice: 1000 },
  { id: 'tm13-ice-beam', name: 'TM13 れいとうビーム', description: 'こおりタイプの特殊技「れいとうビーム」を覚えさせる。', icon: '💿', category: ItemCategory.TM, effect: { type: 'teach_move', moveId: 'ice-beam', compatiblePokemonTypes: [PokemonType.WATER, PokemonType.ICE]}, buyPrice: 4000, sellPrice: 2000 },
  { id: 'tm24-thunderbolt', name: 'TM24 10まんボルト', description: 'でんきタイプの特殊技「10まんボルト」を覚えさせる。', icon: '💿', category: ItemCategory.TM, effect: { type: 'teach_move', moveId: 'thunderbolt', compatiblePokemonTypes: [PokemonType.ELECTRIC]}, buyPrice: 4000, sellPrice: 2000 },
  { id: 'tm26-earthquake', name: 'TM26 じしん', description: 'じめんタイプの物理技「じしん」を覚えさせる。', icon: '💿', category: ItemCategory.TM, effect: { type: 'teach_move', moveId: 'earthquake'}, buyPrice: 4000, sellPrice: 2000 },
  { id: 'tm35-flamethrower', name: 'TM35 かえんほうしゃ', description: 'ほのおタイプの特殊技「かえんほうしゃ」を覚えさせる。', icon: '💿', category: ItemCategory.TM, effect: { type: 'teach_move', moveId: 'flamethrower', compatiblePokemonTypes: [PokemonType.FIRE]}, buyPrice: 4000, sellPrice: 2000 },
];
export const INITIAL_OWNED_ITEMS = { 'poke-ball': 10, 'potion': 5, 'oran-berry-seed': 3 };

// --- 捕獲関連の定数 ---
export const MIN_CATCH_CHANCE = 0.01;
export const MAX_CATCH_CHANCE = 0.95;
export const CATCH_CHANCE_HP_FACTOR = 2.5;


// --- ポケモンデータ ---
export const POKEMONS: PokemonData[] = [
  {
    id: 'pidgey', name: 'ポッポ', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/16.png',
    types: [PokemonType.NORMAL, PokemonType.FLYING], baseAutoIncomePerSecond: 0.05,
    description: 'おとなしい せいかくで あまり あらそいを このまない。くさむらに かくれて ちいさな むしなどを とる。',
    baseStats: { hp: 40, attack: 45, defense: 40, specialAttack: 35, specialDefense: 35, speed: 56 },
    levelUpMoves: [ { level: 1, moveId: 'tackle' }, { level: 5, moveId: 'quick-attack' }, { level: 9, moveId: 'peck' }, { level: 15, moveId: 'agility' } ],
    catchRateBonus: 1.2, abilities: [Ability.NONE], // Keen Eye or Tangled Feet
  },
  {
    id: 'rattata', name: 'コラッタ', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/19.png',
    types: [PokemonType.NORMAL], baseAutoIncomePerSecond: 0.07,
    description: 'キバは ながくて するどい。いっしょう のびつづけるので こんじょうを けずって みじかくする。',
    baseStats: { hp: 30, attack: 56, defense: 35, specialAttack: 25, specialDefense: 35, speed: 72 },
    levelUpMoves: [ { level: 1, moveId: 'tackle' }, { level: 1, moveId: 'growl' }, { level: 4, moveId: 'quick-attack' }, { level: 7, moveId: 'bite' } ],
    catchRateBonus: 1.3, abilities: [Ability.NONE], // Guts or Run Away
  },
  {
    id: 'zubat', name: 'ズバット', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/41.png',
    types: [PokemonType.POISON, PokemonType.FLYING], baseAutoIncomePerSecond: 0.06,
    description: 'くらい ばしょを このむ。めが たいか しているため ちょうおんぱを だして まわりのようすを さぐる。',
    baseStats: { hp: 40, attack: 45, defense: 35, specialAttack: 30, specialDefense: 40, speed: 55 },
    levelUpMoves: [ { level: 1, moveId: 'absorb' }, { level: 5, moveId: 'supersonic' }, { level: 10, moveId: 'bite' } ],
    catchRateBonus: 1.1, abilities: [Ability.NONE], // Inner Focus
  },
  {
    id: 'pikachu', name: 'ピカチュウ', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    types: [PokemonType.ELECTRIC], baseAutoIncomePerSecond: 0.1,
    description: 'ほっぺの りょうがわに ちいさい でんきぶくろを もつ。ピンチのときに ほうでんする。',
    baseStats: { hp: 35, attack: 55, defense: 40, specialAttack: 50, specialDefense: 50, speed: 90 },
    levelUpMoves: [ { level: 1, moveId: 'thundershock' }, { level: 1, moveId: 'growl' }, { level: 5, moveId: 'quick-attack' }, { level: 8, moveId: 'thunder-wave' }, { level: 12, moveId: 'agility' }, { level: 18, moveId: 'thunderbolt' } ],
    catchRateBonus: 1.0, abilities: [Ability.STATIC],
    evolution: { toPokemonId: 'raichu', condition: { itemId: 'thunder-stone' } }
  },
  {
    id: 'raichu', name: 'ライチュウ', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/26.png',
    types: [PokemonType.ELECTRIC], baseAutoIncomePerSecond: 0.5,
    description: 'でんげきの いりょくは 10まんボルトに たっすることもあり ヘタにさわると インドぞうでも きぜつする。',
    baseStats: { hp: 60, attack: 90, defense: 55, specialAttack: 90, specialDefense: 80, speed: 110 },
    levelUpMoves: [ { level: 1, moveId: 'thundershock' }, { level: 1, moveId: 'growl' }, { level: 1, moveId: 'quick-attack' }, { level: 1, moveId: 'thunderbolt' }, { level: 1, moveId: 'thunder-wave' } ],
    catchRateBonus: 0.7, abilities: [Ability.STATIC],
  },
  {
    id: 'bulbasaur', name: 'フシギダネ', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
    types: [PokemonType.GRASS, PokemonType.POISON], baseAutoIncomePerSecond: 0.2,
    description: 'うまれたときから せなかに ふしぎな タネが うえてあって からだとともに そだつという。',
    baseStats: { hp: 45, attack: 49, defense: 49, specialAttack: 65, specialDefense: 65, speed: 45 },
    levelUpMoves: [ { level: 1, moveId: 'tackle' }, { level: 1, moveId: 'growl' }, { level: 7, moveId: 'vine-whip' }, { level: 10, moveId: 'poison-powder' }, { level: 13, moveId: 'sleep-powder' }, { level: 15, moveId: 'razor-leaf' } ],
    catchRateBonus: 1.1, abilities: [Ability.OVERGROW],
    evolution: { toPokemonId: 'ivysaur', condition: { level: 16 } }
  },
  {
    id: 'ivysaur', name: 'フシギソウ', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png',
    types: [PokemonType.GRASS, PokemonType.POISON], baseAutoIncomePerSecond: 0.4,
    description: 'せなかのつぼみを ささえるため あしこしが つよくなる。ひなたにいる じかんが ながくなってきたら たいりんの はながさく まえぶれ。',
    baseStats: { hp: 60, attack: 62, defense: 63, specialAttack: 80, specialDefense: 80, speed: 60 },
    levelUpMoves: [ { level: 1, moveId: 'tackle' }, { level: 1, moveId: 'growl' }, { level: 1, moveId: 'vine-whip' }, { level: 13, moveId: 'sleep-powder' }, { level: 15, moveId: 'razor-leaf' }, { level: 20, moveId: 'poison-powder' } ],
    catchRateBonus: 0.8, abilities: [Ability.OVERGROW],
  },
  {
    id: 'charmander', name: 'ヒトカゲ', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
    types: [PokemonType.FIRE], baseAutoIncomePerSecond: 0.15,
    description: 'うまれたときから しっぽに ほのおが ともっている。ほのおが きえたとき その いのちは おわって しまう。',
    baseStats: { hp: 39, attack: 52, defense: 43, specialAttack: 60, specialDefense: 50, speed: 65 },
    levelUpMoves: [ { level: 1, moveId: 'scratch' }, { level: 1, moveId: 'growl' }, { level: 7, moveId: 'ember' }, { level: 10, moveId: 'flame-wheel' }, { level: 13, moveId: 'bite' }, { level: 19, moveId: 'flamethrower' }, { level: 22, moveId: 'will-o-wisp' } ],
    catchRateBonus: 1.0, abilities: [Ability.BLAZE],
    evolution: { toPokemonId: 'charmeleon', condition: { level: 16 } }
  },
  {
    id: 'charmeleon', name: 'リザード', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/5.png',
    types: [PokemonType.FIRE], baseAutoIncomePerSecond: 0.35,
    description: 'するどいツメで あいてを たたきのめす。つよい あいてに であうと こうふん しっぽのさきの ほのおが あおじろく もえあがる。',
    baseStats: { hp: 58, attack: 64, defense: 58, specialAttack: 80, specialDefense: 65, speed: 80 },
    levelUpMoves: [ { level: 1, moveId: 'scratch' }, { level: 1, moveId: 'growl' }, { level: 1, moveId: 'ember' }, { level: 13, moveId: 'bite' }, { level: 1, moveId: 'flamethrower' }, { level: 19, moveId: 'flame-wheel' } ],
    catchRateBonus: 0.75, abilities: [Ability.BLAZE],
  },
  {
    id: 'squirtle', name: 'ゼニガメ', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png',
    types: [PokemonType.WATER], baseAutoIncomePerSecond: 0.18,
    description: 'うまれたての ゼニガメの こうらは やわらかいが すぐに だんりょくのある カチカチの こうらに なる。',
    baseStats: { hp: 44, attack: 48, defense: 65, specialAttack: 50, specialDefense: 64, speed: 43 },
    levelUpMoves: [ { level: 1, moveId: 'tackle' }, { level: 1, moveId: 'growl' }, { level: 7, moveId: 'water-gun' }, { level: 10, moveId: 'water-pulse' }, { level: 13, moveId: 'bite' }, { level: 19, moveId: 'hydro-pump' } ],
    catchRateBonus: 1.0, abilities: [Ability.TORRENT],
    evolution: { toPokemonId: 'wartortle', condition: { level: 16 } }
  },
  {
    id: 'wartortle', name: 'カメール', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/8.png',
    types: [PokemonType.WATER], baseAutoIncomePerSecond: 0.38,
    description: 'ふさふさの しっぽは ながいきした あかしで ポケモンの あいだでは にんきがある。こうらに かくれて みをまもる。',
    baseStats: { hp: 59, attack: 63, defense: 80, specialAttack: 65, specialDefense: 80, speed: 58 },
    levelUpMoves: [ { level: 1, moveId: 'tackle' }, { level: 1, moveId: 'growl' }, { level: 1, moveId: 'water-gun' }, { level: 13, moveId: 'bite' }, { level: 1, moveId: 'hydro-pump' }, { level: 20, moveId: 'water-pulse' }, { level: 22, moveId: 'barrier'} ],
    catchRateBonus: 0.78, abilities: [Ability.TORRENT],
  },
  {
    id: 'eevee', name: 'イーブイ', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png',
    types: [PokemonType.NORMAL], baseAutoIncomePerSecond: 0.25,
    description: 'ふきそくな いでんしを もつ。さまざまな しんかの かのうせいを ひめている ポケモン。',
    baseStats: { hp: 55, attack: 55, defense: 50, specialAttack: 45, specialDefense: 65, speed: 55 },
    levelUpMoves: [ { level: 1, moveId: 'tackle' }, { level: 1, moveId: 'growl' }, { level: 8, moveId: 'quick-attack' }, { level: 16, moveId: 'bite' }, { level: 20, moveId: 'headbutt' } ],
    catchRateBonus: 0.9, abilities: [Ability.NONE], // Adaptability or Run Away
  },
  {
    id: 'snorlax', name: 'カビゴン', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png',
    types: [PokemonType.NORMAL], baseAutoIncomePerSecond: 0.3,
    description: 'たべて ねるだけの まいにち。おおきな おなかは なわばりにも なっているらしい。',
    baseStats: { hp: 160, attack: 110, defense: 65, specialAttack: 65, specialDefense: 110, speed: 30 },
    levelUpMoves: [ { level: 1, moveId: 'tackle' }, { level: 6, moveId: 'headbutt' } ],
    catchRateBonus: 0.7, abilities: [Ability.NONE], // Immunity or Thick Fat
  },
  {
    id: 'geodude', name: 'イシツブテ', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/74.png',
    types: [PokemonType.ROCK, PokemonType.GROUND], baseAutoIncomePerSecond: 0.08,
    description: 'てあしを ひっこめて まるくなると いわと みわけが つかない。やまみちで ふんづけてしまうことも。',
    baseStats: { hp: 40, attack: 80, defense: 100, specialAttack: 30, specialDefense: 30, speed: 20 },
    levelUpMoves: [ { level: 1, moveId: 'tackle' }, { level: 10, moveId: 'rock-throw' }, { level: 15, moveId: 'screech' } ],
    catchRateBonus: 1.0, abilities: [Ability.NONE], // Rock Head or Sturdy
  },
  {
    id: 'onix', name: 'イワーク', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/95.png',
    types: [PokemonType.ROCK, PokemonType.GROUND], baseAutoIncomePerSecond: 0.4,
    description: 'おおきな からだを くねらせ ちちゅうを すごい スピードで ほりすすむ。その おとは とおくの まちまで ひびく。',
    baseStats: { hp: 35, attack: 45, defense: 160, specialAttack: 30, specialDefense: 45, speed: 70 },
    levelUpMoves: [ { level: 1, moveId: 'tackle' }, { level: 1, moveId: 'rock-throw' }, { level: 10, moveId: 'headbutt' }, { level: 15, moveId: 'rock-slide' }, {level: 19, moveId: 'screech'} ],
    catchRateBonus: 0.4, abilities: [Ability.NONE], // Rock Head or Sturdy
  },
  {
    id: 'magikarp', name: 'コイキング', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/129.png',
    types: [PokemonType.WATER], baseAutoIncomePerSecond: 0.01,
    description: 'ちからも スピードも ほとんどダメ。せかいで いちばん よわいと いわれる ポケモンだ。',
    baseStats: { hp: 20, attack: 10, defense: 55, specialAttack: 15, specialDefense: 20, speed: 80 },
    levelUpMoves: [ { level: 15, moveId: 'tackle' } ],
    catchRateBonus: 1.5, abilities: [Ability.NONE], // Swift Swim
    evolution: { toPokemonId: 'gyarados', condition: { level: 20 }}
  },
  {
    id: 'gyarados', name: 'ギャラドス', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/130.png',
    types: [PokemonType.WATER, PokemonType.FLYING], baseAutoIncomePerSecond: 1.5,
    description: 'コイキングから しんかした とき のうさいぼうの そしきが くみかわるため きょうぼうに なった。',
    baseStats: { hp: 95, attack: 125, defense: 79, specialAttack: 60, specialDefense: 100, speed: 81 },
    levelUpMoves: [ { level: 1, moveId: 'bite' }, { level: 20, moveId: 'hydro-pump' }, {level: 25, moveId: 'swords-dance'} ],
    catchRateBonus: 0.3, abilities: [Ability.INTIMIDATE],
  },
  {
    id: 'gengar', name: 'ゲンガー', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png',
    types: [PokemonType.GHOST, PokemonType.POISON], baseAutoIncomePerSecond: 0.8,
    description: 'へやの すみに できた かげが すこしずつ こちらに ちかづいてきたら それは ゲンガーかも しれない。',
    baseStats: { hp: 60, attack: 65, defense: 60, specialAttack: 130, specialDefense: 75, speed: 110 },
    levelUpMoves: [ {level: 1, moveId: 'hypnosis'}, {level: 1, moveId: 'lick'} ], // Placeholder, Lick is not defined
    catchRateBonus: 0.4, abilities: [Ability.LEVITATE], // Cursed Body now, Levitate was original in Gen3-6
  },
  {
    id: 'gastly', name: 'ゴース', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/92.png',
    types: [PokemonType.GHOST, PokemonType.POISON], baseAutoIncomePerSecond: 0.3,
    description: 'うすい ガスじょうの せいめいたい。ガスに つつまれると インドぞうも 2びょうで たおれる。',
    baseStats: { hp: 30, attack: 35, defense: 30, specialAttack: 100, specialDefense: 35, speed: 80 },
    levelUpMoves: [ {level: 1, moveId: 'hypnosis'}, {level: 1, moveId: 'lick'} ],
    catchRateBonus: 0.8, abilities: [Ability.LEVITATE],
  },
  {
    id: 'lucario', name: 'ルカリオ', imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/448.png',
    types: [PokemonType.FIGHTING, PokemonType.STEEL], baseAutoIncomePerSecond: 0.9,
    description: 'はどうと よばれる なみの エネルギーを あやつり すべての ものを かんじとる ちからを もつ。',
    baseStats: { hp: 70, attack: 110, defense: 70, specialAttack: 115, specialDefense: 70, speed: 90 },
    levelUpMoves: [ { level: 1, moveId: 'quick-attack' }, {level: 1, moveId: 'swords-dance'} ],
    catchRateBonus: 0.4, abilities: [Ability.NONE], // Steadfast or Inner Focus
  }
];

// --- マップエリアデータ ---
export const MAP_AREAS: MapArea[] = [
  {
    id: 'tokiwa-forest',
    name: 'トキワのもり',
    description: 'しずかで きもちのいい もり。よわい ポケモンが おおく すんでいる。',
    enemyDefinitions: [
      { pokemonId: 'pidgey', level: 2, spawnWeight: 60, baseCatchRate: 0.4 },
      { pokemonId: 'rattata', level: 2, spawnWeight: 70, baseCatchRate: 0.45 },
      { pokemonId: 'pidgey', level: 3, spawnWeight: 30, baseCatchRate: 0.35 },
      { pokemonId: 'rattata', level: 3, spawnWeight: 40, baseCatchRate: 0.4 },
      { pokemonId: 'bulbasaur', level: 4, spawnWeight: 10, baseCatchRate: 0.2, drops: [{ itemId: 'potion', dropRate: 0.1, quantityMin: 1, quantityMax: 1 }] },
    ],
    defaultRewardPokeDollars: 5,
    defaultGivesExperience: 8,
    unlockConditionToNext: { type: 'defeatCount', count: 10 },
    nextAreaId: 'route-3',
  },
  {
    id: 'route-3',
    name: '３ばんどうろ',
    description: 'トレーナーたちが しのぎを けずる どうろ。すこし つよい ポケモンも でてくる。',
    enemyDefinitions: [
      { pokemonId: 'pidgey', level: 5, spawnWeight: 40, baseCatchRate: 0.3 },
      { pokemonId: 'rattata', level: 4, spawnWeight: 30, baseCatchRate: 0.35 },
      { pokemonId: 'pikachu', level: 6, spawnWeight: 20, baseCatchRate: 0.2, drops: [{ itemId: 'poke-ball', dropRate: 0.1, quantityMin: 1, quantityMax: 1 }] },
      { pokemonId: 'charmander', level: 6, spawnWeight: 15, baseCatchRate: 0.18 },
      { pokemonId: 'squirtle', level: 6, spawnWeight: 15, baseCatchRate: 0.18 },
      { pokemonId: 'geodude', level: 7, spawnWeight: 25, baseCatchRate: 0.25, isBoss: true, rewardPokeDollars: 30, givesExperience: 25, drops: [{ itemId: 'super-ball', dropRate: 0.2, quantityMin: 1, quantityMax: 1}] },
    ],
    defaultRewardPokeDollars: 15,
    defaultGivesExperience: 20,
    unlockConditionToNext: { type: 'defeatBoss', bossPokemonId: 'geodude' },
    nextAreaId: 'pewter-city-gym',
  },
  {
    id: 'pewter-city-gym',
    name: 'ニビシティジム',
    description: 'いし ポケモンの つかいて タケシが まつジム。かてば ボルダーバッジが もらえるぞ！',
    isGym: true,
    enemyDefinitions: [
      { pokemonId: 'geodude', level: 8, spawnWeight: 80, baseCatchRate: 0.25, rewardPokeDollars: 20, givesExperience: 25 },
      {
        pokemonId: 'onix', level: 12, spawnWeight: 20, isGymLeader: true, isBoss: true,
        moves: ['tackle', 'rock-throw', 'headbutt', 'screech'], rewardPokeDollars: 150, givesExperience: 100,
        baseCatchRate: 0.05,
        drops: [ { itemId: 'boulder-badge', dropRate: 1.0, quantityMin: 1, quantityMax: 1 }, { itemId: 'super-potion', dropRate: 0.5, quantityMin: 1, quantityMax: 1 } ]
      },
    ],
    defaultRewardPokeDollars: 30,
    defaultGivesExperience: 40,
    unlockConditionToNext: { type: 'defeatBoss', bossPokemonId: 'onix' },
    nextAreaId: 'mt-moon-entrance',
  },
  {
    id: 'mt-moon-entrance',
    name: 'オツキミやま 入り口',
    description: 'ほらあなポケモンが でてくると うわさの やまの ふもと。',
    enemyDefinitions: [
      { pokemonId: 'geodude', level: 8, spawnWeight: 50, baseCatchRate: 0.2 },
      { pokemonId: 'zubat', level: 7, spawnWeight: 60, baseCatchRate: 0.22 },
      { pokemonId: 'eevee', level: 9, spawnWeight: 20, baseCatchRate: 0.1, drops: [{ itemId: 'good-potion', dropRate: 0.1, quantityMin: 1, quantityMax: 1 }] },
      { pokemonId: 'snorlax', level: 15, spawnWeight: 5, baseCatchRate: 0.05, isBoss: true, rewardPokeDollars: 200, givesExperience: 150, drops: [{itemId: 'rare-candy', dropRate: 0.1, quantityMin: 1, quantityMax:1}] },
    ],
    defaultRewardPokeDollars: 25,
    defaultGivesExperience: 30,
    unlockConditionToNext: { type: 'defeatCount', count: 15 },
    nextAreaId: null, // TODO: Add more areas
  },
];

// --- 冒険オプションデータ ---
export const ADVENTURE_OPTIONS: AdventureOption[] = [
  {
    id: 'short_expedition', name: '近場の探索 (5分)', description: '手軽な探索。基本的なアイテムや少量の経験値が見つかるかも。',
    durationMs: 5 * 60 * 1000, successRate: 0.8,
    rewards: { pokeDollarsMin: 50, pokeDollarsMax: 150, experience: 50, items: [ { itemId: 'poke-ball', dropRate: 0.3, quantityMin: 1, quantityMax: 2 }, { itemId: 'potion', dropRate: 0.2, quantityMin: 1, quantityMax: 1 } ] },
    failureHpPenaltyPercentage: 0.05,
  },
  {
    id: 'cave_exploration', name: '洞窟探検 (15分)', description: '少し危険な洞窟。良いアイテムや中程度の経験値が期待できる。',
    durationMs: 15 * 60 * 1000, successRate: 0.65,
    rewards: { pokeDollarsMin: 200, pokeDollarsMax: 500, experience: 150, items: [ { itemId: 'super-ball', dropRate: 0.25, quantityMin: 1, quantityMax: 2 }, { itemId: 'good-potion', dropRate: 0.2, quantityMin: 1, quantityMax: 1 }, { itemId: 'nugget', dropRate: 0.05, quantityMin: 1, quantityMax: 1 } ] },
    failureHpPenaltyPercentage: 0.15,
  },
  {
    id: 'ruins_investigation', name: '古代遺跡調査 (30分)', description: '謎多き古代遺跡。非常にレアなアイテムや大量の経験値が得られるかもしれないが、危険も大きい。',
    durationMs: 30 * 60 * 1000, successRate: 0.4,
    rewards: { pokeDollarsMin: 500, pokeDollarsMax: 1200, experience: 400, items: [ { itemId: 'hyper-ball', dropRate: 0.15, quantityMin: 1, quantityMax: 1 }, { itemId: 'super-potion', dropRate: 0.1, quantityMin: 1, quantityMax: 1 }, { itemId: 'rare-candy', dropRate: 0.1, quantityMin: 1, quantityMax: 1 }, { itemId: 'nugget', dropRate: 0.1, quantityMin: 1, quantityMax: 2 } ] },
    failureHpPenaltyPercentage: 0.25,
  },
];

// --- 農園関連の定数 ---
export const INITIAL_FARM_PLOTS = 3;
export const MAX_FARM_PLOTS = 9;
export const FARM_GROWTH_STAGES = 5; // Example: 0:Empty, 1:Seed, 2:Sprout, 3:Growing, 4:Flower, 5:Berry
export const FARM_GROWTH_TICK_MS = 5000; // Check growth every 5 seconds

export const BERRIES: BerryData[] = [
  {
    id: 'oran-berry', name: 'オレンのみ', description: 'ポケモンのHPを少し回復する。',
    growthTimeMs: 1 * 60 * 1000, harvestItemId: 'oran-berry', harvestQuantityMin: 2, harvestQuantityMax: 4,
    seedItemId: 'oran-berry-seed', growthStageImages: ['🌰','🌱','🌿','🌸','🍊'], growthStageNames: ["タネ", "芽生え", "成長中", "開花", "実り"], icon: '🍊',
  },
  {
    id: 'pecha-berry', name: 'モモンのみ', description: 'ポケモンのどくを治す。',
    growthTimeMs: 1.5 * 60 * 1000, harvestItemId: 'pecha-berry', harvestQuantityMin: 1, harvestQuantityMax: 3,
    seedItemId: 'pecha-berry-seed', growthStageImages: ['🌰','🌱','🌿','🌸','🍑'], growthStageNames: ["タネ", "芽生え", "成長中", "開花", "実り"], icon: '🍑',
  },
  {
    id: 'cheri-berry', name: 'チーゴのみ', description: 'ポケモンのまひを治す。',
    growthTimeMs: 2 * 60 * 1000, harvestItemId: 'cheri-berry', harvestQuantityMin: 1, harvestQuantityMax: 2,
    seedItemId: 'cheri-berry-seed', growthStageImages: ['🌰','🌱','🌿','🌸','🍒'], growthStageNames: ["タネ", "芽生え", "成長中", "開花", "実り"], icon: '🍒',
  },
];


// --- アップグレードデータ ---
export const UPGRADES: UpgradeDefinition[] = [
  { id: 'cheerPower', name: '応援パワー', description: `クリックごとの基本${CURRENCY_SYMBOL}獲得量が少しアップします。`, initialCost: 20, costMultiplier: 1.25, effectValue: 1, type: UpgradeType.CLICK_INCOME_BASE, icon: '💪' },
  { id: 'advancedCheerPower', name: '全力応援パワー', description: `クリックごとの基本${CURRENCY_SYMBOL}獲得量がアップします。`, initialCost: 200, costMultiplier: 1.35, effectValue: 5, type: UpgradeType.CLICK_INCOME_BASE, icon: '🔥' },
  { id: 'cheerMike', name: '応援マイク', description: '応援によるPDSブースト倍率が少しアップします。', initialCost: 10, costMultiplier: 1.15, effectValue: 0.05, type: UpgradeType.CLICK_BOOST, icon: '📣' },
  { id: 'cheerMegaphone', name: '応援メガホン', description: '応援によるPDSブースト倍率がアップします。', initialCost: 100, costMultiplier: 1.2, effectValue: 0.2, type: UpgradeType.CLICK_BOOST, icon: '🚩' },
  { id: 'cheerRhythm', name: '応援リズム', description: '応援の基本持続時間が延長されます。', initialCost: 250, costMultiplier: 1.5, effectValue: 2000, type: UpgradeType.CLICK_MULTIPLIER, icon: '🗣️', maxLevel: 10 },
  { id: 'cheerEncore', name: '応援アンコール', description: 'クリックによる応援バフの延長時間が少し増えます。', initialCost: 300, costMultiplier: 1.4, effectValue: 50, type: UpgradeType.CLICK_BUFF_EXTENSION, icon: '🎶', maxLevel: 10 },
  { id: 'berryFarmPDS', name: 'きのみエキス', description: '時間経過で自動的にポケドルを生成します。', initialCost: 50, costMultiplier: 1.25, effectValue: 0.5, type: UpgradeType.AUTO_INCOME_BOOST, icon: '🍓' },
  { id: 'trainerGuidance', name: 'トレーナーの指導', description: '自動的にポケドルを大幅に生成します。', initialCost: 500, costMultiplier: 1.3, effectValue: 2.5, type: UpgradeType.AUTO_INCOME_BOOST, icon: '🧑‍🏫' },
  { id: 'expShareNetwork', name: 'けいけんちシェアネット', description: '自動ポケドル生成量が15%増加します。', initialCost: 1000, costMultiplier: 1.8, effectValue: 1.15, type: UpgradeType.AUTO_INCOME_MULTIPLIER, icon: '🚀' },
  { id: 'autoBattleChip', name: 'オートバトルAIチップ', description: 'ポケモンが自動で技を使って戦ってくれるようになります。', initialCost: 5000, costMultiplier: 1, effectValue: 0, type: UpgradeType.FEATURE_UNLOCK, icon: '🤖', maxLevel: 1 },
  { id: 'farmPlotExpansion', name: '農園拡張キット', description: `農園にきのみを植えるプロットを1つ増やします。(最大${MAX_FARM_PLOTS}個まで)`, initialCost: 1000, costMultiplier: 2.5, effectValue: 1, type: UpgradeType.FARM_PLOT_INCREASE, icon: '🏞️', maxLevel: MAX_FARM_PLOTS - INITIAL_FARM_PLOTS },
];

// --- 特性データ ---
export const ABILITIES_DATA: Record<Ability, AbilityData> = {
    [Ability.NONE]: { name: 'なし', description: 'とくべつな こうかは ない。' },
    [Ability.INTIMIDATE]: { name: 'いかく', description: '場に出た時、相手の「こうげき」を1段階下げる。' },
    [Ability.STATIC]: { name: 'せいでんき', description: '接触技を受けると、30%の確率で相手を「まひ」状態にする。' },
    [Ability.LEVITATE]: { name: 'ふゆう', description: 'じめんタイプの技を受けない。' },
    [Ability.MOXIE]: { name: 'じしんかじょう', description: '相手を倒すと、自身の「こうげき」が1段階上がる。' },
    [Ability.FLASH_FIRE]: { name: 'もらいび', description: 'ほのおタイプの技を受けると無効化し、自身のほのお技の威力を1.5倍にする。' },
    [Ability.OVERGROW]: { name: 'しんりょく', description: 'HPが1/3以下の時、くさタイプの技の威力が1.5倍になる。' },
    [Ability.BLAZE]: { name: 'もうか', description: 'HPが1/3以下の時、ほのおタイプの技の威力が1.5倍になる。' },
    [Ability.TORRENT]: { name: 'げきりゅう', description: 'HPが1/3以下の時、みずタイプの技の威力が1.5倍になる。' },
};

// --- ゲームの動作関連 ---
export const GAME_TICK_MS = 100;
export const MAX_POKEMON_TO_OWN = POKEMONS.length;
export const BATTLE_LOG_MAX_ENTRIES = 25;
export const DAMAGE_VARIATION = 0.15; // ±15%
export const PLAYER_MAX_POKEMON_IN_PARTY = 6;
export const INITIAL_AREA_ID = MAP_AREAS[0].id;
export const EVOLUTION_ANIMATION_DURATION_MS = 2500;

// --- セーブデータ関連 ---
export const SAVE_DATA_KEY = 'pokeClickerQuestSaveData';
export const AUTO_SAVE_INTERVAL_MS = 30000; // 30秒ごと
