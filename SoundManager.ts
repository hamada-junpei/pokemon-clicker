


/**
 * SoundManager.ts
 *
 * 効果音（SE）とBGMの再生・停止・ミュート管理を行います。
 * 実際の音声ファイルがない場合は、シンプルなサイン波トーンをフォールバックとして再生します。
 * 音声ファイルは、ユーザーが別途用意し、`./assets/sounds/` フォルダ内に配置することを想定。
 */
import { SoundType, BgmType } from './types';

let isGloballyMuted = false;
let globalVolume = 0.7; // 0.0 to 1.0

interface PlayingSound {
  type: SoundType | BgmType;
  element: HTMLAudioElement | null; // HTMLAudioElementはフォールバック用
  sourceNode?: AudioBufferSourceNode | OscillatorNode; // Web Audio API用 (BufferSource or Oscillator)
  gainNode?: GainNode; // Web Audio API用
}

let currentBGM: PlayingSound | null = null;
// const activeSoundEffects: Map<string, PlayingSound> = new Map(); // SEは短いため厳密な管理は省略

// --- Web Audio APIの準備 ---
let audioContext: AudioContext | null = null;
const audioBuffers: Map<SoundType | BgmType, AudioBuffer> = new Map();

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn("[SoundManager] Web Audio API is not supported in this browser.", e);
      return null;
    }
  }
  return audioContext;
}

async function loadSound(soundPath: string): Promise<AudioBuffer | null> {
  const context = getAudioContext();
  if (!context) return null;

  try {
    const response = await fetch(soundPath);
    if (!response.ok) {
      // console.warn(`[SoundManager] Failed to fetch sound: ${soundPath}, status: ${response.status}`);
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer);
    return audioBuffer;
  } catch (error) {
    // console.warn(`[SoundManager] Error loading sound ${soundPath}:`, error);
    return null;
  }
}

// --- Placeholder: 実際の音声ファイルパス ---
const SOUND_EFFECT_FILES: Partial<Record<SoundType, string>> = {
  [SoundType.GENERIC_CLICK]: './assets/sounds/se_generic_click.wav',
  [SoundType.UI_BUTTON_CLICK]: './assets/sounds/se_ui_button_click.wav',
  [SoundType.ITEM_GET]: './assets/sounds/se_item_get.wav',
  [SoundType.LEVEL_UP]: './assets/sounds/se_level_up.wav',
  [SoundType.EVOLUTION_START]: './assets/sounds/se_evolution_start.wav',
  [SoundType.DAMAGE_PLAYER]: './assets/sounds/se_damage_player.wav',
  [SoundType.DAMAGE_ENEMY]: './assets/sounds/se_damage_enemy.wav',
  [SoundType.HEAL]: './assets/sounds/se_heal.wav',
  [SoundType.CURRENCY_GAIN_SMALL]: './assets/sounds/se_coin_small.wav',
  [SoundType.CURRENCY_GAIN_LARGE]: './assets/sounds/se_coin_large.wav',
  [SoundType.SHOP_TRANSACTION]: './assets/sounds/se_shop_transaction.wav',
  [SoundType.FARM_ACTION]: './assets/sounds/se_farm_action.wav',
  [SoundType.ADVENTURE_SUCCESS]: './assets/sounds/se_adventure_success.wav',
  [SoundType.ADVENTURE_FAIL]: './assets/sounds/se_adventure_fail.wav',
  [SoundType.POKEMON_FAINT]: './assets/sounds/se_pokemon_faint.wav',
  [SoundType.BALL_THROW]: './assets/sounds/se_ball_throw.wav',
  [SoundType.BALL_SHAKE]: './assets/sounds/se_ball_shake.wav',
  [SoundType.CATCH_SUCCESS_FANFARE]: './assets/sounds/se_catch_success_fanfare.wav',
  [SoundType.STAT_UP]: './assets/sounds/se_stat_up.wav',
  [SoundType.STAT_DOWN]: './assets/sounds/se_stat_down.wav',
  [SoundType.STATUS_APPLY]: './assets/sounds/se_status_apply.wav',
};

const BGM_FILES: Partial<Record<BgmType, string>> = {
  [BgmType.MAIN_THEME]: './assets/sounds/bgm_main_theme.mp3',
  [BgmType.BATTLE_THEME_WILD]: './assets/sounds/bgm_battle_wild.mp3',
  [BgmType.BATTLE_THEME_GYM]: './assets/sounds/bgm_battle_gym.mp3',
  [BgmType.SHOP_THEME]: './assets/sounds/bgm_shop_theme.mp3',
  [BgmType.FARM_THEME]: './assets/sounds/bgm_farm_theme.mp3',
  [BgmType.POKEMON_CENTER_THEME]: './assets/sounds/bgm_pokemon_center.mp3',
  [BgmType.EVOLUTION_THEME]: './assets/sounds/bgm_evolution.mp3',
  [BgmType.VICTORY_THEME_WILD]: './assets/sounds/bgm_victory_wild.mp3',
};

// --- プレースホルダーサウンドの周波数定義 ---
// Fix: Added missing SoundType enum members (STAT_UP, STAT_DOWN, STATUS_APPLY) to PLACEHOLDER_SE_FREQUENCIES.
const PLACEHOLDER_SE_FREQUENCIES: Record<SoundType, number | number[]> = {
  [SoundType.GENERIC_CLICK]: 880,
  [SoundType.UI_BUTTON_CLICK]: 660,
  [SoundType.ITEM_GET]: [1000, 1200], 
  [SoundType.LEVEL_UP]: [523, 659, 784], 
  [SoundType.EVOLUTION_START]: [100, 150, 200], 
  [SoundType.DAMAGE_PLAYER]: 300,
  [SoundType.DAMAGE_ENEMY]: 350,
  [SoundType.HEAL]: 900,
  [SoundType.CURRENCY_GAIN_SMALL]: 1000,
  [SoundType.CURRENCY_GAIN_LARGE]: 1200,
  [SoundType.SHOP_TRANSACTION]: 700,
  [SoundType.FARM_ACTION]: 500,
  [SoundType.ADVENTURE_SUCCESS]: [784, 1046], 
  [SoundType.ADVENTURE_FAIL]: 200,
  [SoundType.POKEMON_FAINT]: [400, 300, 200], 
  [SoundType.BALL_THROW]: 1500, 
  [SoundType.BALL_SHAKE]: 150, 
  [SoundType.CATCH_SUCCESS_FANFARE]: [784, 1046, 1318], 
  [SoundType.STAT_UP]: [600, 800, 1000], // Ascending progression
  [SoundType.STAT_DOWN]: [1000, 800, 600], // Descending progression
  [SoundType.STATUS_APPLY]: 450, // Neutral, noticeable sound
};
const PLACEHOLDER_SE_DURATION = 0.1; 

const PLACEHOLDER_BGM_FREQUENCIES: Record<BgmType, number> = {
  [BgmType.MAIN_THEME]: 220, 
  [BgmType.BATTLE_THEME_WILD]: 164, 
  [BgmType.BATTLE_THEME_TRAINER]: 174, 
  [BgmType.BATTLE_THEME_GYM]: 185, 
  [BgmType.BATTLE_THEME_BOSS]: 155, 
  [BgmType.SHOP_THEME]: 261, 
  [BgmType.POKEMON_CENTER_THEME]: 293, 
  [BgmType.EVOLUTION_THEME]: 110, 
  [BgmType.FARM_THEME]: 196, 
  [BgmType.VICTORY_THEME_WILD]: 330, 
  [BgmType.VICTORY_THEME_TRAINER]: 349, 
};

export async function preloadSounds(): Promise<void> {
  const context = getAudioContext();
  if (!context) {
    return;
  }
  const soundPromises: Promise<void>[] = [];

  for (const [type, path] of Object.entries(SOUND_EFFECT_FILES)) {
    if (path && !audioBuffers.has(type as SoundType)) {
      soundPromises.push(
        loadSound(path).then(buffer => {
          if (buffer) audioBuffers.set(type as SoundType, buffer);
        })
      );
    }
  }
  for (const [type, path] of Object.entries(BGM_FILES)) {
    if (path && !audioBuffers.has(type as BgmType)) {
      soundPromises.push(
        loadSound(path).then(buffer => {
          if (buffer) audioBuffers.set(type as BgmType, buffer);
        })
      );
    }
  }
  await Promise.all(soundPromises);
}

function playPlaceholderSE(sound: SoundType, volumeScale: number = 1): void {
  const context = getAudioContext();
  if (!context || isGloballyMuted) return;

  const frequencies = PLACEHOLDER_SE_FREQUENCIES[sound];
  const playSingleTone = (freq: number, startTimeOffset: number, waveType: OscillatorType = 'sine', duration: number = PLACEHOLDER_SE_DURATION) => {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.type = waveType;
    oscillator.frequency.setValueAtTime(freq, context.currentTime + startTimeOffset);
    
    // Simple AD envelope
    const attackTime = 0.01;
    const decayTime = duration * 0.8;
    const finalVolume = globalVolume * volumeScale * 0.4; // Placeholders are softer

    gainNode.gain.setValueAtTime(0, context.currentTime + startTimeOffset);
    gainNode.gain.linearRampToValueAtTime(finalVolume, context.currentTime + startTimeOffset + attackTime);
    gainNode.gain.setValueAtTime(finalVolume, context.currentTime + startTimeOffset + attackTime); // Sustain briefly
    gainNode.gain.linearRampToValueAtTime(0.0001, context.currentTime + startTimeOffset + attackTime + decayTime);


    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start(context.currentTime + startTimeOffset);
    oscillator.stop(context.currentTime + startTimeOffset + duration);
  };
  
  let waveType: OscillatorType = 'sine';
  if (sound === SoundType.GENERIC_CLICK || sound === SoundType.UI_BUTTON_CLICK || sound === SoundType.SHOP_TRANSACTION || sound === SoundType.BALL_THROW) waveType = 'square';
  if (sound === SoundType.DAMAGE_ENEMY || sound === SoundType.DAMAGE_PLAYER || sound === SoundType.ADVENTURE_FAIL || sound === SoundType.POKEMON_FAINT || sound === SoundType.BALL_SHAKE || sound === SoundType.STAT_DOWN || sound === SoundType.STATUS_APPLY) waveType = 'sawtooth';
  if (sound === SoundType.ITEM_GET || sound === SoundType.LEVEL_UP || sound === SoundType.HEAL || sound === SoundType.CATCH_SUCCESS_FANFARE || sound === SoundType.STAT_UP) waveType = 'triangle';


  if (Array.isArray(frequencies)) {
    frequencies.forEach((freq, index) => {
      playSingleTone(freq, index * (PLACEHOLDER_SE_DURATION * 0.6), waveType, PLACEHOLDER_SE_DURATION * (frequencies.length > 1 ? 0.7 : 1));
    });
  } else {
    playSingleTone(frequencies, 0, waveType);
  }
}


export function playSoundEffect(sound: SoundType, volumeScale: number = 1): void {
  if (isGloballyMuted) return;

  const context = getAudioContext();
  const buffer = audioBuffers.get(sound);

  if (context && buffer) { 
    const sourceNode = context.createBufferSource();
    sourceNode.buffer = buffer;
    const gainNode = context.createGain();
    gainNode.gain.setValueAtTime(globalVolume * volumeScale, context.currentTime);
    sourceNode.connect(gainNode);
    gainNode.connect(context.destination);
    sourceNode.start(0);
  } else if (context) { 
    playPlaceholderSE(sound, volumeScale);
  } else { 
    const filePath = SOUND_EFFECT_FILES[sound];
    if (filePath) {
      const audio = new Audio(filePath);
      audio.volume = globalVolume * volumeScale;
      audio.play().catch(error => {});
    } else {
    }
  }
}


function playPlaceholderBGM(bgm: BgmType, loop: boolean = true, volumeScale: number = 0.5): void {
    const context = getAudioContext();
    if (!context || isGloballyMuted) return;

    stopBGM(); 

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    let waveType: OscillatorType = 'triangle';
    if (bgm === BgmType.BATTLE_THEME_WILD || bgm === BgmType.BATTLE_THEME_GYM) waveType = 'sawtooth';
    if (bgm === BgmType.SHOP_THEME || bgm === BgmType.FARM_THEME) waveType = 'square';


    oscillator.type = waveType; 
    oscillator.frequency.setValueAtTime(PLACEHOLDER_BGM_FREQUENCIES[bgm] || 200, context.currentTime);
    gainNode.gain.setValueAtTime(globalVolume * volumeScale * 0.2, context.currentTime); 

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.start(0);
    // oscillator.loop = loop; // OscillatorNode does not have a loop property, it plays continuously until stopped.

    currentBGM = { type: bgm, element: null, sourceNode: oscillator, gainNode };
}


export function playBGM(bgm: BgmType, loop: boolean = true, volumeScale: number = 0.5): void {
  if (isGloballyMuted && currentBGM?.type === bgm) { 
      if (currentBGM?.sourceNode && 'playbackRate' in currentBGM.sourceNode) { 
      } else if (currentBGM?.sourceNode && 'frequency' in currentBGM.sourceNode) { 
      } else if (currentBGM?.element && !currentBGM.element.paused) {
        currentBGM.element.pause();
      }
      return;
  }
  if (isGloballyMuted) return; 

  if (currentBGM?.type === bgm) {
     if (currentBGM.sourceNode && 'playbackRate' in currentBGM.sourceNode && currentBGM.gainNode) { 
        currentBGM.gainNode.gain.setValueAtTime(globalVolume * volumeScale, audioContext?.currentTime || 0);
        return;
     }
     if (currentBGM.sourceNode && 'frequency' in currentBGM.sourceNode && currentBGM.gainNode) { 
        currentBGM.gainNode.gain.setValueAtTime(globalVolume * volumeScale * 0.2, audioContext?.currentTime || 0);
        return;
     }
     if (currentBGM.element && !currentBGM.element.paused) { 
        currentBGM.element.volume = globalVolume * volumeScale;
        return;
     }
  }

  stopBGM(); 

  const context = getAudioContext();
  const buffer = audioBuffers.get(bgm);

  if (context && buffer) { 
    const sourceNode = context.createBufferSource();
    sourceNode.buffer = buffer;
    sourceNode.loop = loop;
    const gainNode = context.createGain();
    gainNode.gain.setValueAtTime(globalVolume * volumeScale, context.currentTime);
    sourceNode.connect(gainNode);
    gainNode.connect(context.destination);
    sourceNode.start(0);
    currentBGM = { type: bgm, element: null, sourceNode, gainNode };
  } else if (context) { 
    playPlaceholderBGM(bgm, loop, volumeScale);
  } else { 
    const filePath = BGM_FILES[bgm];
    if (filePath) {
      const audio = new Audio(filePath);
      audio.volume = globalVolume * volumeScale;
      audio.loop = loop;
      audio.play().catch(error => {});
      currentBGM = { type: bgm, element: audio };
    } else {
    }
  }
}

export function stopBGM(): void {
  if (currentBGM) {
    if (currentBGM.sourceNode) { 
      try {
        (currentBGM.sourceNode as AudioScheduledSourceNode).stop();
        currentBGM.sourceNode.disconnect();
        if (currentBGM.gainNode) {
            currentBGM.gainNode.disconnect();
        }
      } catch (e) { }
    } else if (currentBGM.element) {
      currentBGM.element.pause();
      currentBGM.element.currentTime = 0; 
    }
    currentBGM = null;
  }
}

function _setMuteState(muted: boolean) {
  isGloballyMuted = muted;
  if (isGloballyMuted) {
    if (currentBGM?.sourceNode && currentBGM.gainNode) {
      currentBGM.gainNode.gain.cancelScheduledValues(audioContext?.currentTime || 0);
      currentBGM.gainNode.gain.setValueAtTime(0, audioContext?.currentTime || 0);
    } else if (currentBGM?.element && !currentBGM.element.paused) {
      currentBGM.element.pause();
    }
  } else { // Unmuting
    if (currentBGM?.sourceNode && currentBGM.gainNode) {
      let volScale = 0.5;
      const placeholderVolFactor = (currentBGM.sourceNode.constructor.name === 'OscillatorNode') ? 0.2 : 1;
      currentBGM.gainNode.gain.setValueAtTime(globalVolume * volScale * placeholderVolFactor, audioContext?.currentTime || 0);
    } else if (currentBGM?.element && currentBGM.element.paused) {
      currentBGM.element.play().catch(e => {});
    }
  }
}

export function toggleMute(): boolean {
  _setMuteState(!isGloballyMuted);
  return isGloballyMuted;
}

export function forceMute(): void {
  if (!isGloballyMuted) _setMuteState(true);
}
export function forceUnmute(): void {
  if (isGloballyMuted) _setMuteState(false);
}

export function getIsMuted(): boolean {
  return isGloballyMuted;
}

export function getCurrentBgmType(): BgmType | null {
    return currentBGM?.type as BgmType || null;
}


export function setGlobalVolume(newVolume: number): void {
  globalVolume = Math.max(0, Math.min(1, newVolume));
  if (currentBGM) {
    if (currentBGM.gainNode && audioContext) {
      let volScale = 0.5; 
      const placeholderVolFactor = (currentBGM.sourceNode?.constructor.name === 'OscillatorNode') ? 0.2 : 1;
      currentBGM.gainNode.gain.setValueAtTime(globalVolume * volScale * placeholderVolFactor, audioContext.currentTime);
    } else if (currentBGM.element) {
      currentBGM.element.volume = globalVolume * 0.5; 
    }
  }
}

if (typeof window !== 'undefined') {
    getAudioContext(); 
}
