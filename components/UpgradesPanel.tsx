/**
 * UpgradesPanel.tsx
 *
 * このコンポーネントは、「フレンドリィショップ」のメインパネルを担当します。
 * 購入可能な全てのアップグレードとアイテムをリスト形式で表示します。
 * 各アップグレードは `UpgradeCard` コンポーネントとして描画されます。
 * パネル内はスクロール可能になっています。
 */
import React, { useState } from 'react';
import { UpgradeDefinition, OwnedUpgrade, Item, OwnedItems, ItemCategory } from '../types'; 
import { UpgradeCard } from './UpgradeCard'; 
import { CURRENCY_SYMBOL } from '../constants';

interface UpgradesPanelProps {
  upgrades: UpgradeDefinition[]; 
  ownedUpgrades: Record<string, OwnedUpgrade>; 
  pokeDollars: number; 
  onBuyUpgrade: (upgradeId: string) => void; 
  calculateUpgradeCost: (upgradeDef: UpgradeDefinition) => number; 
  allPlayerPokemonFainted: boolean;
  // Props for item shop functionality (integrated from ShopPanel)
  items: Item[];
  onBuyItem: (itemId: string, quantity: number) => void;
  onSellItem: (itemId: string, quantity: number) => void;
  ownedItems: OwnedItems;
}

const formatNumberPanel = (num: number, digits: number = 0): string => {
  return num.toLocaleString('ja-JP', { 
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};

export const UpgradesPanel: React.FC<UpgradesPanelProps> = ({
  upgrades, 
  ownedUpgrades, 
  pokeDollars, 
  onBuyUpgrade, 
  calculateUpgradeCost, 
  allPlayerPokemonFainted,
  items,
  onBuyItem,
  onSellItem,
  ownedItems,
}) => {
  const [activeTab, setActiveTab] = useState<'upgrades' | 'buy_items' | 'sell_items'>('upgrades');

  const buyableItems = items.filter(item => item.buyPrice !== undefined && item.buyPrice > 0 && item.category !== ItemCategory.GYM_BADGE);
  const sellableOwnedItems = Object.keys(ownedItems)
    .map(id => items.find(item => item.id === id))
    .filter(item => item && item.sellPrice !== undefined && item.sellPrice > 0 && item.category !== ItemCategory.GYM_BADGE && ownedItems[item.id] > 0) as Item[];

  return (
    <div className="nes-panel flex-grow flex flex-col">
      <h2 className="text-xl font-bold text-center mb-2 text-blue-700">フレンドリィショップ</h2>
      
      <div className="flex justify-center mb-2 border-b-2 border-black pb-1">
        <button
          onClick={() => setActiveTab('upgrades')}
          className={`nes-button text-xs mr-1 ${activeTab === 'upgrades' ? 'is-primary' : 'is-normal'}`}
          disabled={allPlayerPokemonFainted && activeTab !== 'upgrades'}
        >
          アップグレード
        </button>
        <button
          onClick={() => setActiveTab('buy_items')}
          className={`nes-button text-xs mr-1 ${activeTab === 'buy_items' ? 'is-success' : 'is-normal'}`}
          disabled={allPlayerPokemonFainted}
        >
          どうぐを買う
        </button>
        <button
          onClick={() => setActiveTab('sell_items')}
          className={`nes-button text-xs ${activeTab === 'sell_items' ? 'is-warning' : 'is-normal'}`}
          disabled={allPlayerPokemonFainted}
        >
          どうぐを売る
        </button>
      </div>
      
      {allPlayerPokemonFainted && (
        <p className="text-center text-red-600 font-semibold mb-2 -mt-1 nes-text-xs">
          ポケモンが全員ひんしのため、現在ショップは利用できません。
        </p>
      )}

      <div className="flex-grow space-y-2 max-h-[calc(100vh-480px)] md:max-h-[calc(100vh-380px)] overflow-y-auto custom-scrollbar pr-1">
        {activeTab === 'upgrades' && upgrades.map((upgrade) => {
          const currentLevel = ownedUpgrades[upgrade.id]?.level || 0;
          const cost = calculateUpgradeCost(upgrade);
          const canAfford = pokeDollars >= cost && !allPlayerPokemonFainted; 
          
          return (
            <UpgradeCard
              key={upgrade.id} 
              upgrade={upgrade} 
              currentLevel={currentLevel} 
              cost={cost} 
              canAfford={canAfford} 
              onBuy={onBuyUpgrade} 
              disabledByFaint={allPlayerPokemonFainted} 
            />
          );
        })}

        {activeTab === 'buy_items' && (
          <>
            {buyableItems.length > 0 ? buyableItems.map(item => (
              <div key={`buy-${item.id}`} className="flex items-center justify-between p-1.5 pixel-border-sm bg-green-100 border-green-300">
                <div className="flex items-center">
                  <span className="text-xl mr-1.5">{item.icon}</span>
                  <div>
                    <p className="font-semibold nes-text-sm text-green-800">{item.name}</p>
                    <p className="nes-text-2xs text-gray-600">{item.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="nes-text-xs text-gray-700 mb-0.5">{formatNumberPanel(item.buyPrice!)} {CURRENCY_SYMBOL}</p>
                  <button
                    onClick={() => onBuyItem(item.id, 1)}
                    disabled={pokeDollars < item.buyPrice! || allPlayerPokemonFainted}
                    className={`nes-button is-success text-2xs py-0 px-1`}
                  >
                    かう
                  </button>
                </div>
              </div>
            )) : <p className="nes-text-sm text-gray-500 text-center">購入できる品物はありません。</p>}
          </>
        )}

        {activeTab === 'sell_items' && (
          <>
            {sellableOwnedItems.length > 0 ? sellableOwnedItems.map(item => (
              <div key={`sell-${item.id}`} className="flex items-center justify-between p-1.5 pixel-border-sm bg-yellow-100 border-yellow-300">
                <div className="flex items-center">
                  <span className="text-xl mr-1.5">{item.icon}</span>
                  <div>
                    <p className="font-semibold nes-text-sm text-yellow-800">{item.name}</p>
                    <p className="nes-text-2xs text-gray-600">所持: {ownedItems[item.id]}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="nes-text-xs text-gray-700 mb-0.5">{formatNumberPanel(item.sellPrice!)} {CURRENCY_SYMBOL}</p>
                  <button
                    onClick={() => onSellItem(item.id, 1)}
                    disabled={allPlayerPokemonFainted}
                    className={`nes-button is-warning text-2xs py-0 px-1`}
                  >
                    うる
                  </button>
                </div>
              </div>
            )) : <p className="nes-text-sm text-gray-500 text-center">売却できる品物はありません。</p>}
          </>
        )}
      </div>
      <p className="nes-text-xs text-right mt-2 text-yellow-700 font-semibold">
        所持金: {formatNumberPanel(pokeDollars)} {CURRENCY_SYMBOL}
      </p>
    </div>
  );
};