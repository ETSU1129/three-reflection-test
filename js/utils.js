/**
 * 指定されたCSSセレクターの画像を事前に読み込みます。
 * @function
 * @param {string} [selector='img'] - 対象となる画像のCSSセレクター。
 * @returns {Promise} - 指定されたすべての画像が読み込まれたときに解決されます。
 */

import imagesLoaded from "imagesloaded";

export const preloadImages = (selector = "img") => {
  return new Promise((resolve) => {
    // imagesLoadedライブラリを使用して、すべての画像（背景画像を含む）が完全に読み込まれたことを確認します。
    imagesLoaded(
      document.querySelectorAll(selector),
      { background: true },
      resolve
    );
  });
};
