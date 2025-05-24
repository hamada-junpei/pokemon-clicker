/**
 * DeveloperPanel.tsx
 *
 * このコンポーネントは、開発者向けのデバッグ機能を提供します。
 * Shift + D x3 で表示/非表示を切り替えられます。
 * ゲーム内通貨の追加、アイテムの追加、ポケモンレベルの変更などが可能です。
 */
import React, { useState } from 'react';
// Fix for components/DeveloperPanel.tsx line 9: Imported CURRENCY_SYMBOL from constants
import { PokemonData, Item, MapArea } from '../types'; 
import { CURRENCY_SYMBOL } from '../constants';

interface DeveloperPanelProps {
  allPokemonData: PokemonData[];
  allItems: Item[];
  allMapAreas: MapArea[];
  currentPokemonId: string;
  onAddPokeDollars: (amount: number) => void;
  onAddItem: (itemId: string, quantity: number) => void;
  onSetPokemonLevel: (level: number) => void;
  onAddPokemonExperience: (experience: number) => void;
  onMoveToArea: (areaId: string) => void;
  onHealAll: () => void;
  onToggleDevMode: () => void;
}

export const DeveloperPanel: React.FC<DeveloperPanelProps> = ({
  allPokemonData,
  allItems,
  allMapAreas,
  currentPokemonId,
  onAddPokeDollars,
  onAddItem,
  onSetPokemonLevel,
  onAddPokemonExperience,
  onMoveToArea,
  onHealAll,
  onToggleDevMode,
}) => {
  const [pokeDollarAmount, setPokeDollarAmount] = useState<string>("1000");
  const [itemIdToAdd, setItemIdToAdd] = useState<string>(allItems[0]?.id || "");
  const [itemQuantity, setItemQuantity] = useState<string>("1");
  const [pokemonLevel, setPokemonLevel] = useState<string>("5");
  const [pokemonExperience, setPokemonExperience] = useState<string>("100");
  const [areaToMove, setAreaToMove] = useState<string>(allMapAreas[0]?.id || "");

  const handleAddPokeDollars = () => {
    const amount = parseInt(pokeDollarAmount, 10);
    if (!isNaN(amount)) {
      onAddPokeDollars(amount);
    }
  };

  const handleAddItem = () => {
    const quantity = parseInt(itemQuantity, 10);
    if (itemIdToAdd && !isNaN(quantity) && quantity > 0) {
      onAddItem(itemIdToAdd, quantity);
    }
  };

  const handleSetLevel = () => {
    const level = parseInt(pokemonLevel, 10);
    if (!isNaN(level)) {
      onSetPokemonLevel(level);
    }
  };

  const handleAddExperience = () => {
    const exp = parseInt(pokemonExperience, 10);
    if (!isNaN(exp)) {
      onAddPokemonExperience(exp);
    }
  };
  
  const handleMoveToArea = () => {
    if (areaToMove) {
        onMoveToArea(areaToMove);
    }
  }

  return (
    <div 
        className="fixed bottom-0 left-0 right-0 nes-panel-modal z-[100] p-2 md:p-3"
        style={{ backgroundColor: 'rgba(30,30,30,0.95)', color: 'white', borderTop: '4px solid #888' }}
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-base md:text-lg text-yellow-400">開発者パネル</h2>
        <button onClick={onToggleDevMode} className="nes-button is-error text-xs py-1">閉じる</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 max-h-[250px] md:max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
        {/* 通貨追加 */}
        <div className="nes-panel bg-gray-700 p-2">
          <label htmlFor="dev-pokedollars" className="nes-text-xs text-gray-300 block mb-0.5">ポケドル追加 ({CURRENCY_SYMBOL}):</label>
          <input 
            type="number" 
            id="dev-pokedollars" 
            value={pokeDollarAmount} 
            onChange={(e) => setPokeDollarAmount(e.target.value)}
            className="nes-input text-black text-xs w-full mb-1"
          />
          <button onClick={handleAddPokeDollars} className="nes-button is-primary text-xs w-full">追加</button>
        </div>

        {/* アイテム追加 */}
        <div className="nes-panel bg-gray-700 p-2">
          <label htmlFor="dev-item" className="nes-text-xs text-gray-300 block mb-0.5">アイテム追加:</label>
          <select 
            id="dev-item" 
            value={itemIdToAdd} 
            onChange={(e) => setItemIdToAdd(e.target.value)}
            className="nes-input text-black text-xs w-full mb-1"
          >
            {allItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <input 
            type="number" 
            value={itemQuantity} 
            onChange={(e) => setItemQuantity(e.target.value)}
            className="nes-input text-black text-xs w-full mb-1"
            placeholder="数量"
          />
          <button onClick={handleAddItem} className="nes-button is-primary text-xs w-full">追加</button>
        </div>

        {/* レベル設定 */}
        <div className="nes-panel bg-gray-700 p-2">
          <label htmlFor="dev-level" className="nes-text-xs text-gray-300 block mb-0.5">現ポケモンのレベル設定:</label>
          <input 
            type="number" 
            id="dev-level" 
            value={pokemonLevel} 
            onChange={(e) => setPokemonLevel(e.target.value)}
            className="nes-input text-black text-xs w-full mb-1"
            disabled={!currentPokemonId}
          />
          <button onClick={handleSetLevel} className="nes-button is-success text-xs w-full" disabled={!currentPokemonId}>設定</button>
        </div>
        
        {/* 経験値追加 */}
        <div className="nes-panel bg-gray-700 p-2">
          <label htmlFor="dev-exp" className="nes-text-xs text-gray-300 block mb-0.5">現ポケモンに経験値追加:</label>
          <input 
            type="number" 
            id="dev-exp" 
            value={pokemonExperience} 
            onChange={(e) => setPokemonExperience(e.target.value)}
            className="nes-input text-black text-xs w-full mb-1"
            disabled={!currentPokemonId}
          />
          <button onClick={handleAddExperience} className="nes-button is-success text-xs w-full" disabled={!currentPokemonId}>追加</button>
        </div>

        {/* 全回復 */}
        <div className="nes-panel bg-gray-700 p-2">
            <label className="nes-text-xs text-gray-300 block mb-0.5">全ポケモン回復:</label>
            <button onClick={onHealAll} className="nes-button is-warning text-xs w-full mt-2">HP/PP全回復</button>
        </div>

        {/* エリア移動 */}
        <div className="nes-panel bg-gray-700 p-2">
            <label htmlFor="dev-area" className="nes-text-xs text-gray-300 block mb-0.5">エリア移動:</label>
            <select 
                id="dev-area" 
                value={areaToMove} 
                onChange={(e) => setAreaToMove(e.target.value)}
                className="nes-input text-black text-xs w-full mb-1"
            >
                {allMapAreas.map(area => <option key={area.id} value={area.id}>{area.name}</option>)}
            </select>
            <button onClick={handleMoveToArea} className="nes-button is-primary text-xs w-full">移動</button>
        </div>
      </div>
    </div>
  );
};