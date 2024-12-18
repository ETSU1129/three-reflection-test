// 画像をインポートする関数を読み込む
import { preloadImages } from "./utils.js";

// DOM要素を取得する
const workNav = document.querySelector(".frame__works"); // ナビゲーション全体
const workLinks = [...workNav.querySelectorAll("a")]; // ナビゲーション内のリンク要素aタグを取ってくる

const title = document.querySelector(".frame__title-main"); // タイトル要素
const bgImageElements = [...document.querySelectorAll(".background__image")]; // 背景画像要素
const video = document.querySelector(".background__video"); // 背景ビデオ要素

/**
 * 方向属性に基づいてクリップパス（clip-path）の値を計算する関数。
 * コンテンツ画像を表示する際のアニメーション効果を制御する。
 * @param {HTMLElement} imageElement - コンテンツ画像の要素
 * @returns {Object} - from（開始状態）とto（終了状態）のclip-path値
 */
const getClipPath = (imageElement) => {
  // 方向ごとにclip-pathのポリゴン値をマッピングする
  const clipPathDirections = {
    right: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)", // 右方向（左から右に表示）
    left: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)", // 左方向（右から左に表示）
    top: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)", // 上方向（下から上に表示）
    bottom: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)", // 下方向（上から下に表示）
  };

  // データ属性'data-dir'から画像要素の表示方向を取得する
  const imageDirection = imageElement.dataset.dir;

  // 方向に応じたclip-path値を返す（不明な場合はデフォルト）
  return {
    from:
      clipPathDirections[imageDirection] || // 指定された方向のclip-path
      "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", // デフォルトの完全表示clip-path
    to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", // 完全に表示される状態
  };
};

/**
 * マウスイベントに基づいてコンテンツの表示/非表示を切り替える関数。
 * @param {Event} event - マウスイベントオブジェクト
 * @param {Boolean} isShowing - true: コンテンツ表示, false: 非表示
 */

const toggleWork = (event, isShowing) => {
  // 対象リンクのhref属性から関連するコンテンツ要素を取得する
  const href = event.target.getAttribute("href");
  const contentElement = document.querySelector(href);

  // data-bg属性から背景要素のIDを取得し、該当する背景要素を取得
  const bgId = contentElement.dataset.bg;
  const bgElement = document.querySelector(`#${bgId}`);

  // コンテンツ要素内のタイトルと画像要素を取得
  const contentTitle = contentElement.querySelector(".content__title");
  const contentImages = [...contentElement.querySelectorAll(".content__img")];
  const contentInnerImages = [
    ...contentElement.querySelectorAll(".content__img-inner"),
  ];

  // 進行中のアニメーションがある場合はキャンセル
  if (event.target.tlEnter) event.target.tlEnter.kill();
  if (event.target.tlLeave) event.target.tlLeave.kill();

  if (isShowing) {
    // コンテンツ表示時のアニメーション

    // z-indexを1に設定して要素を最前面に表示
    gsap.set(contentElement, { zIndex: 1 });
    contentElement.classList.add("content--current");

    // 表示アニメーションの設定
    event.target.tlEnter = gsap
      .timeline({ defaults: { duration: 0.95, ease: "power4" } })
      .set(bgElement, { opacity: 1 })
      .fromTo(
        contentTitle,
        { opacity: 0, scale: 0.9 }, // 開始状態
        { opacity: 1, scale: 1 }, // 終了状態
        0
      )
      .fromTo(
        contentImages,
        {
          xPercent: () => gsap.utils.random(-10, 10),
          yPercent: () => gsap.utils.random(-10, 10),
          filter: "brightness(300%)",
          clipPath: (index, target) => getClipPath(target).from,
        },
        {
          xPercent: 0,
          yPercent: 0,
          filter: "brightness(100%)",
          clipPath: (index, target) => getClipPath(target).to,
        },
        0
      )
      .fromTo(contentInnerImages, { scale: 1.5 }, { scale: 1 }, 0);
  } else {
    // コンテンツ非表示時のアニメーション

    gsap.set(contentElement, { zIndex: 0 });

    event.target.tlLeave = gsap
      .timeline({
        defaults: { duration: 0.95, ease: "power4" },
        onComplete: () => contentElement.classList.remove("content--current"),
      })
      .set(bgElement, { opacity: 0 }, 0.05)
      .to(contentTitle, { opacity: 0 }, 0)
      .to(
        contentImages,
        { clipPath: (index, target) => getClipPath(target).from },
        0
      )
      .to(contentInnerImages, { scale: 1.5 }, 0);
  }
};

// workリンクにマウスが乗ったときのイベント関数
const showWork = (event) => toggleWork(event, true);

// workリンクからマウスが外れたときのイベント関数
const hideWork = (event) => toggleWork(event, false);

/**
 * ナビゲーションのホバーエフェクトおよびタイトル/ビデオのフェード処理を初期化する
 */
/**
 * ナビゲーションのクリックエフェクトおよびタイトル/ビデオのフェード処理を初期化する
 */
const initEvents = () => {
  let currentElement = null; // 現在表示中の要素を保持する変数

  workLinks.forEach((element) => {
    // workリンクがクリックされたときのイベント
    element.addEventListener("click", (event) => {
      event.preventDefault(); // デフォルトのリンク動作を防ぐ

      // 以前表示していた要素があれば非表示にする
      if (currentElement && currentElement !== element) {
        hideWork({ target: currentElement }); // 非表示アニメーションを実行
      }

      // クリックされた要素を表示
      if (currentElement === element) {
        hideWork(event); // 同じ要素をクリックしたら非表示
        currentElement = null; // 現在表示中の要素をリセット
      } else {
        showWork(event); // 表示アニメーションを実行
        currentElement = element; // 現在の要素を保持
      }
    });
  });

  // ナビゲーションクリック時にタイトルをフェードアウト
  workNav.addEventListener("click", () => {
    gsap.killTweensOf([title]);
    gsap.to([title], { duration: 0.6, ease: "power4", opacity: 0 });
  });
};

/**
 * 画像プリロードが完了した後にアプリケーションを初期化する
 */
const init = () => {
  initEvents();
};

// 画像プリロードが完了したら初期化関数を呼び出す
preloadImages(".content__img-inner").then(() => {
  document.body.classList.remove("loading"); // ローディングクラスを削除
  init(); // 初期化開始
});
