import { saveCanvasToImage } from "@/lib/common-methods/SaveCanvasToImage";
import { saveCanvasToBase64 } from "@/lib/common-methods/SaveCanvasToBase64";
import PlugInParameters from "@/lib/main-entrance/PlugInParameters";
import cropBoxStore from "@/store/CropBoxStore";

/**
 * 将指定区域的canvas转为图片
 */
export function getCanvasImgData(isSave: boolean) {
  const plugInParameters = new PlugInParameters();
  const screenShotCanvas = cropBoxStore
    .getScreenShotContainer()
    ?.getContext("2d");
  // 获取裁剪区域位置信息
  const { startX, startY, width, height } = cropBoxStore.cutOutBoxPosition;
  let base64 = "";
  if (screenShotCanvas) {
    if (isSave) {
      // 将canvas转为图片
      saveCanvasToImage(screenShotCanvas, startX, startY, width, height);
    } else {
      // 将canvas转为base64
      base64 = saveCanvasToBase64(
        screenShotCanvas,
        startX,
        startY,
        width,
        height,
        0.75,
        plugInParameters.getWriteImgState()
      );
    }
  }
  return base64;
}
