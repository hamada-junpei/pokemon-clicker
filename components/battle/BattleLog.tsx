/**
 * BattleLog.tsx
 * 戦闘ログを表示するコンポーネント。
 */
import React, { useEffect, useRef } from 'react';
import { BattleLogEntry } from '../../types';

interface BattleLogProps {
  logs: BattleLogEntry[];
}

export const BattleLog: React.FC<BattleLogProps> = ({ logs }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0; 
    }
  }, [logs]);

  const getLogTextColor = (type: BattleLogEntry['type']): string => {
    // ドット絵風の色合いに調整
    switch (type) {
      case 'player_attack':
      case 'buff':
        return 'text-blue-700';
      case 'enemy_attack':
      case 'debuff':
        return 'text-red-700';
      case 'player_damage':
        return 'text-red-800 font-semibold';
      case 'enemy_damage':
        return 'text-green-800 font-semibold';
      case 'victory':
      case 'catch_success':
        return 'text-green-700 font-bold';
      case 'defeat':
      case 'catch_fail':
        return 'text-red-700 font-bold';
      case 'system':
        return 'text-purple-700';
      case 'info':
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div className="nes-panel p-2 flex-grow min-h-[100px] max-h-[150px]">
      <h3 className="nes-text-sm font-semibold text-center mb-1 text-gray-700 border-b-2 border-black pb-0.5">バトルログ</h3>
      <div 
        ref={logContainerRef} 
        className="custom-scrollbar overflow-y-auto h-[calc(100%-1.5rem)] space-y-0.5 pr-1"
        aria-live="polite"
      >
        {logs.length === 0 && <p className="nes-text-xs text-gray-500 text-center">戦闘開始を待っています...</p>}
        {logs.map(log => (
          <p key={log.id} className={`nes-text-xs ${getLogTextColor(log.type)} leading-tight`}>
            {log.message}
          </p>
        ))}
      </div>
    </div>
  );
};