import componentDomStore from "@/store/ComponentDomStore";
import {
  drawCutOutBoxReturnType,
  zoomCutOutBoxReturnType
} from "@/lib/type/ComponentType";
import drawingDataStore from "@/store/DrawingDataStore";
import cropBoxStore from "@/store/CropBoxStore";
import toolBarStore from "@/store/ToolBarStore";
import { updateContainerMouseStyle } from "@/lib/common-methods/UpdateContainerMouseStyle";
import { drawCutOutBox } from "@/lib/split-methods/DrawCutOutBox";
import { zoomCutOutBoxPosition } from "@/lib/common-methods/ZoomCutOutBoxPosition";
import { fixedData, nonNegativeData } from "@/lib/common-methods/FixedData";
import userParamStore from "@/store/UserParamStore";
import {
  addHistory,
  showLastHistory
} from "@/lib/split-methods/AddHistoryData";
import {
  isCustomTool,
  showCanvasLastHistory,
  showToolBar
} from "@/lib/main-entrance/LoadCoreComponents";
import screenShotCanvasStore from "@/store/ScreenShotCanvasStore";
import { drawPencil, initPencil } from "@/lib/split-methods/DrawPencil";
import textInputStore from "@/store/TextInputStore";
import { drawText } from "@/lib/split-methods/DrawText";
import { getDrawBoundaryStatus } from "@/lib/split-methods/BoundaryJudgment";
import { drawMosaic } from "@/lib/split-methods/DrawMosaic";
import { drawLineArrow } from "@/lib/split-methods/DrawLineArrow";
import { drawCircle } from "@/lib/split-methods/DrawCircle";
import { drawRectangle } from "@/lib/split-methods/DrawRectangle";
import { DrawArrow } from "@/lib/split-methods/DrawArrow";
import { saveBorderArrInfo } from "@/lib/common-methods/SaveBorderArrInfo";

/**
 * 操作裁剪框
 * @param currentX 裁剪框当前x轴坐标
 * @param currentY 裁剪框当前y轴坐标
 * @param startX 鼠标x轴坐标
 * @param startY 鼠标y轴坐标
 * @param width 裁剪框宽度
 * @param height 裁剪框高度
 * @param context 需要进行绘制的canvas画布
 * @param screenShotImageController
 */
const operatingCutOutBox = (
  currentX: number,
  currentY: number,
  startX: number,
  startY: number,
  width: number,
  height: number,
  context: CanvasRenderingContext2D,
  screenShotImageController: HTMLCanvasElement
) => {
  // canvas元素不存在
  if (componentDomStore.screenShotController == null) {
    return;
  }
  // 获取鼠标按下时的坐标
  const { moveStartX, moveStartY } = drawingDataStore.movePosition;

  // 裁剪框边框节点事件存在且裁剪框未进行操作，则对鼠标样式进行修改
  if (
    drawingDataStore.cutOutBoxBorderArr.length > 0 &&
    !cropBoxStore.draggingTrim
  ) {
    // 标识鼠标是否在裁剪框内
    let flag = false;
    // 判断鼠标位置
    context.beginPath();
    for (let i = 0; i < drawingDataStore.cutOutBoxBorderArr.length; i++) {
      context.rect(
        drawingDataStore.cutOutBoxBorderArr[i].x,
        drawingDataStore.cutOutBoxBorderArr[i].y,
        drawingDataStore.cutOutBoxBorderArr[i].width,
        drawingDataStore.cutOutBoxBorderArr[i].height
      );
      // 当前坐标点处于8个可操作点上，修改鼠标指针样式
      if (
        context.isPointInPath(
          currentX * drawingDataStore.dpr,
          currentY * drawingDataStore.dpr
        )
      ) {
        switch (drawingDataStore.cutOutBoxBorderArr[i].index) {
          case 1:
            if (toolBarStore.toolClickStatus) {
              // 修改截图容器内的鼠标样式
              updateContainerMouseStyle(
                componentDomStore.screenShotController,
                toolBarStore.activeTool
              );
            } else {
              componentDomStore.screenShotController.style.cursor = "move";
            }
            break;
          case 2:
            // 工具栏被点击则不改变指针样式
            if (toolBarStore.toolClickStatus) break;
            componentDomStore.screenShotController.style.cursor = "ns-resize";
            break;
          case 3:
            if (toolBarStore.toolClickStatus) break;
            componentDomStore.screenShotController.style.cursor = "ew-resize";
            break;
          case 4:
            if (toolBarStore.toolClickStatus) break;
            componentDomStore.screenShotController.style.cursor = "nwse-resize";
            break;
          case 5:
            if (toolBarStore.toolClickStatus) break;
            componentDomStore.screenShotController.style.cursor = "nesw-resize";
            break;
          default:
            break;
        }
        drawingDataStore.updateBorderOption(
          drawingDataStore.cutOutBoxBorderArr[i].option
        );
        flag = true;
        break;
      }
    }
    drawingDataStore.updateMouseInsideCropBox(flag);
    context.closePath();
    if (!flag) {
      // 鼠标移出裁剪框重置鼠标样式
      componentDomStore.screenShotController.style.cursor = "default";
      // 重置当前操作的边框节点为null
      drawingDataStore.updateBorderOption(null);
    }
  }

  // 裁剪框正在被操作
  if (cropBoxStore.draggingTrim) {
    // 当前操作节点为1时则为移动裁剪框
    if (drawingDataStore.borderOption === 1) {
      // 计算要移动的x轴坐标
      let x = fixedData(
        currentX - (moveStartX - startX),
        width,
        componentDomStore.screenShotController.width
      );
      // 计算要移动的y轴坐标
      let y = fixedData(
        currentY - (moveStartY - startY),
        height,
        componentDomStore.screenShotController.height
      );
      // 计算画布面积
      const containerWidth =
        componentDomStore.screenShotController.width / drawingDataStore.dpr;
      const containerHeight =
        componentDomStore.screenShotController.height / drawingDataStore.dpr;
      // 计算裁剪框在画布上所占的面积
      const cutOutBoxSizeX = x + width;
      const cutOutBoxSizeY = y + height;
      // 超出画布的可视区域，进行位置修正
      if (cutOutBoxSizeX > containerWidth) {
        x = containerWidth - width;
      }
      if (cutOutBoxSizeY > containerHeight) {
        y = containerHeight - height;
      }

      const tempGraphPosition = drawCutOutBox(
        x,
        y,
        width,
        height,
        context,
        cropBoxStore.borderSize,
        componentDomStore.screenShotController as HTMLCanvasElement,
        screenShotImageController
      ) as drawCutOutBoxReturnType;
      // 重新绘制裁剪框
      drawingDataStore.updateTempGraphPosition(
        tempGraphPosition.startX,
        tempGraphPosition.startY,
        tempGraphPosition.width,
        tempGraphPosition.height
      );
    } else {
      // 裁剪框其他8个点的拖拽事件
      const {
        tempStartX,
        tempStartY,
        tempWidth,
        tempHeight
      } = zoomCutOutBoxPosition(
        currentX,
        currentY,
        startX,
        startY,
        width,
        height,
        drawingDataStore.borderOption as number
      ) as zoomCutOutBoxReturnType;
      // 绘制裁剪框
      const tempGraphPosition = drawCutOutBox(
        tempStartX,
        tempStartY,
        tempWidth,
        tempHeight,
        context,
        cropBoxStore.borderSize,
        componentDomStore.screenShotController as HTMLCanvasElement,
        screenShotImageController
      ) as drawCutOutBoxReturnType;
      drawingDataStore.updateTempGraphPosition(
        tempGraphPosition.startX,
        tempGraphPosition.startY,
        tempGraphPosition.width,
        tempGraphPosition.height
      );
    }
  }
};

const handleCanvasClick = (event: MouseEvent | TouchEvent) => {
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
    isCustomTool() &&
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
      drawingDataStore.textInputPosition.mouseX != 0 &&
      drawingDataStore.textInputPosition.mouseY != 0 &&
      drawingDataStore.textInputPosition.mouseX != mouseX &&
      drawingDataStore.textInputPosition.mouseY != mouseY
    ) {
      drawText(
        componentDomStore.textInputController.innerText,
        drawingDataStore.textInputPosition.mouseX,
        drawingDataStore.textInputPosition.mouseY,
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
        drawingDataStore.updateTextInputPosition(mouseX, mouseY);
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
    drawingDataStore.updateDrawGraphPrevInfo(
      cropBoxStore.drawGraphPosition.startX,
      cropBoxStore.drawGraphPosition.startY
    );
    // 绘制裁剪框,记录当前鼠标开始坐标
    cropBoxStore.updateDrawGraphPosition(mouseX, mouseY);
  }
};

const handleCanvasMouseMove = (
  event: MouseEvent | TouchEvent,
  screenShotImageController: HTMLCanvasElement,
  drawArrow: DrawArrow
) => {
  if (
    screenShotCanvasStore.screenShotCanvas == null ||
    componentDomStore.screenShotController == null
  ) {
    return;
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
      showCanvasLastHistory();
      drawingDataStore.updateDrawStatus(true);
    }
    isCustomTool() &&
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
        drawArrow.draw(
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
        if (!drawingDataStore.drawStatus) {
          showCanvasLastHistory();
          drawingDataStore.updateDrawStatus(true);
        }
        // 绘制马赛克，为了确保鼠标位置在绘制区域中间，所以对x、y坐标进行-10处理
        drawMosaic(
          currentX - 10,
          currentY - 10,
          toolBarStore.mosaicPenSize,
          drawingDataStore.degreeOfBlur,
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
    screenShotImageController
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
    screenShotImageController
  ) as drawCutOutBoxReturnType;
  drawingDataStore.updateTempGraphPosition(
    tempGraphPosition.startX,
    tempGraphPosition.startY,
    tempGraphPosition.width,
    tempGraphPosition.height
  );
};

const handleCanvasMouseDown = (
  dragFlag: boolean,
  screenShotImageController: HTMLCanvasElement,
  resetDragFlagFn: () => void
) => {
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
    !dragFlag &&
    !userParamStore.clickCutFullScreen
  ) {
    // 复原裁剪框的坐标
    cropBoxStore.updateDrawGraphPosition(
      drawingDataStore.drawGraphPrevX,
      drawingDataStore.drawGraphPrevY
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
    !dragFlag &&
    userParamStore.clickCutFullScreen
  ) {
    const borderSize = cropBoxStore.borderSize;
    drawingDataStore.updateFullScreenStatus(true);
    // 设置裁剪框位置为全屏
    const tempGraphPosition = drawCutOutBox(
      0,
      0,
      parseFloat(componentDomStore.screenShotController.style.width) -
        borderSize / 2,
      parseFloat(componentDomStore.screenShotController.style.height) -
        borderSize / 2,
      screenShotCanvasStore.screenShotCanvas,
      borderSize,
      componentDomStore.screenShotController,
      screenShotImageController
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
  if (toolBarStore.toolClickStatus && drawingDataStore.drawStatus) {
    isCustomTool() &&
      userParamStore.getCanvasEvents()?.mouseUpFn(showLastHistory);
    // 保存绘制记录
    addHistory();
    return;
  } else if (toolBarStore.toolClickStatus && !drawingDataStore.drawStatus) {
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
    (componentDomStore.screenShotController != null && dragFlag) ||
    userParamStore.clickCutFullScreen
  ) {
    // 修改鼠标状态为拖动
    componentDomStore.screenShotController.style.cursor = "move";
    // 显示截图工具栏
    toolBarStore.setToolStatus(true);
    // 显示裁剪框尺寸显示容器
    cropBoxStore.setCutBoxSizeStatus(true);
    // 复原拖动状态
    resetDragFlagFn();
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

export {
  operatingCutOutBox,
  handleCanvasClick,
  handleCanvasMouseMove,
  handleCanvasMouseDown
};
