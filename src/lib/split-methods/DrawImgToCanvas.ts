export function drawImgToCanvas(
  imgSrc: string,
  width: number,
  height: number,
  dpr: number
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const canvasElement = document.createElement("canvas");
    const ctx = canvasElement.getContext("2d");
    canvasElement.width = width * dpr;
    canvasElement.height = height * dpr;
    // 设置canvas的显示大小
    canvasElement.style.width = `${width}px`;
    canvasElement.style.height = `${height}px`;
    const imgContainer = new Image();
    imgContainer.src = imgSrc;
    imgContainer.width = width;
    imgContainer.height = height;
    imgContainer.crossOrigin = "Anonymous";
    imgContainer.onload = () => {
      if (ctx == null) {
        reject("图像绘制失败");
        return;
      }
      ctx.scale(dpr, dpr);
      ctx.drawImage(imgContainer, 0, 0, width, height);
      resolve(canvasElement);
    };
  });
}
