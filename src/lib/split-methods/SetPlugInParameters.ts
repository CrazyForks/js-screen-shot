import { screenShotType } from "@/lib/type/ComponentType";
import userParamStore from "@/store/UserParamStore";

// 为插件的全局参数设置数据
export function setPlugInParameters(options: screenShotType) {
  if (!options) return;

  const {
    x = 0,
    y = 0,
    enableWebRtc = true,
    screenFlow,
    canvasWidth,
    canvasHeight,
    showScreenData = false,
    maskColor,
    writeBase64 = true,
    screenShotDom,
    cutBoxBdColor,
    saveCallback,
    maxUndoNum,
    useRatioArrow,
    imgAutoFit,
    useCustomImgSize,
    customImgSize,
    saveImgTitle,
    destroyContainer = true,
    userToolbar,
    h2cImgLoadErrCallback,
    canvasEvents
  } = options;

  const setters: { [key: string]: () => void } = {
    enableWebRtc: () => {
      if (!enableWebRtc) {
        userParamStore.setWebRtcStatus(false);
      }
    },
    screenFlow: () => {
      if (screenFlow instanceof MediaStream) {
        userParamStore.setScreenFlow(screenFlow);
      }
    },
    canvasSize: () => {
      if (canvasWidth && canvasHeight) {
        userParamStore.setCanvasSize(canvasWidth, canvasHeight);
      }
    },
    showScreenData: () => {
      if (showScreenData) {
        userParamStore.setShowScreenDataStatus(true);
      }
    },
    maskColor: () => {
      if (maskColor && typeof maskColor === "object") {
        userParamStore.setMaskColor(maskColor);
      }
    },
    writeBase64: () => {
      if (!writeBase64) {
        userParamStore.setWriteImgState(false);
      }
    },
    screenShotDom: () => {
      if (screenShotDom) {
        userParamStore.setScreenShotDom(screenShotDom);
      }
    },

    cutBoxBdColor: () => {
      if (cutBoxBdColor) {
        userParamStore.setCutBoxBdColor(cutBoxBdColor);
      }
    },
    saveCallback: () => {
      if (saveCallback) {
        userParamStore.setSaveCallback(saveCallback);
      }
    },
    maxUndoNum: () => {
      if (maxUndoNum !== undefined) {
        userParamStore.setMaxUndoNum(maxUndoNum);
      }
    },
    useRatioArrow: () => {
      if (useRatioArrow) {
        userParamStore.setRatioArrow(useRatioArrow);
      }
    },
    imgAutoFit: () => {
      if (imgAutoFit) {
        userParamStore.setImgAutoFit(imgAutoFit);
      }
    },
    useCustomImgSize: () => {
      if (useCustomImgSize && customImgSize) {
        userParamStore.setUseCustomImgSize(useCustomImgSize, customImgSize);
      }
    },
    saveImgTitle: () => {
      if (saveImgTitle) {
        userParamStore.setSaveImgTitle(saveImgTitle);
      }
    },
    destroyContainer: () => {
      if (!destroyContainer) {
        console.log("状态设置", destroyContainer);
        userParamStore.setDestroyContainerState(false);
      }
    },
    userToolbar: () => {
      if (userToolbar) {
        userParamStore.setUserToolbar(userToolbar);
      }
    },
    h2cImgLoadErrCallback: () => {
      if (h2cImgLoadErrCallback) {
        userParamStore.setH2cCrossImgLoadErrFn(h2cImgLoadErrCallback);
      }
    },
    canvasEvents: () => {
      if (canvasEvents) {
        userParamStore.setCanvasEvents(canvasEvents);
      }
    },
    renderOptions: ()=>{
      userParamStore.setRenderOptions(x,y)
    }
  };

  // 执行所有设置函数
  Object.values(setters).forEach(setter => setter());
}
