/**
 * MapDisplayArea.tsx
 * 現在のマップエリアの情報と進行状況を表示するコンポーネント。
 */
import React from 'react';
import { MapArea, AreaProgress } from '../types';

interface MapDisplayAreaProps {
  currentArea: MapArea;
  areaProgress: AreaProgress;
  onMoveToNextArea: () => void;
  isCleared: boolean;
  isGymLeaderDefeated?: boolean; // ジムリーダーが倒されたかどうか
}

export const MapDisplayArea: React.FC<MapDisplayAreaProps> = ({
  currentArea,
  areaProgress,
  onMoveToNextArea,
  isCleared,
  isGymLeaderDefeated,
}) => {
  let progressText = '';
  const condition = currentArea.unlockConditionToNext;

  if (currentArea.isGym) {
    if (isGymLeaderDefeated) {
        progressText = 'ジムリーダー 討伐済！';
    } else {
        progressText = `ジムリーダー (${condition.type === 'defeatBoss' && condition.bossPokemonId ? condition.bossPokemonId : '挑戦者求む'}) に挑め！`;
    }
  } else if (condition.type === 'defeatCount' && condition.count) {
    const remaining = Math.max(0, condition.count - areaProgress.defeatCount);
    progressText = `あと ${remaining} 体 討伐`;
  } else if (condition.type === 'defeatBoss' && condition.bossPokemonId) {
    progressText = areaProgress.bossDefeated ? 'ボス 討伐済' : `ボス (${condition.bossPokemonId}) を探せ`;
  }
  
  const gymNamePrefix = currentArea.isGym ? "💪 " : ""; // ジムアイコン

  return (
    <div className={`nes-panel p-2 my-2 ${currentArea.isGym ? 'bg-yellow-100 border-yellow-400' : ''}`}>
      <h2 className="text-sm font-semibold text-center text-green-700 mb-1">
        {gymNamePrefix}{currentArea.name}
      </h2>
      <p className="nes-text-xs text-gray-600 mb-1 text-center px-2">
        {currentArea.description}
      </p>
      {!isCleared && progressText && (
        <div className="text-center my-1">
          <p className={`nes-text-xs ${currentArea.isGym && !isGymLeaderDefeated ? 'text-purple-700 font-bold' : 'text-yellow-700'}`}>{progressText}</p>
          {condition.type === 'defeatCount' && condition.count && !currentArea.isGym && ( // ジム以外の討伐数プログレスバー
            <div className="nes-progress-bar-container mt-0.5 w-3/4 mx-auto">
              <div
                className="nes-progress-bar nes-progress-bar-xp"
                style={{ width: `${(areaProgress.defeatCount / condition.count) * 100}%` }}
              ></div>
            </div>
          )}
        </div>
      )}
      {isCleared && currentArea.nextAreaId && (
        <button
          onClick={onMoveToNextArea}
          className="nes-button is-success w-full text-xs mt-1"
        >
          次のエリアへ進む
        </button>
      )}
      {isCleared && !currentArea.nextAreaId && (
         <p className="nes-text-xs text-blue-600 mt-1 text-center font-semibold">全てのエリアを制覇！</p>
      )}
    </div>
  );
};
