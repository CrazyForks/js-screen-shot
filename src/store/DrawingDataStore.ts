import { makeAutoObservable } from "mobx";
import {
  cutOutBoxBorder,
  drawElementInfoType,
  DrawingStoreDataType,
  squareElementType
} from "@/lib/type/ComponentType";
import { isMouseInRectangle } from "@/lib/split-methods/ShapeUtils";

class DrawingDataStore {
  private initialState(): DrawingStoreDataType {
    return {
      dpr: window.devicePixelRatio || 1,
      getFullScreenStatus: false,
      // 裁剪框边框节点坐标事件
      cutOutBoxBorderArr: [],
      // webrtc模式下的屏幕流数据
      captureStream: null,
      // 点击裁剪框时的鼠标坐标
      movePosition: {
        moveStartX: 0,
        moveStartY: 0
      },
      history: [],
      // 当前操作的边框节点
      borderOption: null,
      // 鼠标是否在裁剪框内
      mouseInsideCropBox: false,
      // 临时图形位置参数
      tempGraphPosition: {
        startX: 0,
        startY: 0,
        width: 0,
        height: 0
      },
      // 文本输入框位置
      textInputPosition: {
        mouseX: 0,
        mouseY: 0
      },
      // 上一个裁剪框坐标信息
      drawGraphPrevX: 0,
      drawGraphPrevY: 0,
      drawStatus: false,
      // 马赛克涂抹区域大小
      degreeOfBlur: 5,
      resetAllStore: false,
      canUndo: true,
      canvasElements: [],
      // 当前正在操作的元素id
      activeElementId: null,
      // 当前选中的矩形元素的操作节点索引
      rectOperateIndex: null
    };
  }

  dpr = this.initialState().dpr;
  getFullScreenStatus = this.initialState().getFullScreenStatus;
  cutOutBoxBorderArr = this.initialState().cutOutBoxBorderArr;
  captureStream = this.initialState().captureStream;
  // 画笔历史记录
  history: Array<Record<string, any>> = this.initialState().history;
  movePosition = this.initialState().movePosition;
  borderOption = this.initialState().borderOption;
  mouseInsideCropBox = this.initialState().mouseInsideCropBox;
  tempGraphPosition = this.initialState().tempGraphPosition;
  textInputPosition = this.initialState().textInputPosition;
  drawGraphPrevX = this.initialState().drawGraphPrevX;
  drawGraphPrevY = this.initialState().drawGraphPrevY;
  drawStatus = this.initialState().drawStatus;
  degreeOfBlur = this.initialState().degreeOfBlur;
  resetAllStore = this.initialState().resetAllStore;
  canUndo = this.initialState().canUndo;
  canvasElements = this.initialState().canvasElements;
  activeElementId = this.initialState().activeElementId;
  rectOperateIndex = this.initialState().rectOperateIndex;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  updateDpr(dpr: number) {
    this.dpr = dpr;
  }

  updateFullScreenStatus(status: boolean) {
    this.getFullScreenStatus = status;
  }

  resetCompState() {
    this.resetAllStore = true;
  }

  updateCanUndo(canUndo: boolean) {
    this.canUndo = canUndo;
  }

  updateCutOutBoxBorderArr(borderArr: Array<cutOutBoxBorder>) {
    this.cutOutBoxBorderArr = borderArr;
  }

  updateCaptureStream(captureStream: MediaStream) {
    this.captureStream = captureStream;
  }

  updateMovePosition(moveStartX: number, moveStartY: number) {
    this.movePosition = {
      moveStartX,
      moveStartY
    };
  }

  updateBorderOption(borderOption: number | null) {
    this.borderOption = borderOption;
  }

  updateMouseInsideCropBox(insideState: boolean) {
    this.mouseInsideCropBox = insideState;
  }

  updateTempGraphPosition(
    startX: number,
    startY: number,
    width: number,
    height: number
  ) {
    this.tempGraphPosition = {
      startX,
      startY,
      width,
      height
    };
  }

  updateTextInputPosition(mouseX: number, mouseY: number) {
    this.textInputPosition = {
      mouseX,
      mouseY
    };
  }

  updateDrawGraphPrevInfo(x: number, y: number) {
    this.drawGraphPrevX = x;
    this.drawGraphPrevY = y;
  }

  updateDrawStatus(status: boolean) {
    this.drawStatus = status;
  }

  // 移除历史记录的第一个元素
  shiftHistory() {
    return this.history.shift();
  }

  // 移除历史记录的最后一个元素
  popHistory() {
    return this.history.pop();
  }

  addElement(element: drawElementInfoType) {
    this.canvasElements.push(element);
  }

  removeElement(id: drawElementInfoType["id"]) {
    this.canvasElements = this.canvasElements.filter(item => item.id !== id);
  }

  updateCanvasElement(element: squareElementType, id: string | null) {
    for (let i = 0; i < this.canvasElements.length; i++) {
      if (this.canvasElements[i].id === id) {
        this.canvasElements[i] = {
          ...this.canvasElements[i],
          squareElement: element
        };
      }
    }
  }

  clearEmptyCanvasElements(callback: (filteredLength: number) => void) {
    // 宽高都为0也需要过滤
    // todo:找出空元素后，把结果返回，回调函数中需要做二次处理
    const findEmptyElement = this.canvasElements.filter(
      item =>
        item.squareElement !== null &&
        item.squareElement?.width !== 0 &&
        item.squareElement?.height !== 0
    );
    callback(findEmptyElement.length);
    this.canvasElements = findEmptyElement;
  }

  // 校验鼠标是否处于元素上
  checkMouseInElement(
    x: number,
    y: number,
    callback: (elementId: string | null) => void
  ) {
    for (let i = 0; i < this.canvasElements.length; i++) {
      const canvasElement = drawingDataStore.canvasElements[i];
      // 矩形元素的判断
      if (canvasElement.squareElement != null) {
        const {
          mouseX,
          mouseY,
          width,
          height,
          borderWidth
        } = canvasElement.squareElement;
        const isInside = isMouseInRectangle(
          x,
          y,
          {
            x: mouseX,
            y: mouseY,
            width,
            height
          },
          borderWidth
        );
        if (isInside) {
          callback(canvasElement.id);
          return;
        }
      }
    }
    callback(null);
  }

  // 清除指定区域的元素
  clearCanvasElement(
    id: drawElementInfoType["id"]
  ): Promise<{ x: number; y: number; w: number; h: number }> {
    // 找到id对应的元素
    const element = this.canvasElements.find(item => item.id === id);
    return new Promise((resolve, reject) => {
      if (element?.squareElement) {
        // 计算并返回要清除的区域数据
        resolve({
          x: element?.squareElement.mouseX - element?.squareElement.borderWidth,
          y: element?.squareElement.mouseY - element?.squareElement.borderWidth,
          w:
            element?.squareElement.width +
            element?.squareElement.borderWidth * 2,
          h:
            element?.squareElement.height +
            element?.squareElement.borderWidth * 2
        });
      }
      reject("清除失败");
    });
  }
  getCanvasElement(id: drawElementInfoType["id"]) {
    return this.canvasElements.find(item => item.id === id);
  }

  // 更新正在操作的元素id
  updateActiveElementId(id: drawElementInfoType["id"] | null) {
    this.activeElementId = id;
  }

  updateRectOperateIndex(index: number) {
    this.rectOperateIndex = index;
  }

  // 添加历史记录
  pushHistory(item: Record<string, any>) {
    this.history.push(item);
  }

  // 重置状态
  reset() {
    Object.assign(this, this.initialState());
  }
}

const drawingDataStore = new DrawingDataStore();

export default drawingDataStore;
