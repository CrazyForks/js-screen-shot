import CreateDom from "@/lib/main-entrance/CreateDom";
// 导入截图所需样式
import "@/assets/scss/screen-shot.scss";
import { mouseEventFnType, screenShotType } from "@/lib/type/ComponentType";
import cropBoxStore from "@/store/CropBoxStore";
import { DrawArrow } from "@/lib/split-methods/DrawArrow";

import KeyboardEventHandle from "@/lib/split-methods/KeyboardEventHandle";
import { setPlugInParameters } from "@/lib/split-methods/SetPlugInParameters";
import { getCanvas2dCtx } from "@/lib/common-methods/CanvasPatch";

import { isTouchDevice } from "@/lib/common-methods/DeviceTypeVerif";
import toolBarStore from "@/store/ToolBarStore";
import textInputStore from "@/store/TextInputStore";
import componentDomStore from "@/store/ComponentDomStore";
import screenShotCanvasStore from "@/store/ScreenShotCanvasStore";
import userParamStore from "@/store/UserParamStore";
import { setOptionalParameter } from "@/lib/split-methods/SetOptionalParameter";
import {
  adjustContainerLevels,
  h2cScreenShot,
  initScreenShot,
  registerContainerShortcuts,
  registerForRightClickEvent,
  sendStream,
  setScreenShotContainerSize,
  wrcScreenShot
} from "@/lib/main-entrance/LoadCoreComponents";
import drawingDataStore from "@/store/DrawingDataStore";
import {
  handleCanvasClick,
  handleCanvasMouseDown,
  handleCanvasMouseMove,
  operatingCutOutBox
} from "@/lib/main-entrance/MouseDownCore";
import observeStore from "@/store/StoreObserver";
import { drawImgToCanvas } from "@/lib/split-methods/DrawImgToCanvas";

export default class ScreenShot {
  // 截图图片存放容器
  private screenShotImageController: HTMLCanvasElement;

  private keyboardEventHandle: null | KeyboardEventHandle = null;

  // 鼠标拖动状态
  private dragFlag = false;

  // 递增变粗箭头的实现
  private drawArrow = new DrawArrow();

  constructor(options: screenShotType) {
    // 提取调用者传入的配置
    setPlugInParameters(options);
    // 创建截图所需dom并设置回调函数
    new CreateDom(options);
    // 创建webrtc模式所需要的辅助dom
    componentDomStore.initWebRtcDom();
    this.screenShotImageController = document.createElement("canvas");

    // 设置插件的可选参数
    setOptionalParameter(options);
    // 获取截图区域canvas容器，存储到store中
    componentDomStore.setCanvasContainer();
    // 修改截图容器可滚动状态
    componentDomStore.setNoScrollStatus(options?.noScroll);

    // 加载截图组件
    this.load(options?.triggerCallback, options?.cancelCallback);
    if (
      componentDomStore.toolController == null ||
      componentDomStore.screenShotController == null ||
      componentDomStore.textInputController == null
    ) {
      return;
    }
    // 截图组件加载完毕后，对层级进行调整
    adjustContainerLevels(options?.level ? options.level : 0);

    // 创建键盘事件监听
    this.keyboardEventHandle = new KeyboardEventHandle(
      componentDomStore.screenShotController,
      componentDomStore.toolController
    );
    // 给输入容器设置快捷键监听
    registerContainerShortcuts(
      componentDomStore.textInputController,
      drawingDataStore.textInputPosition
    );
    if (userParamStore.customRightClickEvent.state) {
      // 给截图容器添加右键事件监听
      registerForRightClickEvent(componentDomStore.screenShotController);
    }

    // 监听store变化
    observeStore();
  }

  // 销毁组件方法
  public destroyComponents(): void {
    componentDomStore.destroyDOM();
  }

  // 确认截图方法
  public completeScreenshot() {
    if (this.keyboardEventHandle) {
      this.keyboardEventHandle.triggerEvent("confirm");
    }
  }

  // 加载截图组件
  private load(
    triggerCallback: Function | undefined,
    cancelCallback: Function | undefined
  ) {
    setScreenShotContainerSize(this.screenShotImageController);
    // 获取截图区域canvas容器画布
    if (componentDomStore.screenShotController == null) return;
    const context = getCanvas2dCtx(
      componentDomStore.screenShotController,
      this.screenShotImageController.width,
      this.screenShotImageController.height
    );
    if (context == null) return;
    // 显示截图区域容器
    componentDomStore.showScreenShotPanel();

    // 调用者传入图片的情况
    if (!userParamStore.enableWebRtc && userParamStore.imgSrc != null) {
      this.drawPictures(triggerCallback, context, userParamStore.imgSrc, {
        mouseDownEvent: this.mouseDownEvent,
        mouseMoveEvent: this.mouseMoveEvent,
        mouseUpEvent: this.mouseUpEvent
      });
      return;
    }

    if (!userParamStore.enableWebRtc) {
      h2cScreenShot(triggerCallback, context, {
        mouseDownEvent: this.mouseDownEvent,
        mouseMoveEvent: this.mouseMoveEvent,
        mouseUpEvent: this.mouseUpEvent
      }).then(canvas => {
        this.screenShotImageController = canvas;
      });
      return;
    }
    // 调用者有传入屏幕流数据则使用
    if (userParamStore.screenFlow) {
      sendStream(
        userParamStore.screenFlow,
        cancelCallback,
        triggerCallback,
        this.screenShotImageController,
        {
          mouseDownEvent: this.mouseDownEvent,
          mouseMoveEvent: this.mouseMoveEvent,
          mouseUpEvent: this.mouseUpEvent
        }
      );
      return;
    }
    // 使用webrtc实现截屏
    wrcScreenShot(
      cancelCallback,
      triggerCallback,
      this.screenShotImageController,
      {
        mouseDownEvent: this.mouseDownEvent,
        mouseMoveEvent: this.mouseMoveEvent,
        mouseUpEvent: this.mouseUpEvent
      }
    );
  }

  // 鼠标按下事件
  private mouseDownEvent = (event: MouseEvent | TouchEvent) => {
    // 隐藏颜色选择面板
    toolBarStore.setColorPanelStatus(false);
    // 隐藏文字大小选择面板
    textInputStore.setTextSizeOptionStatus(false);
    // 非鼠标左键按下则终止
    if (event instanceof MouseEvent && event.button != 0) return;

    // 当前处于移动端触摸时，需要在按下时判断当前坐标点是否处于裁剪框内，主动更新draggingTrim状态（移动端的move事件只会在按下时才会触发）
    if (
      isTouchDevice() &&
      event instanceof TouchEvent &&
      screenShotCanvasStore.screenShotCanvas
    ) {
      operatingCutOutBox(
        event.touches[0].pageX,
        event.touches[0].pageY,
        drawingDataStore.tempGraphPosition.startX,
        drawingDataStore.tempGraphPosition.startY,
        drawingDataStore.tempGraphPosition.width,
        drawingDataStore.tempGraphPosition.height,
        screenShotCanvasStore.screenShotCanvas,
        this.screenShotImageController
      );
    }
    // 当前操作的是撤销
    if (toolBarStore.toolName == "undo") return;
    cropBoxStore.setDragging(true);
    drawingDataStore.updateDrawStatus(false);
    handleCanvasClick(event);
  };

  // 鼠标移动事件
  private mouseMoveEvent = (event: MouseEvent | TouchEvent) => {
    if (toolBarStore.toolName == "undo") {
      return;
    }
    // 去除默认事件
    event.preventDefault();

    // 工具栏未选择且鼠标处于按下状态时
    if (!toolBarStore.toolClickStatus && cropBoxStore.dragging) {
      // 修改拖动状态为true;
      this.dragFlag = true;
      // 隐藏截图工具栏
      toolBarStore.setToolStatus(false);
      // 隐藏裁剪框尺寸显示容器
      cropBoxStore.setCutBoxSizeStatus(false);
    }
    handleCanvasMouseMove(
      event,
      this.screenShotImageController,
      this.drawArrow
    );
  };

  // 鼠标抬起事件
  private mouseUpEvent = () => {
    // 当前操作的是撤销
    if (toolBarStore.toolName == "undo") return;
    // 绘制结束
    cropBoxStore.setDragging(false);
    cropBoxStore.setDraggingTrim(false);
    handleCanvasMouseDown(this.dragFlag, this.screenShotImageController, () => {
      this.dragFlag = false;
    });
  };

  /**
   * 向截图容器中绘制图片
   * @param triggerCallback
   * @param context
   * @param imgSrc
   * @param mouseEventFn
   * @private
   */
  private drawPictures(
    triggerCallback: Function | undefined,
    context: CanvasRenderingContext2D,
    imgSrc: string,
    mouseEventFn: mouseEventFnType
  ) {
    drawImgToCanvas(
      imgSrc,
      this.screenShotImageController.width,
      this.screenShotImageController.height,
      drawingDataStore.dpr
    ).then(canvas => {
      this.screenShotImageController = canvas;
      // 初始化截图容器
      initScreenShot(
        triggerCallback,
        context,
        this.screenShotImageController,
        mouseEventFn
      );
    });
  }
}
