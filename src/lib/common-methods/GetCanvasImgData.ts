import { saveCanvasToImage } from "@/lib/common-methods/SaveCanvasToImage";
import { saveCanvasToBase64 } from "@/lib/common-methods/SaveCanvasToBase64";

import cropBoxStore from "@/store/CropBoxStore";
import userParamStore from "@/store/UserParamStore";
import componentDomStore from "@/store/ComponentDomStore";

/**
 * 将指定区域的canvas转为图片
 */
export function getCanvasImgData(isSave: boolean) {
  const screenShotCanvas = componentDomStore.screenShotController?.getContext(
    "2d"
  );
  // 获取裁剪区域位置信息
  const { startX, startY, width, height } = cropBoxStore.cutOutBoxPosition;
  let base64 = "";
  if (screenShotCanvas) {
    if (isSave) {
      // 将canvas转为图片
      saveCanvasToImage(screenShotCanvas, startX, startY, width, height);
    }
    // 将canvas转为base64
    base64 = saveCanvasToBase64(
      screenShotCanvas,
      startX,
      startY,
      width,
      height,
      0.75,
      userParamStore.writeBase64
    );
  }
  return base64;
}
