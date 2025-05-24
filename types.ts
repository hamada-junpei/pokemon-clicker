/**
 * types.ts
 *
 * このファイルは、アプリケーション全体で使用されるTypeScriptの型定義をまとめています。
 * これにより、データの構造が明確になり、開発中のエラーを減らすことができます。
 * 例えば、ポケモンの情報、アップグレードの種類、ゲームの状態などが定義されています。
 */

/**
 * アップグレードの種類を定義する列挙型。
 * 各アップグレードがゲームにどのような影響を与えるかを示します。
 */
export enum UpgradeType {
  /** 応援効果の「倍率」を増加させるアップグレード (例: PDSブーストが1.5倍から1.6倍になる) */
  CLICK_BOOST = 'CLICK_BOOST',
  /** 秒間自動収入（PDS）の「基本値」を増加させるアップグレード (例: +0.5 PDS) */
  AUTO_INCOME_BOOST = 'AUTO_INCOME_BOOST',
  /** 応援効果の「持続時間」を増加させるアップグレード (例: 効果時間が10秒から12秒になる) */
  CLICK_MULTIPLIER = 'CLICK_MULTIPLIER',
  /** 秒間自動収入（PDS）全体に対する「乗数」を増加させるアップグレード (例: 全PDSが1.15倍になる) */
  AUTO_INCOME_MULTIPLIER = 'AUTO_INCOME_MULTIPLIER',
  /** 特定の機能を開放するアップグレード (例: オートバトル機能) */
  FEATURE_UNLOCK = 'FEATURE_UNLOCK',
  /** クリックごとの基本ポケドル獲得量を増加させるアップグレード */
  CLICK_INCOME_BASE = 'CLICK_INCOME_BASE',
  /** クリックによる応援バフの延長時間を増加させるアップグレード */
  CLICK_BUFF_EXTENSION = 'CLICK_BUFF_EXTENSION',
  /** 農園のプロット数を増加させるアップグレード */
  FARM_PLOT_INCREASE = 'FARM_PLOT_INCREASE',
}

/**
 * 各アップグレードの詳細な定義を表すインターフェース。
 */
export interface UpgradeDefinition {
  id: string; // アップグレードの一意なID
  name: string; // アップグレードの名前（表示用）
  description: string; // アップグレードの説明文（表示用）
  initialCost: number; // アップグレードの初期コスト
  costMultiplier: number; // レベルアップごとにかかるコストの乗数 (例: 1.15 なら次のレベルは15%高くなる)
  effectValue: number; // アップグレードの効果量。種類によって意味が変わる。
                       // CLICK_BOOST: 応援倍率の増加量
                       // AUTO_INCOME_BOOST: PDS基本値の増加量
                       // CLICK_MULTIPLIER: 応援持続時間の増加量(ミリ秒)
                       // AUTO_INCOME_MULTIPLIER: PDS乗数
                       // FEATURE_UNLOCK: (通常0、機能IDはidで示す)
                       // CLICK_INCOME_BASE: クリックごとの基本ポケドル増加量
                       // CLICK_BUFF_EXTENSION: クリックによるバフ延長時間増加量(ミリ秒)
                       // FARM_PLOT_INCREASE: プロット増加数 (通常1)
  type: UpgradeType; // アップグレードの種類 (上記のUpgradeTypeを参照)
  icon: string; // アップグレードのアイコン (絵文字やCSSクラス名など)
  maxLevel?: number; // アップグレードの最大レベル（オプショナル）
}

// --- 技とタイプ関連 ---
export enum PokemonType {
  NORMAL = 'ノーマル',
  FIRE = 'ほのお',
  WATER = 'みず',
  GRASS = 'くさ',
  ELECTRIC = 'でんき',
  ICE = 'こおり',
  FIGHTING = 'かくとう',
  POISON = 'どく',
  GROUND = 'じめん',
  FLYING = 'ひこう',
  PSYCHIC = 'エスパー',
  BUG = 'むし',
  ROCK = 'いわ',
  GHOST = 'ゴースト',
  DRAGON = 'ドラゴン',
  DARK = 'あく',
  STEEL = 'はがね',
  FAIRY = 'フェアリー',
}

export enum MoveCategory {
  PHYSICAL = '物理',
  SPECIAL = '特殊',
  STATUS = '変化',
}

export interface BaseStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}
export type StatName = keyof BaseStats;

export enum StatusCondition {
  NONE = 'NONE',
  POISON = 'POISON',
  PARALYSIS = 'PARALYSIS',
  BURN = 'BURN',
  SLEEP = 'SLEEP',
  CONFUSION = 'CONFUSION',
}

export interface Move {
  id: string;
  name: string;
  type: PokemonType;
  category: MoveCategory;
  power: number | null; // 変化技の場合はnull
  accuracy: number | null; // 必中技の場合はnullや101などで表現も
  pp: number; // 最大PP
  description: string;
  priority?: number; // 優先度 (デフォルト0)
  statChanges?: Array<{
    stat: StatName;
    change: number; // 例: +1, -2
    chance?: number; // 例: 0.3 (30%)。省略時は1.0 (100%)
    target: 'self' | 'opponent'; // 効果の対象
  }>;
  statusEffect?: {
    condition: StatusCondition;
    chance: number; // 0.0 to 1.0
    target: 'self' | 'opponent';
    turnsMin?: number; // For sleep/confusion
    turnsMax?: number; // For sleep/confusion
  };
  isContactMove?: boolean; // For abilities like Static
}

export interface LearnedMove {
  moveId: string;
  currentPP: number;
}

// --- ポケモン進化関連 ---
export interface EvolutionCondition {
  level?: number; // 進化に必要なレベル
  itemId?: string; // 進化に必要なアイテムID (例: 'fire-stone')
}

export interface EvolutionInfo {
  toPokemonId: string; // 進化先のポケモンのID
  condition: EvolutionCondition;
}

export enum Ability {
  NONE = 'NONE',
  INTIMIDATE = 'INTIMIDATE', // いかく
  STATIC = 'STATIC',         // せいでんき
  LEVITATE = 'LEVITATE',       // ふゆう
  MOXIE = 'MOXIE',           // じしんかじょう
  FLASH_FIRE = 'FLASH_FIRE', // もらいび
  OVERGROW = 'OVERGROW',     // しんりょく
  BLAZE = 'BLAZE',           // もうか
  TORRENT = 'TORRENT',       // げきりゅう
  // Add more abilities as needed
}

export interface AbilityData {
    name: string;
    description: string;
    // For more complex effects, you might add trigger conditions or effect functions later
    // Example: effectTrigger?: 'on_switch_in' | 'on_contact_received' | 'on_opponent_faint';
    // effectLogic?: (self: Pokemon, opponent?: Pokemon, move?: Move) => void;
}


/**
 * ポケモンのデータを表すインターフェース。
 */
export interface PokemonData {
  id: string; // ポケモンの一意なID
  name: string; // ポケモンの名前（表示用）
  imageUrl: string; // ポケモンの画像URL
  baseAutoIncomePerSecond: number; // このポケモンが基本で生み出す秒間ポケドル (レベル1時点)
  description: string; // ポケモンの説明文 (図鑑用)
  types: PokemonType[]; // ポケモンのタイプ
  levelUpMoves: { level: number, moveId: string }[]; // レベルアップで覚える技
  catchRateBonus?: number; // このポケモンの捕獲しやすさ補正 (例: 1.0が基準、高いほど捕まえやすい)
  evolution?: EvolutionInfo; // ポケモンの進化情報 (オプショナル)
  baseStats: BaseStats; // 種族値
  abilities: Ability[]; // 持つ可能性のある特性のリスト
}

/**
 * プレイヤーが所有しているアップグレードの状態を表すインターフェース。
 */
export interface OwnedUpgrade {
  level: number; // 現在のアップグレードレベル
}

/**
 * プレイヤーが所有している個々のポケモンの詳細な状態を表すインターフェース。
 */
export interface OwnedPokemonDetails {
  id: string; // ポケモンID (PokemonDataのidと一致)
  currentHp: number; // 現在のHP
  level: number; // 現在のレベル
  experience: number; // 現在の経験値
  currentMaxHp: number; // 現在のレベルでの最大HP (stats.hpから計算)
  learnedMoves: LearnedMove[]; // 現在覚えている技 (最大4つ)
  stats: BaseStats; // 現在のレベルにおける実際の能力値 (HP含む)
  statusCondition: StatusCondition; // 状態異常 (ねむり、どくなど)
  statusTurns: number; // 状態異常の残りターン数 (主にねむり用)
  confusionTurns: number; // こんらんの残りターン数
  battleSpeedModifier: number; // 戦闘中の実際のすばやさ補正 (まひなどで変動)
  battleTempStatModifiers: Partial<Record<StatName, number>>; // 戦闘中の一次的なステータスランク補正
  currentAbility: Ability; // 現在発動している特性
  isFlashFireActive: boolean; // もらいび効果が発動中か
}


/**
 * 個々の冒険オプションの定義。
 */
export interface AdventureOption {
  id: string;
  name: string;
  description: string;
  durationMs: number;
  successRate: number; // 0.0 to 1.0
  rewards: {
    pokeDollarsMin: number;
    pokeDollarsMax: number;
    experience: number;
    items: Array<{
      itemId: string;
      dropRate: number; // 0.0 to 1.0
      quantityMin: number;
      quantityMax: number;
    }>;
  };
  failureHpPenaltyPercentage: number; // 0.0 to 1.0 (e.g., 0.1 for 10%)
}

/**
 * 冒険の状態を表すインターフェース。
 */
export interface AdventureState {
  isOnAdventure: boolean; // 現在冒険中かどうか
  startTime: number | null; // 冒険開始時刻 (タイムスタンプ)
  message: string | null; // 冒険結果などのメッセージ（表示用）
  selectedAdventureOptionId: string | null; // どの冒険オプションが選択されたか
  currentAdventureDurationMs: number | null; // 現在の冒険の実際の所要時間
}

/**
 * 応援バフ（一時的なブースト効果）の状態を表すインターフェース。
 */
export interface CheerBuffState {
  isActive: boolean; // 応援バフが現在有効かどうか
  currentMultiplier: number; // 現在の応援効果倍率（アップグレードで変動）
  currentDurationMs: number; // 現在の応援効果持続時間（ミリ秒、アップグレードで変動）
  endTime: number | null; // 応援バフの終了時刻 (タイムスタンプ)
  baseActivatedTime: number | null; // 応援バフが最初に（または最後に新規で）発動した時刻
}

/**
 * 戦闘対象の敵ポケモンの状態を表すインターフェース。
 */
export interface EnemyPokemon {
  id: string; // ポケモンの一意なID (PokemonDataのidと共通の場合がある)
  name: string; // ポケモンの名前
  imageUrl: string; // ポケモンの画像URL
  types: PokemonType[]; // 敵ポケモンのタイプ
  level: number; // 敵ポケモンのレベル（将来的に変動させることも可能）
  maxHp: number; // 最大HP (stats.hpから計算)
  currentHp: number; // 現在のHP
  stats: BaseStats; // 敵ポケモンの現在の能力値 (HP含む)
  statusCondition: StatusCondition;
  statusTurns: number;
  confusionTurns: number;
  battleSpeedModifier: number;
  rewardPokeDollars: number; // 討伐時に得られるポケドル
  moves: { moveId: string }[]; // 敵ポケモンが使用する技のリスト
  baseCatchRate: number; // この敵ポケモンの基本捕獲率
  drops?: Array<{ itemId: string; dropRate: number; quantityMin: number; quantityMax: number }>; // ドロップアイテム情報
  givesExperience: number; // 討伐時に得られる経験値
  isBoss?: boolean; // この敵がボスかどうか (マップシステム用)
  isGymLeader?: boolean; // この敵がジムリーダーかどうか
  battleTempStatModifiers: Partial<Record<StatName, number>>; // 戦闘中の一次的なステータスランク補正
  currentAbility: Ability;
  isFlashFireActive: boolean;
}

/**
 * アイテムのカテゴリ。
 */
export enum ItemCategory {
  POKEBALL = 'pokeball',
  MEDICINE = 'medicine',
  BATTLE = 'battle', // 戦闘用アイテムカテゴリ追加
  GENERAL = 'general',
  GYM_BADGE = 'gym_badge', // ジムバッジカテゴリ追加
  VALUABLE = 'valuable', // きんのたまなど換金用
  EVOLUTION_STONE = 'evolution_stone', // しんかのいし
  TM = 'tm', // わざマシン
  SEED = 'seed', // 農園用のタネ
  BERRY = 'berry', // 農園で収穫できるきのみ
}

/**
 * アイテムの定義を表すインターフェース。
 */
export interface Item {
  id: string; // アイテムの一意なID
  name: string; // アイテム名
  description: string; // アイテムの説明
  icon: string; // アイテムのアイコン (絵文字など)
  category: ItemCategory; // アイテムカテゴリ
  maxStack?: number; // 最大スタック数 (デフォルトは99)
  effect?: {
    type: 'heal_hp_flat' | 'heal_hp_percentage' | 'revive' | 'stat_boost' | 'level_up' | 'exp_gain' | 'evolve' | 'plant_berry' | 'teach_move' | 'cure_status' | 'cure_all_major_status';
    value?: number; // 回復量、経験値量など
    stat?: string; // ステータス名 (将来用)
    duration?: number; // 効果持続ターン数 (将来用)
    evolvesToPokemonId?: string; // (タイプ'evolve'用)進化先のポケモンID
    requiredPokemonId?: string; // (タイプ'evolve'用)このアイテムで進化できるポケモンID
    plantsBerryId?: string; // (タイプ'plant_berry'用)このタネから育つきのみのID
    moveId?: string; // (タイプ'teach_move'用)教える技のID
    compatiblePokemonTypes?: PokemonType[]; // (タイプ'teach_move'用)使用可能なポケモンのタイプ
    conditionToCure?: StatusCondition; // (タイプ'cure_status'用)どの状態異常を治すか
  };
  badgeImageUrl?: string; // バッジの場合の画像URL (オプション)
  buyPrice?: number; // 購入価格 (将来的にショップで使用)
  sellPrice?: number; // 売却価格 (将来的にショップで使用)
}

/**
 * プレイヤーが所有しているアイテムの状態を表すインターフェース。
 * キーはアイテムID (Itemのid)、値は所持数。
 */
export type OwnedItems = Record<string, number>;


/**
 * 野生のポケモン出現定義のためのインターフェース。
 * マップシステム導入に伴い、エリアごとに定義される。
 */
export interface WildPokemonDefinitionInArea {
  pokemonId: string; // PokemonDataのID
  level: number; // 出現する野生ポケモンのレベル
  spawnWeight: number; // このポケモンがエリア内で出現する重み (高いほど出やすい)
  moves?: string[]; // この野生ポケモンが使用する技のIDリスト (指定がなければPokemonDataからレベルに応じて自動選択)
  rewardPokeDollars?: number; // エリアデフォルトを上書きする場合
  baseCatchRate?: number; // エリアデフォルトを上書きする場合
  drops?: Array<{ itemId: string; dropRate: number; quantityMin: number; quantityMax: number; }>;
  givesExperience?: number; // エリアデフォルトを上書きする場合
  isBoss?: boolean; // この定義がボス専用の場合
  isGymLeader?: boolean; // この定義がジムリーダー専用の場合
}

/**
 * 戦闘ログのメッセージタイプ
 */
export interface BattleLogEntry {
  id: string; // ログの一意なID (key用)
  message: string; // 表示するメッセージ
  type: 'info' | 'player_attack' | 'enemy_attack' | 'player_damage' | 'enemy_damage' | 'buff' | 'debuff' | 'system' | 'victory' | 'defeat' | 'catch_success' | 'catch_fail' | 'map_progress' | 'gym_leader_intro' | 'gym_leader_defeat' | 'shop_action' | 'adventure_result' | 'currency_gain' | 'evolution' | 'farm_action' | 'status_inflicted' | 'status_effect' | 'status_cured' | 'ability_activation';
  timestamp: number;
}

// --- マップシステム関連 ---
export type AreaUnlockConditionType = 'defeatCount' | 'defeatBoss' | 'manual' | 'hasBadge'; // hasBadge追加検討

export interface AreaUnlockCondition {
  type: AreaUnlockConditionType;
  count?: number; // defeatCount の場合に討伐必要数
  bossPokemonId?: string; // defeatBoss の場合に倒すべきボスのpokemonId
  requiredBadgeId?: string; // hasBadge の場合に必要となるバッジのID
}

export interface MapArea {
  id: string;
  name: string;
  description: string;
  enemyDefinitions: WildPokemonDefinitionInArea[]; // このエリアに出現するポケモン
  defaultRewardPokeDollars: number; // エリアのデフォルト討伐報酬
  defaultGivesExperience: number; // エリアのデフォルト獲得経験値
  unlockConditionToNext: AreaUnlockCondition; // 次のエリアに進むための条件
  nextAreaId: string | null; // 次のエリアのID。nullなら最終エリア or 未実装
  backgroundStyle?: string; // エリアごとの背景スタイル（CSSクラス名など、将来用）
  isGym?: boolean; // このエリアがジムかどうか
}

export interface AreaProgress {
  defeatCount: number; // 現在のエリアでの討伐数
  bossDefeated?: boolean; // 現在のエリアのボスを倒したか
}

// --- 農園システム関連 ---
export interface BerryData {
  id: string; // きのみのID (アイテムIDと一致)
  name: string; // きのみの名前
  description: string; // きのみの説明
  growthTimeMs: number; // 完全に成長するまでの総時間 (ミリ秒)
  harvestItemId: string; // 収穫できるアイテムID (通常は自身のきのみID)
  harvestQuantityMin: number; // 最小収穫量
  harvestQuantityMax: number; // 最大収穫量
  seedItemId: string; // このきのみを育てるためのタネのアイテムID
  growthStageImages: string[]; // 各成長段階の画像URL (例: ['seed.png', 'sprout.png', ... , 'ripe.png'])
                               // 今回は簡略化のため、アイコンとテキスト表示を組み合わせる
  growthStageNames: string[]; // 各成長段階の名前 (例: ["種", "芽", "花", "実り"])
  icon: string; // きのみ自体のアイコン (アイテム表示用)
}

export interface FarmPlotState {
  plantedBerryId: string | null; // 植えられているきのみのID (BerryDataのid)
  plantTime: number | null; // 植えた時刻 (タイムスタンプ)
  growthStage: number; // 現在の成長段階 (0: 空き, 1: 種, ..., N: 収穫可能)
  isHarvestable: boolean; // 収穫可能かどうか
}

// --- サウンド関連 ---
export enum SoundType {
  GENERIC_CLICK = 'GENERIC_CLICK', // 汎用的なクリック音 (応援など)
  UI_BUTTON_CLICK = 'UI_BUTTON_CLICK', // UIボタンのクリック音 (モーダル開閉など)
  ITEM_GET = 'ITEM_GET',
  LEVEL_UP = 'LEVEL_UP',
  EVOLUTION_START = 'EVOLUTION_START',
  DAMAGE_PLAYER = 'DAMAGE_PLAYER',
  DAMAGE_ENEMY = 'DAMAGE_ENEMY',
  HEAL = 'HEAL',
  CURRENCY_GAIN_SMALL = 'CURRENCY_GAIN_SMALL', // 少額の通貨獲得音 (クリック時など)
  CURRENCY_GAIN_LARGE = 'CURRENCY_GAIN_LARGE', // 多額の通貨獲得音 (報酬など)
  SHOP_TRANSACTION = 'SHOP_TRANSACTION',
  FARM_ACTION = 'FARM_ACTION', // タネ植え、収穫
  ADVENTURE_SUCCESS = 'ADVENTURE_SUCCESS',
  ADVENTURE_FAIL = 'ADVENTURE_FAIL',
  POKEMON_FAINT = 'POKEMON_FAINT',
  BALL_THROW = 'BALL_THROW',
  BALL_SHAKE = 'BALL_SHAKE', // ボールが揺れる音 (捕獲試行中)
  CATCH_SUCCESS_FANFARE = 'CATCH_SUCCESS_FANFARE', // 捕獲成功時のファンファーレ
  STAT_UP = 'STAT_UP',
  STAT_DOWN = 'STAT_DOWN',
  STATUS_APPLY = 'STATUS_APPLY',
}

export enum BgmType {
  MAIN_THEME = 'MAIN_THEME', // 通常時のBGM
  BATTLE_THEME_WILD = 'BATTLE_THEME_WILD', // 通常戦闘
  BATTLE_THEME_TRAINER = 'BATTLE_THEME_TRAINER', // (将来用) トレーナー戦
  BATTLE_THEME_GYM = 'BATTLE_THEME_GYM', // ジムリーダー戦
  BATTLE_THEME_BOSS = 'BATTLE_THEME_BOSS', // (将来用) ボス戦
  SHOP_THEME = 'SHOP_THEME', // ショップ
  POKEMON_CENTER_THEME = 'POKEMON_CENTER_THEME',
  EVOLUTION_THEME = 'EVOLUTION_THEME', // 進化中
  FARM_THEME = 'FARM_THEME', // 農園
  VICTORY_THEME_WILD = 'VICTORY_THEME_WILD', // 戦闘勝利 (野生)
  VICTORY_THEME_TRAINER = 'VICTORY_THEME_TRAINER', // (将来用) 戦闘勝利 (トレーナー)
}


/**
 * ゲーム全体の総合的な状態を表すインターフェース。
 * (注意: このインターフェースは直接useStateで使われるわけではなく、
 *  App.tsx内の複数のstate変数が集合的にこの状態を表しているという概念的なものです)
 */
export interface GameState {
  pokeDollars: number; // 所持しているポケドルの総額
  ownedUpgrades: Record<string, OwnedUpgrade>; // 所有しているアップグレードとそのレベルの記録 (キーはUpgradeDefinitionのid)
  ownedPokemonIds: string[]; // 所有しているポケモンのIDのリスト
  ownedPokemonDetails: Record<string, OwnedPokemonDetails>; // 所有している各ポケモンの詳細状態（HP、レベル、経験値など）
  firstCaughtAt: Record<string, number>; // 各ポケモンを初めて捕獲した日時 (キーはPokemonDataのid、値はタイムスタンプ)
  currentPokemonIndex: number; // 現在表示・応援対象のポケモンのインデックス (ownedPokemonIdsの添字)
  adventure: AdventureState; // 冒険の状態
  cheerBuff: CheerBuffState; // 応援バフの状態
  currentEnemy: EnemyPokemon | null; // 現在戦っている敵ポケモンの状態
  allPlayerPokemonFainted: boolean; // プレイヤーのポケモンが全員ひんしかどうか
  ownedItems: OwnedItems; // 所有しているアイテム
  battleLogs: BattleLogEntry[]; // 戦闘ログ
  currentAreaId: string; // 現在プレイヤーがいるマップエリアのID
  areaProgress: AreaProgress; // 現在のエリアでの進行状況
  defeatedGyms: Record<string, boolean>; // 討伐済みのジム (キーはMapArea.id)
  isAutoBattleUnlocked: boolean; // オートバトル機能がアンロックされているか
  isAutoBattleActive: boolean; // オートバトルが現在有効か
  evolvingPokemonVisualId: string | null; // 進化演出中のポケモンID
  farmPlots: FarmPlotState[]; // 農園のプロット状態
}

// ダメージポップアップの型定義 (App.tsxから移動、共通化)
export interface DamagePopupData {
  id: string;
  value: number | string; // ダメージ量 or "Miss!"
  x: number; // 表示位置 (親要素からの相対位置)
  y: number;
  type: 'player' | 'enemy' | 'heal' | 'currency';
  critical: boolean;
  targetId: string; // ポケモン or 敵のID (App.tsxでのフィルタリングに必要)
}
