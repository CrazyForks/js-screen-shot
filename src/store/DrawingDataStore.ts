import { makeAutoObservable } from "mobx";
import {
  cutOutBoxBorder,
  DrawingStoreDataType
} from "@/lib/type/ComponentType";

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
      canUndo: true
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
