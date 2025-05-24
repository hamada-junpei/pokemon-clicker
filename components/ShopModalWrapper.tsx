/**
 * ShopModalWrapper.tsx
 *
 * このコンポーネントは、ショップやその他の情報表示に使用できる汎用的なモーダルラッパーです。
 * タイトル、閉じるボタン、そして子要素として渡されたコンテンツを表示します。
 */
import React from 'react';

interface ShopModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const ShopModalWrapper: React.FC<ShopModalWrapperProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 modal-backdrop flex items-center justify-center z-40 p-2" // z-40 to be below Pokedex/PokemonSelection (z-50) if they are ever open simultaneously
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shop-modal-title"
    >
      <div
        className="nes-panel-modal w-full max-w-md max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center nes-header">
          <h2 id="shop-modal-title" className="text-lg">{title}</h2>
          <button
            onClick={onClose}
            className="nes-close-button"
            aria-label={`${title} モーダルを閉じる`}
          >
            &times;
          </button>
        </div>
        <div className="nes-content-scrollable custom-scrollbar flex-grow p-2">
          {children}
        </div>
      </div>
    </div>
  );
};
