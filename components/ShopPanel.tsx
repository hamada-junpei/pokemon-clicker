/**
 * ShopPanel.tsx
 * ポケマート（ショップ）のUIコンポーネント。アイテムの購入と売却ができる。
 */
import React, { useState } from 'react';
import { Item, OwnedItems, ItemCategory } from '../types';
import { CURRENCY_SYMBOL } from '../constants';

interface ShopPanelProps {
  items: Item[]; // 全アイテム定義
  ownedItems: OwnedItems;
  pokeDollars: number;
  onBuyItem: (itemId: string, quantity: number) => void;
  onSellItem: (itemId: string, quantity: number) => void;
  allPlayerPokemonFainted: boolean;
}

const formatNumber = (num: number, digits: number = 0): string => {
  return num.toLocaleString('ja-JP', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};

export const ShopPanel: React.FC<ShopPanelProps> = ({
  items,
  ownedItems,
  pokeDollars,
  onBuyItem,
  onSellItem,
  allPlayerPokemonFainted,
}) => {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');

  const buyableItems = items.filter(item => item.buyPrice !== undefined && item.buyPrice > 0 && item.category !== ItemCategory.GYM_BADGE);
  const sellableOwnedItems = Object.keys(ownedItems)
    .map(id => items.find(item => item.id === id))
    .filter(item => item && item.sellPrice !== undefined && item.sellPrice > 0 && item.category !== ItemCategory.GYM_BADGE && ownedItems[item.id] > 0) as Item[];


  return (
    <div className="nes-panel">
      <h2 className="text-lg font-bold text-center mb-2 text-cyan-700">ポケマート</h2>
      {allPlayerPokemonFainted && (
        <p className="text-center text-red-600 font-semibold mb-1 -mt-1 nes-text-xs">
          ポケモンが全員ひんしのため、現在利用できません。
        </p>
      )}

      <div className="flex justify-center mb-2">
        <button
          onClick={() => setActiveTab('buy')}
          className={`nes-button text-xs ${activeTab === 'buy' ? 'is-primary' : 'is-normal'}`}
          disabled={allPlayerPokemonFainted}
        >
          かう
        </button>
        <button
          onClick={() => setActiveTab('sell')}
          className={`nes-button text-xs ${activeTab === 'sell' ? 'is-success' : 'is-normal'}`}
          disabled={allPlayerPokemonFainted}
        >
          うる
        </button>
      </div>

      <div className="space-y-1 max-h-[calc(100vh-680px)] md:max-h-[120px] lg:max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
        {activeTab === 'buy' && (
          <>
            {buyableItems.length > 0 ? buyableItems.map(item => (
              <div key={`buy-${item.id}`} className="flex items-center justify-between p-1 pixel-border-sm bg-blue-100 border-blue-300">
                <div className="flex items-center">
                  <span className="text-xl mr-1.5">{item.icon}</span>
                  <div>
                    <p className="font-semibold nes-text-sm text-blue-800">{item.name}</p>
                    <p className="nes-text-2xs text-gray-600">{item.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="nes-text-xs text-gray-700 mb-0.5">{formatNumber(item.buyPrice!)} {CURRENCY_SYMBOL}</p>
                  <button
                    onClick={() => onBuyItem(item.id, 1)}
                    disabled={pokeDollars < item.buyPrice! || allPlayerPokemonFainted}
                    className={`nes-button is-primary text-2xs py-0 px-1`}
                  >
                    かう
                  </button>
                </div>
              </div>
            )) : <p className="nes-text-sm text-gray-500 text-center">購入できる品物はありません。</p>}
          </>
        )}

        {activeTab === 'sell' && (
          <>
            {sellableOwnedItems.length > 0 ? sellableOwnedItems.map(item => (
              <div key={`sell-${item.id}`} className="flex items-center justify-between p-1 pixel-border-sm bg-green-100 border-green-300">
                <div className="flex items-center">
                  <span className="text-xl mr-1.5">{item.icon}</span>
                  <div>
                    <p className="font-semibold nes-text-sm text-green-800">{item.name}</p>
                    <p className="nes-text-2xs text-gray-600">所持: {ownedItems[item.id]}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="nes-text-xs text-gray-700 mb-0.5">{formatNumber(item.sellPrice!)} {CURRENCY_SYMBOL}</p>
                  <button
                    onClick={() => onSellItem(item.id, 1)}
                    disabled={allPlayerPokemonFainted}
                    className={`nes-button is-success text-2xs py-0 px-1`}
                  >
                    うる
                  </button>
                </div>
              </div>
            )) : <p className="nes-text-sm text-gray-500 text-center">売却できる品物はありません。</p>}
          </>
        )}
      </div>
       <p className="nes-text-xs text-right mt-1 text-yellow-700">所持金: {formatNumber(pokeDollars)} {CURRENCY_SYMBOL}</p>
    </div>
  );
};