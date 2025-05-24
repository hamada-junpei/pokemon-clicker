/**
 * UpgradeCard.tsx
 *
 * このコンポーネントは、「フレンドリィショップ」に表示される個々のアップグレード項目（カード）を担当します。
 * アップグレードの名前、説明、アイコン、現在のレベル、購入コストを表示し、
 * ユーザーが購入ボタンを押せるようにします。
 */
import React from 'react';
import { UpgradeDefinition, UpgradeType } from '../types'; 
import { CURRENCY_SYMBOL } from '../constants'; 

interface UpgradeCardProps {
  upgrade: UpgradeDefinition; 
  currentLevel: number; 
  cost: number; 
  canAfford: boolean; 
  onBuy: (upgradeId: string) => void; 
  disabledByFaint?: boolean; 
}

const formatNumber = (num: number, digits: number = 0): string => {
  return num.toLocaleString('ja-JP', { 
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};

const getNextLevelEffectText = (upgrade: UpgradeDefinition): string => {
    const effectValue = upgrade.effectValue;
    let effectDescription = "";

    switch (upgrade.type) {
        case UpgradeType.CLICK_INCOME_BASE:
            effectDescription = `基本応援収入: +${formatNumber(effectValue, 0)} ${CURRENCY_SYMBOL}`;
            break;
        case UpgradeType.CLICK_BOOST:
            effectDescription = `応援倍率: +${formatNumber(effectValue, 2)}倍`;
            break;
        case UpgradeType.CLICK_MULTIPLIER: // This is duration
            effectDescription = `応援時間: +${formatNumber(effectValue / 1000, 1)}秒`;
            break;
        case UpgradeType.CLICK_BUFF_EXTENSION:
            effectDescription = `応援延長: +${formatNumber(effectValue / 1000, 2)}秒`;
            break;
        case UpgradeType.AUTO_INCOME_BOOST:
            effectDescription = `自動PDS: +${formatNumber(effectValue, 1)} ${CURRENCY_SYMBOL}/秒`;
            break;
        case UpgradeType.AUTO_INCOME_MULTIPLIER:
            effectDescription = `全PDS倍率: x${formatNumber(effectValue, 2)}`;
            break;
        case UpgradeType.FEATURE_UNLOCK:
            return ""; // 機能解放は「次のレベル」がない
        default:
            effectDescription = `効果: +${formatNumber(effectValue, 2)}`;
    }
    return `次のLv効果: ${effectDescription}`;
};


export const UpgradeCard: React.FC<UpgradeCardProps> = ({
  upgrade,
  currentLevel,
  cost,
  canAfford,
  onBuy,
  disabledByFaint = false,
}) => {
  const isMaxLevel = upgrade.maxLevel !== undefined && currentLevel >= upgrade.maxLevel;
  const isDisabled = !canAfford || isMaxLevel || disabledByFaint;
  const nextLevelEffectText = !isMaxLevel ? getNextLevelEffectText(upgrade) : "";


  return (
    <div 
      className="pixel-border bg-sky-100 p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 pixel-shadow-sm"
      style={{ backgroundColor: '#e0f2fe' }} // より淡い空色
    >
      <div className="flex-grow">
        <h3 className="text-sm font-semibold text-blue-800 flex items-center">
          <span className="text-xl mr-2">{upgrade.icon}</span> 
          {upgrade.name} 
        </h3>
        <p className="nes-text-xs text-gray-700 mt-0.5">{upgrade.description}</p>
        <p className="nes-text-sm text-blue-700 mt-0.5">
          Lv: {currentLevel}
          {upgrade.maxLevel !== undefined && ` / ${upgrade.maxLevel}`}
        </p>
        {nextLevelEffectText && (
            <p className="nes-text-xs text-gray-600 mt-0.5">{nextLevelEffectText}</p>
        )}
      </div>
      <div className="text-left sm:text-right w-full sm:w-auto">
        {!isMaxLevel && (
          <p className="nes-text-sm font-semibold text-gray-800 mb-1">
            Cost: {formatNumber(cost)} {CURRENCY_SYMBOL} 
          </p>
        )}
        <button
          onClick={() => onBuy(upgrade.id)} 
          disabled={isDisabled}
          className={`nes-button text-xs ${
            isMaxLevel 
              ? 'is-success is-disabled' 
              : (!isDisabled)
                ? 'is-primary' 
                : 'is-disabled'
            }`}
        >
          {isMaxLevel ? 'Max Lv' : '購入'}
        </button>
      </div>
    </div>
  );
};