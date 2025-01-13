import CreateDom from "@/lib/main-entrance/CreateDom";
// 导入截图所需样式
import "@/assets/scss/screen-shot.scss";
import {
  drawCutOutBoxReturnType,
  screenShotType
} from "@/lib/type/ComponentType";
import cropBoxStore from "@/store/CropBoxStore";
import { nonNegativeData } from "@/lib/common-methods/FixedData";
import { drawPencil, initPencil } from "@/lib/split-methods/DrawPencil";
import { drawText } from "@/lib/split-methods/DrawText";
import { drawRectangle } from "@/lib/split-methods/DrawRectangle";
import { drawCircle } from "@/lib/split-methods/DrawCircle";
import { DrawArrow } from "@/lib/split-methods/DrawArrow";
import { drawMosaic } from "@/lib/split-methods/DrawMosaic";
import { drawCutOutBox } from "@/lib/split-methods/DrawCutOutBox";
import { saveBorderArrInfo } from "@/lib/common-methods/SaveBorderArrInfo";
import { getDrawBoundaryStatus } from "@/lib/split-methods/BoundaryJudgment";
import KeyboardEventHandle from "@/lib/split-methods/KeyboardEventHandle";
import { setPlugInParameters } from "@/lib/split-methods/SetPlugInParameters";
import { getCanvas2dCtx } from "@/lib/common-methods/CanvasPatch";

import {
  addHistory,
  showLastHistory
} from "@/lib/split-methods/AddHistoryData";
import { isTouchDevice } from "@/lib/common-methods/DeviceTypeVerif";
import { drawLineArrow } from "@/lib/split-methods/DrawLineArrow";
import toolBarStore from "@/store/ToolBarStore";
import textInputStore from "@/store/TextInputStore";
import componentDomStore from "@/store/ComponentDomStore";
import screenShotCanvasStore from "@/store/ScreenShotCanvasStore";
import userParamStore from "@/store/UserParamStore";
import { setOptionalParameter } from "@/lib/split-methods/SetOptionalParameter";
import {
  h2cScreenShot,
  registerContainerShortcuts,
  registerForRightClickEvent,
  sendStream,
  setScreenShotContainerSize,
  showToolBar,
  wrcScreenShot
} from "@/lib/main-entrance/LoadCoreComponents";
import drawingDataStore from "@/store/DrawingDataStore";
import { operatingCutOutBox } from "@/lib/main-entrance/MouseDownCore";

export default class ScreenShot {
  // 截图图片存放容器
  private screenShotImageController: HTMLCanvasElement;

  private keyboardEventHandle: null | KeyboardEventHandle = null;

  // 鼠标拖动状态
  private dragFlag = false;

  // 上一个裁剪框坐标信息
  private drawGraphPrevX = 0;
  private drawGraphPrevY = 0;
  // 马赛克涂抹区域大小
  private degreeOfBlur = 5;
  // 截全屏时工具栏展示的位置要减去的高度

  private drawStatus = false;

  // 文本输入框位置
  private textInputPosition: { mouseX: number; mouseY: number } = {
    mouseX: 0,
    mouseY: 0
  };

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
    this.adjustContainerLevels(options?.level ? options.level : 0);

    // 创建键盘事件监听
    this.keyboardEventHandle = new KeyboardEventHandle(
      componentDomStore.screenShotController,
      componentDomStore.toolController
    );
    // 给输入容器设置快捷键监听
    registerContainerShortcuts(
      componentDomStore.textInputController,
      this.textInputPosition
    );
    if (userParamStore.customRightClickEvent.state) {
      // 给截图容器添加右键事件监听
      registerForRightClickEvent(componentDomStore.screenShotController);
    }
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
    screenShotCanvasStore.showScreenShotPanel();
    if (!userParamStore.enableWebRtc) {
      h2cScreenShot(
        triggerCallback,
        context,
        {
          mouseDownEvent: this.mouseDownEvent,
          mouseMoveEvent: this.mouseMoveEvent,
          mouseUpEvent: this.mouseUpEvent
        },
        this.screenShotImageController
      ).then(canvas => {
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
    // 隐藏光标
    document.body.classList.add("no-cursor");
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
    this.drawStatus = false;
    // 重置工具栏超出状态
    toolBarStore.setToolPositionStatus(false);
    const mouseX = nonNegativeData(
      event instanceof MouseEvent ? event.offsetX : event.touches[0].pageX
    );
    const mouseY = nonNegativeData(
      event instanceof MouseEvent ? event.offsetY : event.touches[0].pageY
    );

    // 如果当前操作的是截图工具栏
    if (toolBarStore.toolClickStatus) {
      // 记录当前鼠标开始坐标
      cropBoxStore.updateDrawGraphPosition(mouseX, mouseY);
      this.isCustomTool() &&
        userParamStore
          .getCanvasEvents()
          ?.mouseDownFn(event, mouseX, mouseY, addHistory);
    }

    // 当前操作的是画笔
    if (
      toolBarStore.toolName == "brush" &&
      screenShotCanvasStore.screenShotCanvas
    ) {
      // 初始化画笔
      initPencil(screenShotCanvasStore.screenShotCanvas, mouseX, mouseY);
    }

    // 当前操作的文本
    if (
      toolBarStore.toolName == "text" &&
      componentDomStore.textInputController &&
      componentDomStore.screenShotController &&
      screenShotCanvasStore.screenShotCanvas
    ) {
      if (!drawingDataStore.mouseInsideCropBox) {
        return;
      }
      // 显示文本输入区域
      textInputStore.setTextStatus(true);
      // 判断输入框位置是否变化
      if (
        this.textInputPosition.mouseX != 0 &&
        this.textInputPosition.mouseY != 0 &&
        this.textInputPosition.mouseX != mouseX &&
        this.textInputPosition.mouseY != mouseY
      ) {
        drawText(
          componentDomStore.textInputController.innerText,
          this.textInputPosition.mouseX,
          this.textInputPosition.mouseY,
          toolBarStore.selectedColor,
          toolBarStore.fontSize,
          screenShotCanvasStore.screenShotCanvas
        );

        // 输入框内容不为空时则隐藏
        if (componentDomStore.textInputController.innerText !== "") {
          // 隐藏输入框
          textInputStore.setTextStatus(false);
        }

        // 清空文本输入区域的内容
        componentDomStore.textInputController.innerHTML = "";
        // 保存绘制记录
        addHistory();
      }
      // 计算文本框显示位置, 需要加上截图容器的位置信息
      const textMouseX = mouseX + userParamStore.position.left;
      // 设置文本框位置等信息
      componentDomStore.textInputController.style.left = textMouseX + "px";
      componentDomStore.textInputController.style.fontSize =
        toolBarStore.fontSize + "px";
      componentDomStore.textInputController.style.fontFamily = "none";
      componentDomStore.textInputController.style.color =
        toolBarStore.selectedColor;

      // 部分操作需要等dom渲染完毕执行
      setTimeout(() => {
        if (componentDomStore.textInputController) {
          // 获取输入框容器的高度
          const containerHeight =
            componentDomStore.textInputController.offsetHeight;
          // 输入框容器y轴的位置需要在坐标的基础上再加上容器高度的一半，容器的位置就正好居中于光标
          // canvas渲染的时候就不会出现位置不一致的问题了
          const textMouseY =
            mouseY -
            Math.floor(containerHeight / 2) +
            userParamStore.position.top;
          componentDomStore.textInputController.style.top = textMouseY + "px";
          // 获取焦点
          componentDomStore.textInputController.focus();
          // 记录当前输入框位置
          this.textInputPosition = { mouseX: mouseX, mouseY: mouseY };
          toolBarStore.setTextInfo({
            positionX: mouseX,
            positionY: mouseY,
            color: toolBarStore.selectedColor,
            size: toolBarStore.fontSize
          });
        }
      });
    }

    // 如果操作的是裁剪框
    if (drawingDataStore.borderOption) {
      // 设置为拖动状态
      cropBoxStore.setDraggingTrim(true);
      // 记录移动时的起始点坐标
      drawingDataStore.updateMovePosition(mouseX, mouseY);
    } else {
      // 保存当前裁剪框的坐标
      this.drawGraphPrevX = cropBoxStore.drawGraphPosition.startX;
      this.drawGraphPrevY = cropBoxStore.drawGraphPosition.startY;
      // 绘制裁剪框,记录当前鼠标开始坐标
      cropBoxStore.updateDrawGraphPosition(mouseX, mouseY);
    }
  };

  // 鼠标移动事件
  private mouseMoveEvent = (event: MouseEvent | TouchEvent) => {
    if (
      screenShotCanvasStore.screenShotCanvas == null ||
      componentDomStore.screenShotController == null ||
      toolBarStore.toolName == "undo"
    ) {
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
    // 获取当前绘制中的工具位置信息
    const { startX, startY, width, height } = cropBoxStore.drawGraphPosition;
    // 获取当前鼠标坐标
    const currentX = nonNegativeData(
      event instanceof MouseEvent ? event.offsetX : event.touches[0].pageX
    );
    const currentY = nonNegativeData(
      event instanceof MouseEvent ? event.offsetY : event.touches[0].pageY
    );
    // 绘制中工具的临时宽高
    const tempWidth = currentX - startX;
    const tempHeight = currentY - startY;
    // 工具栏绘制
    if (toolBarStore.toolClickStatus && cropBoxStore.dragging) {
      // 获取裁剪框位置信息
      const cutBoxPosition = cropBoxStore.cutOutBoxPosition;
      // 绘制中工具的起始x、y坐标不能小于裁剪框的起始坐标
      // 绘制中工具的起始x、y坐标不能大于裁剪框的结束标作
      // 当前鼠标的x坐标不能小于裁剪框起始x坐标，不能大于裁剪框的结束坐标
      // 当前鼠标的y坐标不能小于裁剪框起始y坐标，不能大于裁剪框的结束坐标
      if (
        !getDrawBoundaryStatus(startX, startY, cutBoxPosition) ||
        !getDrawBoundaryStatus(currentX, currentY, cutBoxPosition)
      )
        return;

      // 当前操作的不是马赛克则显示最后一次画布绘制时的状态
      if (toolBarStore.toolName != "mosaicPen") {
        this.showLastHistory();
        this.drawStatus = true;
      }
      this.isCustomTool() &&
        userParamStore.getCanvasEvents()?.mouseMoveFn(
          event,
          {
            startX,
            startY,
            currentX,
            currentY
          },
          showLastHistory
        );
      switch (toolBarStore.toolName) {
        case "square":
          drawRectangle(
            startX,
            startY,
            tempWidth,
            tempHeight,
            toolBarStore.selectedColor,
            toolBarStore.penSize,
            screenShotCanvasStore.screenShotCanvas
          );
          break;
        case "round":
          drawCircle(
            screenShotCanvasStore.screenShotCanvas,
            currentX,
            currentY,
            startX,
            startY,
            toolBarStore.penSize,
            toolBarStore.selectedColor
          );
          break;
        case "right-top":
          // 绘制等比例箭头
          if (userParamStore.useRatioArrow) {
            drawLineArrow(
              screenShotCanvasStore.screenShotCanvas,
              startX,
              startY,
              currentX,
              currentY,
              30,
              10,
              toolBarStore.penSize,
              toolBarStore.selectedColor
            );
            return;
          }
          this.drawArrow.draw(
            screenShotCanvasStore.screenShotCanvas,
            startX,
            startY,
            currentX,
            currentY,
            toolBarStore.selectedColor,
            toolBarStore.penSize
          );
          break;
        case "brush":
          // 画笔绘制
          drawPencil(
            screenShotCanvasStore.screenShotCanvas,
            currentX,
            currentY,
            toolBarStore.penSize,
            toolBarStore.selectedColor
          );
          break;
        case "mosaicPen":
          // 当前为马赛克工具则修改绘制状态
          // 前面做了判断，此处需要特殊处理
          if (!this.drawStatus) {
            this.showLastHistory();
            this.drawStatus = true;
          }
          // 绘制马赛克，为了确保鼠标位置在绘制区域中间，所以对x、y坐标进行-10处理
          drawMosaic(
            currentX - 10,
            currentY - 10,
            toolBarStore.mosaicPenSize,
            this.degreeOfBlur,
            screenShotCanvasStore.screenShotCanvas
          );
          break;
        default:
          break;
      }
      return;
    }
    // 执行裁剪框操作函数
    operatingCutOutBox(
      currentX,
      currentY,
      startX,
      startY,
      width,
      height,
      screenShotCanvasStore.screenShotCanvas,
      this.screenShotImageController
    );
    // 如果鼠标未点击或者当前操作的是裁剪框都return
    if (!cropBoxStore.dragging || cropBoxStore.draggingTrim) return;

    // 绘制裁剪框
    const tempGraphPosition = drawCutOutBox(
      startX,
      startY,
      tempWidth,
      tempHeight,
      screenShotCanvasStore.screenShotCanvas,
      cropBoxStore.borderSize,
      componentDomStore.screenShotController,
      this.screenShotImageController
    ) as drawCutOutBoxReturnType;
    drawingDataStore.updateTempGraphPosition(
      tempGraphPosition.startX,
      tempGraphPosition.startY,
      tempGraphPosition.width,
      tempGraphPosition.height
    );
  };

  // 调整插件容器层级
  private adjustContainerLevels(level: number): void {
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
  }

  // 鼠标抬起事件
  private mouseUpEvent = () => {
    // 当前操作的是撤销
    if (toolBarStore.toolName == "undo") return;
    // 绘制结束
    cropBoxStore.setDragging(false);
    cropBoxStore.setDraggingTrim(false);

    // 截图容器判空
    if (
      screenShotCanvasStore.screenShotCanvas == null ||
      componentDomStore.screenShotController == null
    ) {
      return;
    }
    // 工具栏未点击且鼠标未拖动且单击截屏状态为false则复原裁剪框位置
    if (
      !toolBarStore.toolClickStatus &&
      !this.dragFlag &&
      !userParamStore.clickCutFullScreen
    ) {
      // 复原裁剪框的坐标
      cropBoxStore.updateDrawGraphPosition(
        this.drawGraphPrevX,
        this.drawGraphPrevY
      );
      return;
    }

    // 调用者尚未拖拽生成选区
    // 鼠标尚未拖动
    // 单击截取屏幕状态为true
    // 则截取整个屏幕
    const cutBoxPosition = cropBoxStore.cutOutBoxPosition;
    if (
      cutBoxPosition.width === 0 &&
      cutBoxPosition.height === 0 &&
      cutBoxPosition.startX === 0 &&
      cutBoxPosition.startY === 0 &&
      !this.dragFlag &&
      userParamStore.clickCutFullScreen
    ) {
      const borderSize = cropBoxStore.borderSize;
      drawingDataStore.updateFullScreenStatus(true);
      // 设置裁剪框位置为全屏
      const tempGraphPosition = drawCutOutBox(
        0,
        0,
        componentDomStore.screenShotController.width - borderSize / 2,
        componentDomStore.screenShotController.height - borderSize / 2,
        screenShotCanvasStore.screenShotCanvas,
        borderSize,
        componentDomStore.screenShotController,
        this.screenShotImageController
      ) as drawCutOutBoxReturnType;
      drawingDataStore.updateTempGraphPosition(
        tempGraphPosition.startX,
        tempGraphPosition.startY,
        tempGraphPosition.width,
        tempGraphPosition.height
      );
    }

    if (
      componentDomStore.screenShotController == null ||
      screenShotCanvasStore.screenShotCanvas == null
    ) {
      return;
    }
    // 工具栏已点击且进行了绘制
    if (toolBarStore.toolClickStatus && this.drawStatus) {
      this.isCustomTool() &&
        userParamStore.getCanvasEvents()?.mouseUpFn(showLastHistory);
      // 保存绘制记录
      addHistory();
      return;
    } else if (toolBarStore.toolClickStatus && !this.drawStatus) {
      // 工具栏点击了但尚未进行绘制
      return;
    }
    // 保存绘制后的图形位置信息
    cropBoxStore.updateDrawGraphPosition(
      drawingDataStore.tempGraphPosition.startX,
      drawingDataStore.tempGraphPosition.startY,
      drawingDataStore.tempGraphPosition.width,
      drawingDataStore.tempGraphPosition.height
    );
    // 如果工具栏未点击则保存裁剪框位置
    if (!toolBarStore.toolClickStatus) {
      const { startX, startY, width, height } = cropBoxStore.drawGraphPosition;
      cropBoxStore.setCutOutBoxPosition(startX, startY, width, height);
    }
    // 保存边框节点信息
    drawingDataStore.updateCutOutBoxBorderArr(
      saveBorderArrInfo(cropBoxStore.borderSize, cropBoxStore.drawGraphPosition)
    );
    // 鼠标按下且拖动时重新渲染工具栏
    if (
      (componentDomStore.screenShotController != null && this.dragFlag) ||
      userParamStore.clickCutFullScreen
    ) {
      // 修改鼠标状态为拖动
      componentDomStore.screenShotController.style.cursor = "move";
      // 显示截图工具栏
      toolBarStore.setToolStatus(true);
      // 显示裁剪框尺寸显示容器
      cropBoxStore.setCutBoxSizeStatus(true);
      // 复原拖动状态
      this.dragFlag = false;
      if (componentDomStore.toolController != null) {
        showToolBar(
          cropBoxStore.drawGraphPosition,
          drawingDataStore.dpr,
          userParamStore.toolPosition,
          drawingDataStore.getFullScreenStatus
        );
      }
    }
  };

  /**
   * 显示最新的画布状态
   * @private
   */
  private showLastHistory() {
    if (screenShotCanvasStore.screenShotCanvas != null) {
      const context = screenShotCanvasStore.screenShotCanvas;
      if (toolBarStore.history.length <= 0) {
        addHistory();
      }
      context.putImageData(
        toolBarStore.history[toolBarStore.history.length - 1]["data"],
        0,
        0
      );
    }
  }

  // 判断当前工具栏是否为自定义工具栏
  private isCustomTool() {
    const toolId = toolBarStore.toolId;
    return toolId && toolId > 100;
  }
}
