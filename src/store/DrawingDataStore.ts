import { makeAutoObservable } from "mobx";
import {
  cutOutBoxBorder,
  movePositionType,
  positionInfoType
} from "@/lib/type/ComponentType";

class DrawingDataStore {
  private initialState() {
    return {
      dpr: window.devicePixelRatio || 1,
      getFullScreenStatus: false,
      // 裁剪框边框节点坐标事件
      cutOutBoxBorderArr: [] as Array<cutOutBoxBorder>,
      // webrtc模式下的屏幕流数据
      captureStream: null as MediaStream | null,
      // 点击裁剪框时的鼠标坐标
      movePosition: {
        moveStartX: 0,
        moveStartY: 0
      } as movePositionType,
      // 当前操作的边框节点
      borderOption: null as number | null,
      // 鼠标是否在裁剪框内
      mouseInsideCropBox: false as boolean,
      // 临时图形位置参数
      tempGraphPosition: {
        startX: 0,
        startY: 0,
        width: 0,
        height: 0
      } as positionInfoType
    };
  }

  dpr = this.initialState().dpr;
  getFullScreenStatus = this.initialState().getFullScreenStatus;
  cutOutBoxBorderArr = this.initialState().cutOutBoxBorderArr;
  captureStream = this.initialState().captureStream;
  movePosition = this.initialState().movePosition;
  borderOption = this.initialState().borderOption;
  mouseInsideCropBox = this.initialState().mouseInsideCropBox;
  tempGraphPosition = this.initialState().tempGraphPosition;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  updateDpr(dpr: number) {
    this.dpr = dpr;
  }

  updateFullScreenStatus(status: boolean) {
    this.getFullScreenStatus = status;
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

  // 重置状态
  reset() {
    Object.assign(this, this.initialState());
  }
}

const drawingDataStore = new DrawingDataStore();

export default drawingDataStore;
