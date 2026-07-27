// 渲染资产单例：封面图 / 背景视频（rAF 渲染循环直接读取，不走 React 状态）
export const renderAssetsStore: {
  coverImage: HTMLImageElement | null;
  bgVideo: HTMLVideoElement | null;
} = {
  coverImage: null,
  bgVideo: null,
};

/** 加载图片 URL → HTMLImageElement */
export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = url;
  });
}
