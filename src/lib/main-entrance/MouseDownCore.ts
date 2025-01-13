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
import { fixedData } from "@/lib/common-methods/FixedData";

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

export { operatingCutOutBox };
