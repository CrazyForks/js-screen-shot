import { makeObservable, observable, action } from "mobx";
import {
  customToolbarType,
  mouseEventType,
  screenShotType,
  userToolbarType
} from "@/lib/type/ComponentType";

class UserParamStore {
  @observable enableWebRtc = true;
  // electron环境下使用webrtc需要自己传入屏幕流
  @observable screenFlow: MediaStream | null = null;

  // 画布宽高
  @observable canvasWidth = 0;
  @observable canvasHeight = 0;

  // 展示截屏图片至容器
  @observable showScreenData = false;
  @observable screenShotDom: HTMLElement | null = null;

  //  确认截图时，是否需要销毁dom
  @observable destroyContainer = true;
  // 蒙层颜色
  @observable maskColor = { r: 0, g: 0, b: 0, a: 0.6 };
  // 是否将截图内容写入剪切板
  @observable writeBase64 = true;
  @observable cutBoxBdColor = "#2CABFF";
  @observable maxUndoNum = 15;
  // 是否使用等比例箭头
  @observable useRatioArrow = false;
  // 是否开启图片自适应
  @observable imgAutoFit = false;
  // 手动传入图片内容时，是否需要自定义其宽高
  @observable useCustomImgSize = false;
  @observable customImgSize = { w: 0, h: 0 };

  // 调用者定义的工具栏数据
  @observable userToolbar: Array<customToolbarType> = [];
  @observable h2cCrossImgLoadErrFn:
    | screenShotType["h2cImgLoadErrCallback"]
    | null = null;
  @observable saveCallback: ((code: number, msg: string) => void) | null = null;
  // 工具栏保存图片时的文件名
  @observable saveImgTitle: string | null = null;
  // 截图画布的事件监听
  @observable canvasEvents: mouseEventType | null = null;

  constructor() {
    makeObservable(this);
  }

  // 设置webrtc启用状态
  @action.bound
  setWebRtcStatus(status: boolean) {
    this.enableWebRtc = status;
  }

  @action.bound
  setScreenShotDom(dom: HTMLElement) {
    this.screenShotDom = dom;
  }

  @action.bound
  setCutBoxBdColor(color: string) {
    this.cutBoxBdColor = color;
  }

  // 设置屏幕流
  @action.bound
  setScreenFlow(stream: MediaStream) {
    this.screenFlow = stream;
  }

  // 获取画布宽高
  getCanvasSize() {
    return { canvasWidth: this.canvasWidth, canvasHeight: this.canvasHeight };
  }

  // 设置画布宽高
  @action.bound
  setCanvasSize(width: number, height: number) {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  // 设置展示图片至容器的状态
  @action.bound
  setShowScreenDataStatus(status: boolean) {
    this.showScreenData = status;
  }

  // 设置蒙层颜色
  @action.bound
  setMaskColor(color: { r: number; g: number; b: number; a: number }) {
    this.maskColor = color;
  }

  // 设置截图数据的写入状态
  @action.bound
  setWriteImgState(state: boolean) {
    this.writeBase64 = state;
  }

  @action.bound
  setSaveCallback(saveFn: (code: number, msg: string) => void) {
    this.saveCallback = saveFn;
  }

  @action.bound
  setMaxUndoNum(num: number) {
    this.maxUndoNum = num;
  }

  @action.bound
  setRatioArrow(state: boolean) {
    this.useRatioArrow = state;
  }

  @action.bound
  setImgAutoFit(state: boolean) {
    this.imgAutoFit = state;
  }

  @action.bound
  setUseCustomImgSize(state: boolean, sizeInfo?: { w: number; h: number }) {
    if (state && sizeInfo) {
      this.useCustomImgSize = true;
      this.customImgSize = sizeInfo;
    }
  }

  getCustomImgSize() {
    return {
      useCustomImgSize: this.useCustomImgSize,
      customImgSize: this.customImgSize
    };
  }

  @action.bound
  setSaveImgTitle(title: string) {
    this.saveImgTitle = title;
  }

  @action.bound
  setDestroyContainerState(state: boolean) {
    this.destroyContainer = state;
  }

  @action.bound
  setUserToolbar(toolbar: Array<userToolbarType>) {
    const toolbarData: Array<customToolbarType> = [];
    for (let i = 0; i < toolbar.length; i++) {
      const item = toolbar[i];
      // 自定义工具栏id从100开始
      toolbarData.push({ ...item, id: 100 + (i + 1) });
    }
    this.userToolbar = toolbarData;
  }

  @action.bound
  setH2cCrossImgLoadErrFn(fn: screenShotType["h2cImgLoadErrCallback"]) {
    this.h2cCrossImgLoadErrFn = fn;
  }

  @action.bound
  setCanvasEvents(event: mouseEventType) {
    this.canvasEvents = event;
  }

  getCanvasEvents() {
    return this.canvasEvents;
  }
}

const userParamStore = new UserParamStore();

export default userParamStore;
