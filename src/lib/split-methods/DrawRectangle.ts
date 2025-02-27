import { squareElementType } from "@/lib/type/ComponentType";
import screenShotCanvasStore from "@/store/ScreenShotCanvasStore";

interface RectangleData {
  rectX: number;
  rectY: number;
  width: number;
  height: number;
}

export function calculateRectangleCorners(
  mouseX: number,
  mouseY: number,
  width: number,
  height: number
) {
  return [
    { x: mouseX, y: mouseY }, // 左上角
    { x: mouseX + width, y: mouseY }, // 右上角
    { x: mouseX + width, y: mouseY + height }, // 右下角
    { x: mouseX, y: mouseY + height }, // 左下角
    { x: mouseX + width / 2, y: mouseY }, // 上中点
    { x: mouseX + width, y: mouseY + height / 2 }, // 右中点
    { x: mouseX + width / 2, y: mouseY + height }, // 下中点
    { x: mouseX, y: mouseY + height / 2 } // 左中点
  ];
}

// 清除操作圆点
export function clearRectangleDots(
  mouseX: number,
  mouseY: number,
  width: number,
  height: number,
  dotRadius: number
) {
  const corners = calculateRectangleCorners(mouseX, mouseY, width, height);
  corners.forEach(corner => {
    const clearRadius = dotRadius + 1; // 增加1px的边框宽度
    (screenShotCanvasStore.screenShotCanvas as CanvasRenderingContext2D).clearRect(
      corner.x - clearRadius,
      corner.y - clearRadius,
      clearRadius * 2,
      clearRadius * 2
    );
  });
}

/**
 * 绘制矩形并在边框上添加圆点
 * @param mouseX
 * @param mouseY
 * @param width
 * @param height
 * @param color 边框颜色
 * @param borderWidth 边框大小
 * @param drawDots 是否在边框上绘制圆点
 * @param context 需要进行绘制的canvas画布
 */
export function drawRectangle(
  mouseX: squareElementType["mouseX"],
  mouseY: squareElementType["mouseY"],
  width: squareElementType["width"],
  height: squareElementType["height"],
  color: squareElementType["color"],
  borderWidth: squareElementType["borderWidth"],
  context: CanvasRenderingContext2D,
  drawDots?: {
    drawState: boolean; // 控制是否绘制圆点
    dotRadius: number; // 圆点的半径
  }
) {
  context.save();
  // 设置边框颜色
  context.strokeStyle = color;
  // 设置边框大小
  context.lineWidth = borderWidth;
  context.beginPath();
  // 绘制矩形
  context.rect(mouseX, mouseY, width, height);
  context.stroke();

  if (drawDots && drawDots.drawState) {
    // 计算矩形的8个角的位置
    const corners = calculateRectangleCorners(mouseX, mouseY, width, height);
    // 在每个角绘制一个圆点
    corners.forEach(corner => {
      context.beginPath();
      context.arc(corner.x, corner.y, drawDots.dotRadius, 0, Math.PI * 2);
      context.fillStyle = "#ffffff";
      context.fill();
      // 设置圆点边框
      context.lineWidth = 1; // 设置边框宽度为1px
      context.strokeStyle = color; // 设置边框颜色
      context.stroke();
    });
  }

  // 绘制结束
  context.restore();
}

/**
 * 处理矩形控制点拖拽缩放
 * @param originalX 矩形原始左上角X坐标
 * @param originalY 矩形原始左上角Y坐标
 * @param originalWidth 矩形原始宽度
 * @param originalHeight 矩形原始高度
 * @param pointIndex 被拖拽的控制点索引 (0-7对应8个点)
 * @param newMouseX 当前鼠标X坐标
 * @param newMouseY 当前鼠标Y坐标
 * @returns 更新后的矩形参数 {mouseX, mouseY, width, height}
 */
export function resizeRectangle(
  originalX: number,
  originalY: number,
  originalWidth: number,
  originalHeight: number,
  pointIndex: number,
  newMouseX: number,
  newMouseY: number
): {
  mouseX: number;
  mouseY: number;
  width: number;
  height: number;
} {
  let newX = originalX;
  let newY = originalY;
  let newWidth = originalWidth;
  let newHeight = originalHeight;

  // 根据拖拽点的索引处理不同情况
  switch (pointIndex) {
    case 0: // 左上角
      newWidth = originalX + originalWidth - newMouseX;
      newHeight = originalY + originalHeight - newMouseY;
      newX = newMouseX;
      newY = newMouseY;
      break;
    case 1: // 右上角
      newWidth = newMouseX - originalX;
      newHeight = originalY + originalHeight - newMouseY;
      newY = newMouseY;
      break;
    case 2: // 右下角
      newWidth = newMouseX - originalX;
      newHeight = newMouseY - originalY;
      break;
    case 3: // 左下角
      newWidth = originalX + originalWidth - newMouseX;
      newHeight = newMouseY - originalY;
      newX = newMouseX;
      break;
    case 4: // 上中点
      newHeight = originalY + originalHeight - newMouseY;
      newY = newMouseY;
      break;
    case 5: // 右中点
      newWidth = newMouseX - originalX;
      break;
    case 6: // 下中点
      newHeight = newMouseY - originalY;
      break;
    case 7: // 左中点
      newWidth = originalX + originalWidth - newMouseX;
      newX = newMouseX;
      break;
  }

  // 确保宽度和高度不为负数
  if (newWidth < 0) {
    newX = newX + newWidth;
    newWidth = Math.abs(newWidth);
  }
  if (newHeight < 0) {
    newY = newY + newHeight;
    newHeight = Math.abs(newHeight);
  }

  return {
    mouseX: newX,
    mouseY: newY,
    width: newWidth,
    height: newHeight
  };
}

// 处理矩形整体拖动
export function dragRectangle(
  mouseX: number,
  mouseY: number,
  initialRectX: number,
  initialRectY: number,
  offsetX: number,
  offsetY: number
): RectangleData {
  // 计算新的矩形位置
  const newRectX = mouseX - offsetX;
  const newRectY = mouseY - offsetY;

  // 返回新的矩形数据
  return {
    rectX: newRectX,
    rectY: newRectY,
    width: initialRectX + offsetX - newRectX, // 保持宽度不变
    height: initialRectY + offsetY - newRectY // 保持高度不变
  };
}
