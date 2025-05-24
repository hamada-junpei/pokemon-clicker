/**
 * FarmModal.tsx
 *
 * このコンポーネントは、農園システムのモーダル表示を担当します。
 * プレイヤーはここでタネを植え、きのみを育て、収穫することができます。
 */
import React, { useState } from 'react';
import { FarmPlotState, BerryData, Item, OwnedItems, ItemCategory } from '../types';
import { ShopModalWrapper } from './ShopModalWrapper';
import { BERRIES, FARM_GROWTH_STAGES, MAX_FARM_PLOTS } from '../constants';

interface FarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmPlots: FarmPlotState[];
  ownedItems: OwnedItems;
  allBerries: BerryData[]; // BERRIES from constants
  allItems: Item[]; // ITEMS from constants
  onPlantSeed: (plotIndex: number, seedItemId: string) => void;
  onHarvestBerry: (plotIndex: number) => void;
  allPlayerPokemonFainted: boolean;
}

export const FarmModal: React.FC<FarmModalProps> = ({
  isOpen,
  onClose,
  farmPlots,
  ownedItems,
  allBerries,
  allItems,
  onPlantSeed,
  onHarvestBerry,
  allPlayerPokemonFainted,
}) => {
  const [selectedPlotIndex, setSelectedPlotIndex] = useState<number | null>(null);
  const [showSeedSelection, setShowSeedSelection] = useState<boolean>(false);

  const availableSeeds = allItems.filter(item =>
    item.category === ItemCategory.SEED && (ownedItems[item.id] || 0) > 0
  );

  const handlePlotClick = (index: number) => {
    if (allPlayerPokemonFainted) return;
    const plot = farmPlots[index];
    if (plot.isHarvestable) {
      onHarvestBerry(index);
    } else if (!plot.plantedBerryId) {
      setSelectedPlotIndex(index);
      setShowSeedSelection(true);
    }
  };

  const handleSeedSelect = (seedItemId: string) => {
    if (selectedPlotIndex !== null) {
      onPlantSeed(selectedPlotIndex, seedItemId);
    }
    setShowSeedSelection(false);
    setSelectedPlotIndex(null);
  };

  const getPlotDisplay = (plot: FarmPlotState) => {
    if (plot.isHarvestable && plot.plantedBerryId) {
      const berry = allBerries.find(b => b.id === plot.plantedBerryId);
      return { text: `収穫OK! (${berry?.name || ''})`, icon: berry?.icon || '🧺' };
    }
    if (plot.plantedBerryId && plot.growthStage > 0) {
      const berry = allBerries.find(b => b.id === plot.plantedBerryId);
      const stageName = berry?.growthStageNames[plot.growthStage -1] || `成長中 ${plot.growthStage}`;
      const stageIcon = berry?.growthStageImages[plot.growthStage -1] || '⏳';
      return { text: `${stageName}`, icon: stageIcon };
    }
    return { text: '空き地', icon: '🕳️' };
  };


  return (
    <ShopModalWrapper isOpen={isOpen} onClose={onClose} title="マイ農園">
      <div className="nes-panel bg-green-50 p-2">
        {allPlayerPokemonFainted && (
          <p className="text-center text-red-600 font-semibold mb-2 nes-text-sm">
            ポケモンが全員ひんしのため、農園作業はできません。
          </p>
        )}
        <p className="nes-text-xs text-right mb-1">プロット: {farmPlots.length} / {MAX_FARM_PLOTS}</p>
        <div className="grid grid-cols-3 gap-2">
          {farmPlots.map((plot, index) => {
            const display = getPlotDisplay(plot);
            const berry = plot.plantedBerryId ? allBerries.find(b => b.id === plot.plantedBerryId) : null;
            return (
              <button
                key={index}
                className={`nes-button flex flex-col items-center justify-center aspect-square p-1
                  ${plot.isHarvestable ? 'is-success' : plot.plantedBerryId ? 'is-primary' : 'is-disabled'}
                  ${allPlayerPokemonFainted && 'opacity-70 cursor-not-allowed'}
                `}
                onClick={() => handlePlotClick(index)}
                disabled={allPlayerPokemonFainted && !plot.isHarvestable}
                title={berry ? `${berry.name} (${display.text})` : display.text}
              >
                <span className="text-2xl md:text-3xl mb-0.5">{display.icon}</span>
                <span className="nes-text-2xs text-center truncate w-full">{display.text}</span>
              </button>
            );
          })}
        </div>

        {showSeedSelection && selectedPlotIndex !== null && (
          <div className="mt-3 nes-panel bg-yellow-50 p-2">
            <h4 className="nes-text-sm font-semibold text-center mb-1 text-yellow-700">
              プロット {selectedPlotIndex + 1} に植えるタネを選んでください:
            </h4>
            {availableSeeds.length > 0 ? (
              <ul className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar pr-1">
                {availableSeeds.map(seed => (
                  <li key={seed.id}>
                    <button
                      className="nes-button is-warning w-full text-xs"
                      onClick={() => handleSeedSelect(seed.id)}
                    >
                      {seed.icon} {seed.name} (所持: {ownedItems[seed.id]})
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="nes-text-xs text-center text-gray-600">植えられるタネがありません。</p>
            )}
            <button
              className="nes-button is-normal w-full text-xs mt-2"
              onClick={() => {
                setShowSeedSelection(false);
                setSelectedPlotIndex(null);
              }}
            >
              キャンセル
            </button>
          </div>
        )}
      </div>
    </ShopModalWrapper>
  );
};