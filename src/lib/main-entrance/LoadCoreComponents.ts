// 注册右键事件
import userParamStore from "@/store/UserParamStore";
import componentDomStore from "@/store/ComponentDomStore";
import { getCanvas2dCtx } from "@/lib/common-methods/CanvasPatch";
import toolBarStore from "@/store/ToolBarStore";
import textInputStore from "@/store/TextInputStore";
import { drawText } from "@/lib/split-methods/DrawText";
import { addHistory } from "@/lib/split-methods/AddHistoryData";
import screenShotCanvasStore from "@/store/ScreenShotCanvasStore";
import { calculateToolLocation } from "@/lib/split-methods/CalculateToolLocation";
import cropBoxStore from "@/store/CropBoxStore";
import {
  mouseEventFnType,
  positionInfoType,
  toolPositionValType
} from "@/lib/type/ComponentType";
import { drawMasking } from "@/lib/split-methods/DrawMasking";
import { isPC, isTouchDevice } from "@/lib/common-methods/DeviceTypeVerif";
import { drawCutOutBox } from "@/lib/split-methods/DrawCutOutBox";
import { saveBorderArrInfo } from "@/lib/common-methods/SaveBorderArrInfo";
import drawingDataStore from "@/store/DrawingDataStore";
import html2canvas from "html2canvas";
import { drawCrossImg } from "@/lib/split-methods/drawCrossImg";

const registerForRightClickEvent = (container: HTMLElement) => {
  container.addEventListener("contextmenu", e => {
    e.preventDefault();
    // 调用者传入了自定义事件则执行
    if (userParamStore.customRightClickEvent.handleFn) {
      userParamStore.customRightClickEvent.handleFn();
      return;
    }
    // 销毁组件
    componentDomStore.destroyDOM();
  });
};

/**
 * 从窗口数据流中截取页面body内容
 * @param videoWidth 窗口宽度
 * @param videoHeight 窗口高度
 * @param containerWidth body内容宽度
 * @param containerHeight body内容高度
 * @param dpr
 * @private
 */
const getWindowContentData = (
  videoWidth: number,
  videoHeight: number,
  containerWidth: number,
  containerHeight: number,
  dpr: number
) => {
  const videoCanvas = document.createElement("canvas");
  videoCanvas.width = videoWidth;
  videoCanvas.height = videoHeight;
  const videoContext = getCanvas2dCtx(videoCanvas, videoWidth, videoHeight);
  if (videoContext && componentDomStore.videoController) {
    videoContext.drawImage(componentDomStore.videoController, 0, 0);
    const startX = 0;
    const startY = videoHeight - containerHeight;
    const width = containerWidth;
    const height = videoHeight - startY;
    // 获取裁剪框区域图片信息;
    return videoContext.getImageData(
      startX * dpr,
      startY * dpr,
      width * dpr,
      height * dpr
    );
  }
  return null;
};

// 为指定容器绑定快捷键
const registerContainerShortcuts = (
  container: HTMLElement,
  textInputPosition: { mouseX: number; mouseY: number }
) => {
  container.addEventListener("keydown", (event: KeyboardEvent) => {
    if (screenShotCanvasStore.screenShotCanvas == null) return;
    // command/ctrl + enter 将输入框的文字绘制到画布内
    // 按下ESC时如果有内容则绘制
    if (
      ((event.metaKey || event.ctrlKey) && event.code === "Enter") ||
      event.code === "Escape"
    ) {
      toolBarStore.setTextEditState(true);
      const text = container.innerText;
      if (!text || text === "") {
        // 隐藏输入框
        textInputStore.setTextStatus(false);
        return;
      }
      drawText(
        text,
        textInputPosition.mouseX,
        textInputPosition.mouseY,
        toolBarStore.selectedColor,
        toolBarStore.fontSize,
        screenShotCanvasStore.screenShotCanvas
      );
      // 清空文本输入区域的内容
      container.innerHTML = "";
      // 隐藏输入框
      textInputStore.setTextStatus(false);
      // 保存绘制记录
      addHistory();
    }
  });
};

/**
 *
 * @param drawGraphPosition
 * @param dpr
 * @param placement 工具栏的展示位置
 * @param getFullScreenStatus
 * @param fullScreenDiffHeight
 */
const showToolBar = (
  drawGraphPosition: positionInfoType,
  dpr: number,
  placement: toolPositionValType,
  getFullScreenStatus: boolean,
  fullScreenDiffHeight = 60
) => {
  if (
    componentDomStore.toolController == null ||
    componentDomStore.screenShotController == null
  )
    return;
  // 计算截图工具栏位置
  const toolLocation = calculateToolLocation(
    drawGraphPosition,
    componentDomStore.toolController.offsetWidth,
    componentDomStore.screenShotController.width / dpr,
    placement,
    userParamStore.position
  );
  const containerHeight = componentDomStore.screenShotController.height / dpr;

  // 工具栏的位置超出截图容器时，调整工具栏位置防止超出
  if (toolLocation.mouseY > containerHeight - 64) {
    toolLocation.mouseY -= drawGraphPosition.height + 64;
    // 超出屏幕顶部时
    if (toolLocation.mouseY < 0) {
      const containerHeight = parseInt(
        componentDomStore.screenShotController.style.height
      );
      toolLocation.mouseY = containerHeight - fullScreenDiffHeight;
    }
    // 设置工具栏超出状态为true
    toolBarStore.setToolPositionStatus(true);
    // 隐藏裁剪框尺寸显示容器
    cropBoxStore.setCutBoxSizeStatus(false);
  }

  // 当前截取的是全屏，则修改工具栏的位置到截图容器最底部，防止超出
  if (getFullScreenStatus) {
    const containerHeight = parseInt(
      componentDomStore.screenShotController.style.height
    );
    // 重新计算工具栏的x轴位置
    const toolPositionX =
      (drawGraphPosition.width - componentDomStore.toolController.offsetWidth) /
      2;
    toolLocation.mouseY = containerHeight - fullScreenDiffHeight;
    toolLocation.mouseX = toolPositionX;
  }

  // 显示并设置截图工具栏位置
  toolBarStore.setToolInfo(
    toolLocation.mouseX + userParamStore.position.left,
    toolLocation.mouseY + userParamStore.position.top
  );

  // 设置裁剪框尺寸显示容器位置
  cropBoxStore.setCutBoxSizePosition(
    drawGraphPosition.startX,
    drawGraphPosition.startY - 35
  );
  // 渲染裁剪框尺寸
  cropBoxStore.setCutBoxSize(drawGraphPosition.width, drawGraphPosition.height);
  // 状态重置
  drawingDataStore.updateFullScreenStatus(false);
};

/**
 * 初始化截图容器
 * @param triggerCallback
 * @param context
 * @param screenShotImgDataSource
 * @param mouseEventFn
 * @private
 */
const initScreenShot = (
  triggerCallback: Function | undefined,
  context: CanvasRenderingContext2D,
  screenShotImgDataSource: HTMLCanvasElement,
  mouseEventFn: mouseEventFnType
) => {
  if (triggerCallback != null) {
    // 加载成功，执行回调函数
    triggerCallback({ code: 0, msg: "截图加载完成" });
  }
  // 更新store中的截图区域canvas画布
  screenShotCanvasStore.updateScreenShotCanvas(context);
  // 存储屏幕截图
  screenShotCanvasStore.setImageController(screenShotImgDataSource);

  // 绘制蒙层
  drawMasking(context, screenShotImgDataSource);
  // 截图容器添加鼠标点击/触摸事件的监听
  setScreenShotContainerEventListener(
    mouseEventFn.mouseDownEvent,
    mouseEventFn.mouseMoveEvent,
    mouseEventFn.mouseUpEvent
  );
  // 是否初始化裁剪框
  if (
    userParamStore.cropBoxInfo != null &&
    Object.keys(userParamStore.cropBoxInfo).length == 4
  ) {
    initCropBox(userParamStore.cropBoxInfo, screenShotImgDataSource);
  }
};

// 为截图容器添加鼠标||触摸的事件监听
const setScreenShotContainerEventListener = (
  mouseDownEvent: mouseEventFnType["mouseDownEvent"],
  mouseMoveEvent: mouseEventFnType["mouseMoveEvent"],
  mouseUpEvent: mouseEventFnType["mouseUpEvent"]
) => {
  if (isPC()) {
    // 添加鼠标事件监听
    componentDomStore.screenShotController?.addEventListener(
      "mousedown",
      mouseDownEvent
    );
    componentDomStore.screenShotController?.addEventListener(
      "mousemove",
      mouseMoveEvent
    );
    componentDomStore.screenShotController?.addEventListener(
      "mouseup",
      mouseUpEvent
    );
  }
  // 设备不支持触摸事件则退出
  if (!isTouchDevice()) return;
  // 设置触摸监听
  componentDomStore.screenShotController?.addEventListener(
    "touchstart",
    mouseDownEvent,
    false
  );
  componentDomStore.screenShotController?.addEventListener(
    "touchmove",
    mouseMoveEvent,
    false
  );
  componentDomStore.screenShotController?.addEventListener(
    "touchend",
    mouseUpEvent,
    false
  );
};

// 初始化裁剪框
const initCropBox = (
  cropBoxInfo: {
    x: number;
    y: number;
    w: number;
    h: number;
  },
  screenShotImageController: HTMLCanvasElement
) => {
  const startX = cropBoxInfo.x;
  const startY = cropBoxInfo.y;
  const width = cropBoxInfo.w;
  const height = cropBoxInfo.h;
  if (componentDomStore.screenShotController == null) return;
  cropBoxStore.updateDrawGraphPosition(startX, startY, width, height);
  cropBoxStore.setCutOutBoxPosition(startX, startY, width, height);
  drawCutOutBox(
    startX,
    startY,
    width,
    height,
    screenShotCanvasStore.screenShotCanvas as CanvasRenderingContext2D,
    cropBoxStore.borderSize,
    componentDomStore.screenShotController,
    screenShotImageController
  );
  // 保存边框节点信息
  drawingDataStore.updateCutOutBoxBorderArr(
    saveBorderArrInfo(cropBoxStore.borderSize, cropBoxStore.drawGraphPosition)
  );
  // 修改鼠标状态为拖动
  componentDomStore.screenShotController.style.cursor = "move";
  // 显示截图工具栏
  toolBarStore.setToolStatus(true);
  // 显示裁剪框尺寸显示容器
  cropBoxStore.setCutBoxSizeStatus(true);
  if (componentDomStore.toolController != null) {
    // 渲染截图工具栏
    showToolBar(
      cropBoxStore.drawGraphPosition,
      drawingDataStore.dpr,
      userParamStore.toolPosition,
      drawingDataStore.getFullScreenStatus
    );
  }
};

const setScreenShotContainerSize = (
  screenShotImageController: HTMLCanvasElement
) => {
  const canvasSize = userParamStore.getCanvasSize();
  const viewSize = {
    width: parseFloat(window.getComputedStyle(document.body).width),
    height: parseFloat(window.getComputedStyle(document.body).height)
  };
  // 设置截图区域canvas宽高
  screenShotCanvasStore.setScreenShotInfo(viewSize.width, viewSize.height);
  // 设置截图容器位置
  screenShotCanvasStore.setScreenShotPosition(
    userParamStore.position.left,
    userParamStore.position.top
  );
  // 设置截图图片存放容器宽高
  screenShotImageController.width = viewSize.width;
  screenShotImageController.height = viewSize.height;
  // 用户有传宽高则使用用户传进来的
  if (canvasSize.canvasWidth !== 0 && canvasSize.canvasHeight !== 0) {
    screenShotCanvasStore.setScreenShotInfo(
      canvasSize.canvasWidth,
      canvasSize.canvasHeight
    );
    screenShotImageController.width = canvasSize.canvasWidth;
    screenShotImageController.height = canvasSize.canvasHeight;
  }
};

// 隐藏光标的辅助dom
const getTopEl = () => {
  let topEl = document.createElement("div");
  topEl.style.cssText = `position: fixed;top: 0;left: 0;width: ${innerWidth}px;height: ${innerHeight}px;z-index: 9999;cursor: none;`;
  return topEl;
};

const wrcScreenShot = (
  cancelCallback: Function | undefined,
  triggerCallback: Function | undefined,
  screenShotImageController: HTMLCanvasElement,
  mouseEventFn: mouseEventFnType
) => {
  // 隐藏光标

  // 开始捕捉屏幕
  startCapture(cancelCallback, screenShotImageController).then(() => {
    let topEl = getTopEl();
    document.body.appendChild(topEl);
    loadScreenFlowData(
      triggerCallback,
      screenShotImageController,
      mouseEventFn,
      topEl
    );
  });
};

const loadScreenFlowData = (
  triggerCallback: Function | undefined,
  screenShotImageController: HTMLCanvasElement,
  mouseEventFn: mouseEventFnType,
  topEl: HTMLDivElement
) => {
  setTimeout(() => {
    topEl.remove();
    // 获取截图区域canvas容器画布
    if (componentDomStore.screenShotController == null) return;
    const canvasSize = userParamStore.getCanvasSize();
    let containerWidth = screenShotImageController?.width;
    let containerHeight = screenShotImageController?.height;
    // 用户有传宽高时，则使用用户的
    if (canvasSize.canvasWidth !== 0 && canvasSize.canvasHeight !== 0) {
      containerWidth = canvasSize.canvasWidth;
      containerHeight = canvasSize.canvasHeight;
    }
    let imgContainerWidth = containerWidth;
    let imgContainerHeight = containerHeight;
    if (userParamStore.wrcWindowMode) {
      imgContainerWidth = containerWidth * drawingDataStore.dpr;
      imgContainerHeight = containerHeight * drawingDataStore.dpr;
    }
    const context = getCanvas2dCtx(
      componentDomStore.screenShotController,
      containerWidth,
      containerHeight
    );
    const imgContext = getCanvas2dCtx(
      screenShotImageController,
      imgContainerWidth,
      imgContainerHeight
    );
    if (
      context == null ||
      imgContext == null ||
      componentDomStore.videoController == null
    )
      return;
    // 更新store中的截图区域canvas画布
    screenShotCanvasStore.updateScreenShotCanvas(context);
    const { videoWidth, videoHeight } = componentDomStore.videoController;
    if (userParamStore.wrcWindowMode) {
      // 从窗口视频流中获取body内容
      const bodyImgData = getWindowContentData(
        videoWidth,
        videoHeight,
        containerWidth * drawingDataStore.dpr,
        containerHeight * drawingDataStore.dpr,
        drawingDataStore.dpr
      );
      if (bodyImgData == null) return;
      // 将body内容绘制到图片容器里
      imgContext.putImageData(bodyImgData, 0, 0);
    } else {
      // 对webrtc源提供的图像宽高进行修复
      let fixWidth = containerWidth;
      let fixHeight = (videoHeight * containerWidth) / videoWidth;
      if (fixHeight > containerHeight) {
        fixWidth = (containerWidth * containerHeight) / fixHeight;
        fixHeight = containerHeight;
      }
      // 对视频容器的内容进行裁剪
      fixWidth =
        userParamStore.wrcImgPosition.w > 0
          ? userParamStore.wrcImgPosition.w
          : fixWidth;
      fixHeight =
        userParamStore.wrcImgPosition.h > 0
          ? userParamStore.wrcImgPosition.h
          : fixHeight;
      imgContext?.drawImage(
        componentDomStore.videoController,
        userParamStore.wrcImgPosition.x,
        userParamStore.wrcImgPosition.y,
        fixWidth,
        fixHeight
      );
      // 隐藏滚动条会出现部分内容未截取到，需要进行修复
      const diffHeight = containerHeight - fixHeight;
      if (
        userParamStore.hiddenScrollBar.state &&
        diffHeight > 0 &&
        userParamStore.hiddenScrollBar.fillState
      ) {
        // 填充容器的剩余部分
        imgContext.beginPath();
        let fillWidth = containerWidth;
        let fillHeight = diffHeight;
        if (userParamStore.hiddenScrollBar.fillWidth > 0) {
          fillWidth = userParamStore.hiddenScrollBar.fillWidth;
        }
        if (userParamStore.hiddenScrollBar.fillHeight > 0) {
          fillHeight = userParamStore.hiddenScrollBar.fillHeight;
        }
        imgContext.rect(0, fixHeight, fillWidth, fillHeight);
        imgContext.fillStyle = userParamStore.hiddenScrollBar.color;
        imgContext.fill();
      }
    }

    // 初始化截图容器
    initScreenShot(undefined, context, screenShotImageController, mouseEventFn);
    let displaySurface = null;
    let displayLabel = null;
    if (drawingDataStore.captureStream) {
      // 获取当前选择的窗口类型
      displaySurface = drawingDataStore.captureStream
        .getVideoTracks()[0]
        .getSettings()?.displaySurface;
      // 获取当前选择的标签页标识
      displayLabel = drawingDataStore.captureStream.getVideoTracks()[0].label;
    }
    // 执行截图成功回调
    if (triggerCallback) {
      triggerCallback({
        code: 0,
        msg: "截图加载完成",
        displaySurface,
        displayLabel
      });
    }
    // 停止捕捉屏幕
    stopCapture();
    // 重置光标状态
    document.body.classList.remove("no-cursor");
  }, userParamStore.wrcReplyTime);
};

const stopCapture = () => {
  if (componentDomStore.videoController == null) return;
  const srcObject = componentDomStore.videoController.srcObject;
  if (srcObject && "getTracks" in srcObject) {
    const tracks = srcObject.getTracks();
    tracks.forEach(track => track.stop());
    componentDomStore.setVideoSrcObject(null);
  }
};

const startCapture = async (
  cancelCallback: Function | undefined,
  screenShotImageController: HTMLCanvasElement
) => {
  let captureStream = null;
  let mediaWidth = screenShotImageController.width * drawingDataStore.dpr;
  let mediaHeight = screenShotImageController.height * drawingDataStore.dpr;
  let curTabState = true;
  let displayConfig = {};
  // 窗口模式启用时则
  if (userParamStore.wrcWindowMode) {
    mediaWidth = window.screen.width * drawingDataStore.dpr;
    mediaHeight = window.screen.height * drawingDataStore.dpr;
    curTabState = false;
    displayConfig = {
      displaySurface: "window"
    };
  }

  try {
    // 捕获屏幕
    captureStream = await navigator.mediaDevices.getDisplayMedia({
      audio: false,
      video: {
        width: mediaWidth,
        height: mediaHeight,
        ...displayConfig
      },
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      // 当前标签页
      preferCurrentTab: curTabState
    });
    // 将MediaStream输出至video标签
    componentDomStore.setVideoSrcObject(captureStream);
    // 储存屏幕流数据
    drawingDataStore.updateCaptureStream(captureStream);
  } catch (err) {
    if (cancelCallback != null) {
      cancelCallback({
        code: -1,
        msg: "浏览器不支持webrtc或者用户未授权",
        errorInfo: err
      });
    }
    // 销毁截图组件
    componentDomStore.destroyDOM();
    if (cancelCallback == null) {
      throw `浏览器不支持webrtc或者用户未授权( ${err} )`;
    }
  }
  return captureStream;
};

const sendStream = (
  stream: MediaStream | null,
  cancelCallback: Function | undefined,
  triggerCallback: Function | undefined,
  screenShotImageController: HTMLCanvasElement,
  mouseEventFn: mouseEventFnType
) => {
  let topEl = getTopEl();
  if (stream instanceof MediaStream) {
    componentDomStore.setVideoSrcObject(stream);
    loadScreenFlowData(
      triggerCallback,
      screenShotImageController,
      mouseEventFn,
      topEl
    );
  } else {
    if (cancelCallback != null) {
      cancelCallback({
        code: -1,
        msg: "视频流接入失败"
      });
    }
    // 销毁截图组件
    componentDomStore.destroyDOM();
    throw `视频流接入失败`;
  }
  return stream;
};

const h2cScreenShot = (
  triggerCallback: Function | undefined,
  context: CanvasRenderingContext2D,
  mouseEventFn: mouseEventFnType
): Promise<HTMLCanvasElement> => {
  return new Promise(resolve => {
    // html2canvas截屏
    html2canvas(
      userParamStore.screenShotDom
        ? userParamStore.screenShotDom
        : document.body,
      {
        x: userParamStore.renderOptions.x,
        y: userParamStore.renderOptions.y,
        onclone: userParamStore.loadCrossImg ? drawCrossImg : undefined,
        proxy: userParamStore.proxyUrl,
        ignoreElements: userParamStore.h2cIgnoreElementsFn,
        useCORS: userParamStore.useCORS
      }
    )
      .then(canvas => {
        // 装载截图的dom为null则退出
        if (componentDomStore.screenShotController == null) return;

        // 将html2canvas截取的内容回传
        resolve(canvas);
        // 初始化截图容器
        initScreenShot(triggerCallback, context, canvas, mouseEventFn);
      })
      .catch(err => {
        if (triggerCallback != null) {
          // 获取页面元素成功，执行回调函数
          triggerCallback({ code: -1, msg: err });
        }
      });
  });
};

// 调整插件容器层级
const adjustContainerLevels = (level: number) => {
  if (
    componentDomStore.screenShotController == null ||
    componentDomStore.toolController == null ||
    componentDomStore.textInputController == null ||
    componentDomStore.optionIcoController == null ||
    componentDomStore.optionController == null ||
    componentDomStore.cutBoxSizeContainer == null ||
    level <= 0
  ) {
    return;
  }
  componentDomStore.screenShotController.style.zIndex = `${level}`;
  componentDomStore.toolController.style.zIndex = `${level + 1}`;
  componentDomStore.textInputController.style.zIndex = `${level + 1}`;
  componentDomStore.optionIcoController.style.zIndex = `${level + 1}`;
  componentDomStore.optionController.style.zIndex = `${level + 1}`;
  componentDomStore.cutBoxSizeContainer.style.zIndex = `${level + 1}`;
};

/**
 * 显示最新的画布状态
 */
const showCanvasLastHistory = () => {
  if (screenShotCanvasStore.screenShotCanvas != null) {
    const context = screenShotCanvasStore.screenShotCanvas;
    if (drawingDataStore.history.length <= 0) {
      addHistory();
    }
    context.putImageData(
      drawingDataStore.history[drawingDataStore.history.length - 1]["data"],
      0,
      0
    );
  }
};

// 判断当前工具栏是否为自定义工具栏
const isCustomTool = () => {
  const toolId = toolBarStore.toolId;
  return toolId && toolId > 100;
};

export {
  registerForRightClickEvent,
  getWindowContentData,
  registerContainerShortcuts,
  showToolBar,
  initScreenShot,
  setScreenShotContainerSize,
  h2cScreenShot,
  loadScreenFlowData,
  wrcScreenShot,
  sendStream,
  adjustContainerLevels,
  showCanvasLastHistory,
  isCustomTool
};
