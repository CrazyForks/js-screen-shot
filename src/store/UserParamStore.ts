import { makeAutoObservable } from "mobx";
import {
  customToolbarType,
  mouseEventType,
  screenShotType,
  userToolbarType
} from "@/lib/type/ComponentType";

class UserParamStore {
  private initialState() {
    return {
      enableWebRtc: true,
      screenFlow: null as MediaStream | null,
      canvasWidth: 0,
      canvasHeight: 0,
      showScreenData: false,
      screenShotDom: null as HTMLElement | null,
      destroyContainer: true,
      maskColor: { r: 0, g: 0, b: 0, a: 0.6 },
      writeBase64: true,
      cutBoxBdColor: "#2CABFF",
      maxUndoNum: 15,
      useRatioArrow: false,
      imgAutoFit: false,
      useCustomImgSize: false,
      customImgSize: { w: 0, h: 0 },
      userToolbar: [] as Array<customToolbarType>,
      h2cCrossImgLoadErrFn: null as
        | screenShotType["h2cImgLoadErrCallback"]
        | null,
      saveCallback: null as ((code: number, msg: string) => void) | null,
      saveImgTitle: null as string | null,
      canvasEvents: null as mouseEventType | null
    };
  }

  enableWebRtc: boolean = this.initialState().enableWebRtc;
  screenFlow: MediaStream | null = this.initialState().screenFlow;
  private canvasWidth: number = this.initialState().canvasWidth;
  private canvasHeight: number = this.initialState().canvasHeight;
  showScreenData: boolean = this.initialState().showScreenData;
  screenShotDom: HTMLElement | null = this.initialState().screenShotDom;
  destroyContainer: boolean = this.initialState().destroyContainer;
  maskColor: {
    r: number;
    g: number;
    b: number;
    a: number;
  } = this.initialState().maskColor;
  writeBase64: boolean = this.initialState().writeBase64;
  cutBoxBdColor: string = this.initialState().cutBoxBdColor;
  maxUndoNum: number = this.initialState().maxUndoNum;
  useRatioArrow: boolean = this.initialState().useRatioArrow;
  imgAutoFit: boolean = this.initialState().imgAutoFit;
  useCustomImgSize: boolean = this.initialState().useCustomImgSize;
  customImgSize: { w: number; h: number } = this.initialState().customImgSize;
  userToolbar: Array<customToolbarType> = this.initialState().userToolbar;
  h2cCrossImgLoadErrFn:
    | screenShotType["h2cImgLoadErrCallback"]
    | null = this.initialState().h2cCrossImgLoadErrFn;
  saveCallback:
    | ((code: number, msg: string) => void)
    | null = this.initialState().saveCallback;
  saveImgTitle: string | null = this.initialState().saveImgTitle;
  canvasEvents: mouseEventType | null = this.initialState().canvasEvents;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // 设置 WebRTC 启用状态
  setWebRtcStatus(status: boolean) {
    this.enableWebRtc = status;
  }

  // 设置截图 DOM
  setScreenShotDom(dom: HTMLElement) {
    this.screenShotDom = dom;
  }

  // 设置切割框边框颜色
  setCutBoxBdColor(color: string) {
    this.cutBoxBdColor = color;
  }

  // 设置屏幕流
  setScreenFlow(stream: MediaStream) {
    this.screenFlow = stream;
  }

  // 获取画布宽高
  getCanvasSize() {
    return { canvasWidth: this.canvasWidth, canvasHeight: this.canvasHeight };
  }

  // 设置画布宽高
  setCanvasSize(width: number, height: number) {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  // 设置展示图片至容器的状态
  setShowScreenDataStatus(status: boolean) {
    this.showScreenData = status;
  }

  // 设置蒙层颜色
  setMaskColor(color: { r: number; g: number; b: number; a: number }) {
    this.maskColor = color;
  }

  // 设置截图数据的写入状态
  setWriteImgState(state: boolean) {
    this.writeBase64 = state;
  }

  // 设置保存回调函数
  setSaveCallback(saveFn: (code: number, msg: string) => void) {
    this.saveCallback = saveFn;
  }

  // 设置最大撤销次数
  setMaxUndoNum(num: number) {
    this.maxUndoNum = num;
  }

  // 设置是否使用等比例箭头
  setRatioArrow(state: boolean) {
    this.useRatioArrow = state;
  }

  // 设置是否开启图片自适应
  setImgAutoFit(state: boolean) {
    this.imgAutoFit = state;
  }

  // 设置是否使用自定义图片大小
  setUseCustomImgSize(state: boolean, sizeInfo?: { w: number; h: number }) {
    if (state && sizeInfo) {
      this.useCustomImgSize = true;
      this.customImgSize = sizeInfo;
    } else {
      this.useCustomImgSize = false;
      this.customImgSize = this.initialState().customImgSize;
    }
  }

  // 获取自定义图片大小
  getCustomImgSize() {
    return {
      useCustomImgSize: this.useCustomImgSize,
      customImgSize: this.customImgSize
    };
  }

  // 设置保存图片标题
  setSaveImgTitle(title: string) {
    this.saveImgTitle = title;
  }

  // 设置是否销毁容器状态
  setDestroyContainerState(state: boolean) {
    this.destroyContainer = state;
  }

  // 设置用户工具栏
  setUserToolbar(toolbar: Array<userToolbarType>) {
    const toolbarData: Array<customToolbarType> = toolbar.map(
      (item, index) => ({
        ...item,
        id: 100 + (index + 1)
      })
    );
    this.userToolbar = toolbarData;
  }

  // 设置图片加载错误回调函数
  setH2cCrossImgLoadErrFn(fn: screenShotType["h2cImgLoadErrCallback"]) {
    this.h2cCrossImgLoadErrFn = fn;
  }

  // 设置画布事件监听
  setCanvasEvents(event: mouseEventType) {
    this.canvasEvents = event;
  }

  // 获取画布事件监听
  getCanvasEvents() {
    return this.canvasEvents;
  }

  // 重置状态
  reset() {
    Object.assign(this, this.initialState());
  }
}

const userParamStore = new UserParamStore();

export default userParamStore;
