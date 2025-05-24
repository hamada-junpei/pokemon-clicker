/**
 * index.tsx
 *
 * このファイルは、Reactアプリケーションのエントリーポイント（開始地点）です。
 * HTMLファイル（index.html）から呼び出され、<div id="root"></div> の中に
 * Appコンポーネントを描画（表示）する役割を持っています。
 * React 18以降の新しいRoot APIを使用しています。
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // メインのアプリケーションコンポーネントをインポート

// HTML内の 'root' というIDを持つ要素を取得します。ここにReactアプリが描画されます。
const rootElement = document.getElementById('root');
if (!rootElement) {
  // もしroot要素が見つからなければ、エラーを投げて処理を中断します。
  throw new Error("ルート要素が見つかりませんでした。");
}

//取得した要素をルートとしてReactのレンダリングエンジンを作成します。
const root = ReactDOM.createRoot(rootElement);

// Appコンポーネントをレンダリング（描画）します。
// React.StrictModeは開発モード時に潜在的な問題を検出するためのヘルパーです。
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
