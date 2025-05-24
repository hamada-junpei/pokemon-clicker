/**
 * InventoryPanel.tsx
 *
 * このコンポーネントは、「もちもの」エリアを担当します。
 * プレイヤーが現在所持しているアイテムとその数量を一覧表示します。
 * 将来的にはここからアイテムを使用する機能も追加される予定です。
 */
import React from 'react';
import { Item, OwnedItems, ItemCategory } from '../types'; 

interface InventoryPanelProps {
  items: Item[]; 
  ownedItems: OwnedItems; 
  onUseItem: (item: Item) => void; 
  allPlayerPokemonFainted: boolean; 
}

export const InventoryPanel: React.FC<InventoryPanelProps> = ({
  items,
  ownedItems,
  onUseItem,
  allPlayerPokemonFainted,
}) => {
  const playerHasItems = Object.keys(ownedItems).length > 0;

  return (
    <div className="nes-panel flex-grow">
      <h2 className="text-lg font-bold text-center mb-2 text-green-700">もちもの</h2>
      
      {allPlayerPokemonFainted && (
        <p className="text-center text-red-600 font-semibold mb-1 -mt-1 nes-text-xs">
          ポケモンが全員ひんしのため、一部アイテムは使用できません。
        </p>
      )}

      <div className="space-y-1 max-h-[calc(100vh-580px)] md:max-h-[130px] lg:max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
        {playerHasItems ? (
          Object.entries(ownedItems).map(([itemId, quantity]) => {
            const itemDef = items.find(i => i.id === itemId);
            if (!itemDef) return null; 

            let canUseThisItem = true;
            let disabledReason = "";

            if (itemDef.category === ItemCategory.POKEBALL || itemDef.category === ItemCategory.GYM_BADGE) {
              canUseThisItem = false; 
            } else if (allPlayerPokemonFainted) {
              if (!(itemDef.effect?.type === 'revive')) { 
                canUseThisItem = false;
                disabledReason = "ポケモンが全員ひんしです";
              }
            }
            
            const itemIconDisplay = itemDef.category === ItemCategory.GYM_BADGE && itemDef.badgeImageUrl 
              ? <img src={itemDef.badgeImageUrl} alt={itemDef.name} className="pixelated-img w-6 h-6 mr-1.5 object-contain" />
              : <span className="text-xl mr-1.5">{itemDef.icon}</span>;


            return (
              <div 
                key={itemId} 
                className={`flex items-center justify-between p-1 pixel-border-sm ${itemDef.category === ItemCategory.GYM_BADGE ? 'bg-yellow-200 border-yellow-400' : 'bg-lime-100 border-lime-300'}`}
              >
                <div className="flex items-center">
                  {itemIconDisplay}
                  <div>
                    <p className={`font-semibold nes-text-sm ${itemDef.category === ItemCategory.GYM_BADGE ? 'text-yellow-800' : 'text-lime-800'}`}>{itemDef.name}</p>
                    <p className="nes-text-2xs text-gray-600">{itemDef.description}</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  {itemDef.category !== ItemCategory.GYM_BADGE && <p className="text-sm font-bold text-lime-900">x{quantity}</p> }
                  {itemDef.category !== ItemCategory.POKEBALL && itemDef.category !== ItemCategory.GYM_BADGE && itemDef.effect && ( 
                     <button
                        onClick={() => onUseItem(itemDef)}
                        disabled={!canUseThisItem}
                        className={`nes-button text-2xs py-0.5 px-1 mt-0.5 ${
                            !canUseThisItem 
                                ? 'is-disabled' 
                                : 'is-primary'
                            }`}
                        title={!canUseThisItem && disabledReason ? disabledReason : !canUseThisItem ? "現在使用できません" : `${itemDef.name}を使用する`}
                     >
                       つかう
                     </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500 py-2 nes-text-sm">もちものはありません。</p>
        )}
      </div>
    </div>
  );
};
