import drawingDataStore from "@/store/DrawingDataStore";
import cropBoxStore from "@/store/CropBoxStore";
import {
  getMousePositionOnCornerInRectangle,
  getMouseRectangleCursorStyle,
  isMouseInRectangle
} from "@/lib/split-methods/ShapeUtils";
import componentDomStore from "@/store/ComponentDomStore";
import { positionInfoType, squareElementType } from "@/lib/type/ComponentType";
import screenShotCanvasStore from "@/store/ScreenShotCanvasStore";
import { drawRectangle } from "@/lib/split-methods/DrawRectangle";
import toolBarStore from "@/store/ToolBarStore";

/**
 * 鼠标处于画布上已绘制元素的边框上
 * @param elementId
 * @param mouseX
 * @param mouseY
 * @param dotRadius
 */
const handleMouseMoveOnElement = (
  elementId: string | null,
  mouseX: number,
  mouseY: number,
  dotRadius: number
) => {
  if (elementId != null) {
    const square = drawingDataStore.getCanvasElement(elementId);
    switch (square?.type) {
      case "square":
        if (square?.squareElement == null) break;
        const operateIndex = getMousePositionOnCornerInRectangle(
          mouseX,
          mouseY,
          square.squareElement.mouseX,
          square.squareElement.mouseY,
          square.squareElement.width,
          square.squareElement.height,
          dotRadius
        );
        // 判断鼠标是否在矩形的操作圆点上
        if (
          operateIndex != null &&
          drawingDataStore.activeElementId == elementId
        ) {
          // 更新矩形元素的操作节点索引
          drawingDataStore.updateRectOperateIndex(operateIndex);
          const styleTxt = getMouseRectangleCursorStyle(operateIndex);
          if (styleTxt != null) {
            componentDomStore.setCursorStyle(styleTxt);
          }
          return;
        }
        break;

      default:
        break;
    }
    // 修改鼠标为移动状态
    componentDomStore.setCursorStyle("move");
    // 更新当前选中元素的id
    drawingDataStore.updateActiveElementId(elementId);
    return;
  }
  // 重置鼠标状态
  componentDomStore.setCursorStyle("default");
  drawingDataStore.updateActiveElementId(null);
};

/**
 * 计算矩形元素在鼠标按下时的偏移量
 * @param mouseDownX
 * @param mouseDownY
 * @param elementId
 */
const calculateRectangleOffset = (
  mouseDownX: number,
  mouseDownY: number,
  elementId: string | null
) => {
  let dragOffset = { x: 0, y: 0 };
  const canvasElement = drawingDataStore.getCanvasElement(elementId ?? "");
  if (canvasElement && canvasElement.squareElement != null) {
    const {
      mouseX,
      mouseY,
      width,
      height,
      borderWidth
    } = canvasElement.squareElement;
    // 判断鼠标是否处于矩形内
    const isInside = isMouseInRectangle(
      cropBoxStore.drawGraphPosition.startX,
      cropBoxStore.drawGraphPosition.startY,
      {
        x: mouseX,
        y: mouseY,
        width,
        height
      },
      borderWidth
    );
    if (isInside) {
      dragOffset = { x: mouseDownX - mouseX, y: mouseDownY - mouseY };
    }
  }
  return dragOffset;
};

/**
 * 计算矩形在画布上移动后的位置
 * @param rectangle 矩形元素
 * @param currentPoint 当前鼠标位置
 * @param clipArea 矩形的可移动区域
 * @param dragOffset 鼠标按下时坐标与矩形之间的偏移量
 */
const calculateNewRectanglePosition = (
  rectangle: squareElementType,
  currentPoint: { x: number; y: number },
  clipArea: positionInfoType,
  dragOffset: { x: number; y: number }
) => {
  let newX = currentPoint.x - dragOffset.x;
  let newY = currentPoint.y - dragOffset.y;
  // 应用边界约束
  newX = Math.max(clipArea.startX, newX);
  newX = Math.min(clipArea.startX + clipArea.width - rectangle.width, newX);

  newY = Math.max(clipArea.startY, newY);
  newY = Math.min(clipArea.startY + clipArea.height - rectangle.height, newY);

  return {
    ...rectangle,
    mouseX: newX,
    mouseY: newY
  };
};

/**
 * 显示当前活跃元素的操作边框
 * @param dotRadius
 */
const showCanvasActiveElementBorder = (dotRadius: number) => {
  const canvasElement = drawingDataStore.getCanvasElement(
    drawingDataStore.activeElementId ?? ""
  );
  switch (canvasElement?.type) {
    case "square":
      if (canvasElement.squareElement == null) break;
      const {
        mouseX,
        mouseY,
        width,
        height,
        borderWidth
      } = canvasElement.squareElement;
      // 点击后，判断鼠标是否处于矩形内（传入鼠标按下时的坐标）
      const isInside = isMouseInRectangle(
        cropBoxStore.drawGraphPosition.startX,
        cropBoxStore.drawGraphPosition.startY,
        {
          x: mouseX,
          y: mouseY,
          width,
          height
        },
        borderWidth
      );
      if (isInside) {
        console.log(`当前鼠标处于${canvasElement.id}矩形内`);
        // 更新当前操作元素的id
        drawingDataStore.updateActiveElementId(canvasElement.id);
        // 修改鼠标光标为手
        componentDomStore.setCursorStyle("move");

        // 清除当前id在画布上的数据
        drawingDataStore
          .clearCanvasElement(canvasElement.id)
          .then(clearArea => {
            screenShotCanvasStore.screenShotCanvas?.clearRect(
              clearArea.x,
              clearArea.y,
              clearArea.w,
              clearArea.h
            );
            // 绘制带边框节点的矩形
            drawRectangle(
              mouseX,
              mouseY,
              width,
              height,
              toolBarStore.selectedColor,
              toolBarStore.penSize,
              screenShotCanvasStore.screenShotCanvas as CanvasRenderingContext2D,
              {
                drawState: true,
                dotRadius: dotRadius
              }
            );
          });
      }
      break;

    default:
      break;
  }
};

export {
  calculateRectangleOffset,
  handleMouseMoveOnElement,
  calculateNewRectanglePosition,
  showCanvasActiveElementBorder
};
