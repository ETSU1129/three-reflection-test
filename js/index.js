//画像をインポート
import { preloadImages } from "./utils.js";

//Domを取得
const workNav = document.querySelector(".frame__works");
const workLinks = [...workNav.querySelectorAll("a")];

const title = document.querySelector(".frame__title-main");
const bgImageElements = [...document.querySelectorAll(".background__image")];
const video = document.querySelector(".background__video");

// 方向属性に基づいてクリップパスの値を計算する関数
const getClipPath = (imageElement) => {
  // 方向を対応するクリップパスのポリゴン値にマッピングする
  const clipPathDirections = {
    right: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)", // 右方向
    left: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)", // 左方向
    top: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)", // 上方向
    bottom: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)", // 下方向
  };
  // コンテンツ画像をどの方向にアニメーションさせるかを示す方向
  const imageDirection = imageElement.dataset.dir;

  // 方向を使用して対応するクリップパスの値を取得し、方向が不明な場合は完全に表示されるようにデフォルト設定する
  const clipPath = {
    from:
      clipPathDirections[imageDirection] ||
      "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", // デフォルトのクリップパス
    to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", // 完全に表示されるクリップパス
  };
  return clipPath;
};

// マウスイベントに基づいてコンテンツの表示を切り替えるユーティリティ関数
const toggleWork = (event, isShowing) => {
  // ターゲットリンクのhref属性を取得して、表示/非表示にするコンテンツを特定する
  const href = event.target.getAttribute("href");
  const contentElement = document.querySelector(href);

  // data-bg属性を使用して対応する背景要素を見つける
  const bgId = contentElement.dataset.bg;
  const bgElement = document.querySelector(`#${bgId}`);

  // コンテンツ要素内のタイトルと画像を選択する
  const contentTitle = contentElement.querySelector(".content__title");
  const contentImages = [...contentElement.querySelectorAll(".content__img")];
  const contentInnerImages = [
    ...contentElement.querySelectorAll(".content__img-inner"),
  ];

  // 競合を避けるために進行中のアニメーションをキャンセルする
  if (event.target.tlEnter) {
    event.target.tlEnter.kill();
  }
  if (event.target.tlLeave) {
    event.target.tlLeave.kill();
  }

  // コンテンツを表示するか非表示にするかをチェックする
  if (isShowing) {
    // コンテンツ要素を表示し、他の要素の上に配置する
    gsap.set(contentElement, { zIndex: 1 });
    contentElement.classList.add("content--current");

    // コンテンツを表示するためのアニメーションを作成して再生する
    event.target.tlEnter = gsap
      .timeline({
        defaults: {
          duration: 0.95,
          ease: "power4",
        },
      })
      .set(bgElement, { opacity: 1 })
      .fromTo(
        contentTitle,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1 },
        0
      )
      .fromTo(
        contentImages,
        {
          xPercent: () => gsap.utils.random(-10, 10),
          yPercent: () => gsap.utils.random(-10, 10),
          filter: "brightness(300%)",
          clipPath: (index, target) => getClipPath(target)["from"],
        },
        {
          xPercent: 0,
          yPercent: 0,
          filter: "brightness(100%)",
          clipPath: (index, target) => getClipPath(target)["to"],
        },
        0
      )
      .fromTo(contentInnerImages, { scale: 1.5 }, { scale: 1 }, 0);
  } else {
    // z-indexをリセットし、コンテンツ要素を非表示にする準備をする
    gsap.set(contentElement, { zIndex: 0 });

    // コンテンツを非表示にするためのアニメーションを作成して再生する
    event.target.tlLeave = gsap
      .timeline({
        defaults: {
          duration: 0.95,
          ease: "power4",
        },
        onComplete: () => {
          // アニメーションが完了したら表示クラスを削除する
          contentElement.classList.remove("content--current");
        },
      })
      .set(bgElement, { opacity: 0 }, 0.05)
      .to(contentTitle, { opacity: 0 }, 0)
      .to(
        contentImages,
        { clipPath: (index, target) => getClipPath(target)["from"] },
        0
      )
      .to(contentInnerImages, { scale: 1.5 }, 0);
  }
};
// Function to handle the mouseenter event on work links
const showWork = (event) => {
  // Call toggleWork with true to show the content
  toggleWork(event, true);
};

// Function to handle the mouseleave event on work links
const hideWork = (event) => {
  // Call toggleWork with false to hide the content
  toggleWork(event, false);
};

// ナビゲーションのホバーエフェクトとビデオのフェードイン/アウトを初期化する
const initEvents = () => {
  workLinks.forEach((workLink) => {
    let hoverTimer; // タイムアウトを保持する変数を宣言
    workLink.addEventListener("mouseenter", (event) => {
      // ホバーエフェクトを遅延させるためにタイムアウトを設定
      hoverTimer = setTimeout(() => showWork(event), 30); // ホバーエフェクトを30ms遅延させる
    });

    workLink.addEventListener("mouseleave", (event) => {
      // 遅延が終わる前にマウスが離れた場合、タイムアウトをクリア
      clearTimeout(hoverTimer);
      // 即座にhideWork関数をトリガー
      hideWork(event);
    });
  });

  // ナビゲーション上にホバーしたときにビデオ/タイトルをフェードアウト
  workNav.addEventListener("mouseenter", () => {
    gsap.killTweensOf([video, title]);
    gsap.to([video, title], {
      duration: 0.6,
      ease: "power4",
      opacity: 0,
    });
  });
  // ナビゲーション上にホバーしていないときにビデオ/タイトルをフェードイン
  workNav.addEventListener("mouseleave", () => {
    gsap.killTweensOf([video, title]);
    gsap.to([video, title], {
      duration: 0.6,
      ease: "sine.in",
      opacity: 1,
    });
  });
};

// 画像がプリロードされた後にアプリを初期化する
const init = () => {
  initEvents();
};

// 画像のプリロードが完了した後に初期化を開始する
preloadImages(".content__img-inner").then(() => {
  document.body.classList.remove("loading");
  init();
});
