/**
 * AdventureControls.tsx
 *
 * このコンポーネントは、「冒険のほこら」エリアを担当します。
 * プレイヤーが複数の冒険オプションから選択して冒険に出るためのボタン、
 * 冒険中の残り時間、そして冒険の結果メッセージを表示します。
 */
import React, { useState, useEffect } from 'react';
import { AdventureState, AdventureOption } from '../types'; 

interface AdventureControlsProps {
  adventure: AdventureState; 
  onStartAdventure: (adventureOptionId: string) => void; 
  onClearMessage: () => void; 
  allPlayerPokemonFainted: boolean; 
  adventureOptions: AdventureOption[];
}

const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}分${seconds > 0 ? `${seconds}秒` : ''}`;
};

export const AdventureControls: React.FC<AdventureControlsProps> = ({ 
  adventure, 
  onStartAdventure,
  onClearMessage,
  allPlayerPokemonFainted,
  adventureOptions,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    let intervalId: number | undefined; 

    if (adventure.isOnAdventure && adventure.startTime && adventure.currentAdventureDurationMs) {
      const updateTimer = () => {
        const endTime = adventure.startTime! + adventure.currentAdventureDurationMs!; 
        const remaining = Math.max(0, endTime - Date.now()); 
        const minutes = Math.floor((remaining / 1000 / 60) % 60); 
        const seconds = Math.floor((remaining / 1000) % 60); 
        setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`); 
        
        if (remaining === 0) { 
          clearInterval(intervalId); 
        }
      };
      updateTimer(); 
      intervalId = window.setInterval(updateTimer, 1000); 
    } else {
      setTimeLeft('');
    }
    return () => clearInterval(intervalId);
  }, [adventure]); 

  const adventureDisabledReason = (option?: AdventureOption) => {
    if (allPlayerPokemonFainted) return 'ポケモンが全員ひんしです';
    if (adventure.isOnAdventure) return '現在冒険中です';
    return null;
  }
  
  const currentSelectedOption = adventure.selectedAdventureOptionId 
    ? adventureOptions.find(opt => opt.id === adventure.selectedAdventureOptionId) 
    : null;

  return (
    <div className="nes-panel">
      <h2 className="text-lg font-bold text-center mb-2 text-purple-700">冒険のほこら</h2>
      
      {adventure.message && (
        <div 
          className={`nes-panel is-rounded p-2 mb-2 text-center nes-text-xs ${
            adventure.message.includes('成功') || adventure.message.includes('獲得！') || adventure.message.includes('見つけた！')
              ? 'bg-green-200 text-green-800 pixel-border-sm border-green-700' 
              : adventure.message.includes('失敗') || adventure.message.includes('ダメージ') || adventure.message.includes('ひんし')
                ? 'bg-red-200 text-red-800 pixel-border-sm border-red-700'
                : 'bg-yellow-200 text-yellow-800 pixel-border-sm border-yellow-700'
          }`}
          role="alert"
        >
          <p style={{whiteSpace: 'pre-line'}}>{adventure.message}</p>
          <button 
            onClick={onClearMessage} 
            className="ml-1 nes-text-xs underline hover:opacity-80"
            aria-label="メッセージを閉じる"
          >
            [閉]
          </button>
        </div>
      )}

      {adventure.isOnAdventure && currentSelectedOption ? (
        <div className="text-center">
          <p className="nes-text-sm text-gray-700">「{currentSelectedOption.name}」に冒険中...</p>
          <p className="text-xl font-bold text-purple-600 my-1" aria-live="polite" aria-atomic="true">{timeLeft}</p>
          <div className="nes-progress-bar-container my-1">
            <div 
              className="nes-progress-bar bg-purple-600" 
              style={{ width: `${adventure.startTime && adventure.currentAdventureDurationMs ? Math.max(0, 100 - ((Date.now() - adventure.startTime) / adventure.currentAdventureDurationMs) * 100) : 0}%` }}
            ></div>
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          {adventureOptions.map(option => {
            const reason = adventureDisabledReason(option);
            const isDisabled = !!reason;
            return (
              <button
                key={option.id}
                onClick={() => onStartAdventure(option.id)}
                disabled={isDisabled}
                className={`nes-button w-full text-xs flex flex-col items-start p-1 ${isDisabled ? 'is-disabled' : 'is-primary'}`}
                aria-label={reason || `${option.name} に出発する`}
                title={option.description}
              >
                <span className="font-semibold self-center">{option.name}</span>
                <span className="nes-text-2xs text-gray-700 self-center mb-0.5">({formatDuration(option.durationMs)})</span>
                <p className="nes-text-2xs text-left text-gray-600 w-full leading-tight">{option.description}</p>
              </button>
            );
          })}
          {allPlayerPokemonFainted && (
            <p className="nes-text-xs text-red-600 mt-1 text-center">
              {adventureDisabledReason()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};