import { makeAutoObservable, runInAction } from "mobx";
import cropBoxStore from "@/store/CropBoxStore";
import screenShotCanvasStore from "@/store/ScreenShotCanvasStore";
import toolBarStore from "@/store/ToolBarStore";
import userParamStore from "@/store/UserParamStore";

class ComponentDomStore {
  // 初始状态封装对象
  private initialState() {
    return {
      screenShotController: null as HTMLCanvasElement | null,
      toolController: null as HTMLDivElement | null,
      optionIcoController: null as HTMLDivElement | null,
      optionController: null as HTMLDivElement | null,
      cutBoxSizeContainer: null as HTMLDivElement | null,
      textInputController: null as HTMLDivElement | null,
      colorSelectPanel: null as HTMLElement | null,
      textSizeContainer: null as HTMLDivElement | null,
      optionTextSizeController: null as HTMLDivElement | null,
      brushSelectionController: null as HTMLDivElement | null,
      colorSelectController: null as HTMLElement | null,
      rightPanel: null as HTMLElement | null,
      undoController: null as HTMLElement | null,
      videoController: null as HTMLVideoElement | null,
      noScrollStatus: false,
      resetScrollbarState: false
    };
  }

  // 可观察属性
  screenShotController: HTMLCanvasElement | null = this.initialState()
    .screenShotController;
  toolController: HTMLDivElement | null = this.initialState().toolController;
  optionIcoController: HTMLDivElement | null = this.initialState()
    .optionIcoController;
  optionController: HTMLDivElement | null = this.initialState()
    .optionController;
  cutBoxSizeContainer: HTMLDivElement | null = this.initialState()
    .cutBoxSizeContainer;
  textInputController: HTMLDivElement | null = this.initialState()
    .textInputController;
  colorSelectPanel: HTMLElement | null = this.initialState().colorSelectPanel;
  textSizeContainer: HTMLDivElement | null = this.initialState()
    .textSizeContainer;
  optionTextSizeController: HTMLDivElement | null = this.initialState()
    .optionTextSizeController;
  brushSelectionController: HTMLDivElement | null = this.initialState()
    .brushSelectionController;
  colorSelectController: HTMLElement | null = this.initialState()
    .colorSelectController;
  rightPanel: HTMLElement | null = this.initialState().rightPanel;
  undoController: HTMLElement | null = this.initialState().undoController;
  videoController: HTMLVideoElement | null = this.initialState()
    .videoController;

  // 截图容器是否可滚动
  noScrollStatus: boolean = this.initialState().noScrollStatus;
  // 是否需要还原页面的滚动条状态
  resetScrollbarState: boolean = this.initialState().resetScrollbarState;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  destroyDOM() {
    if (
      this.screenShotController == null ||
      this.toolController == null ||
      this.optionIcoController == null ||
      this.optionController == null ||
      this.textInputController == null ||
      this.cutBoxSizeContainer == null
    )
      return;
    // 销毁dom
    if (this.noScrollStatus) {
      document.body.classList.remove("__screenshot-lock-scroll");
    }
    document.body.removeChild(this.screenShotController);
    document.body.removeChild(this.toolController);
    document.body.removeChild(this.optionIcoController);
    document.body.removeChild(this.optionController);
    document.body.removeChild(this.textInputController);
    document.body.removeChild(this.cutBoxSizeContainer);
    if (document.body.classList.contains("no-cursor")) {
      document.body.classList.remove("no-cursor");
    }
    if (this.resetScrollbarState) {
      // 还原滚动条状态
      document.documentElement.classList.remove("hidden-screen-shot-scroll");
      document.body.classList.remove("hidden-screen-shot-scroll");
    }
    // store中的状态重置
    this.resetStore();
  }

  setNoScrollStatus(status?: boolean) {
    if (status != null) {
      this.noScrollStatus = status;
    }
  }

  private resetStore() {
    runInAction(() => {
      this.reset();
      cropBoxStore.reset();
      screenShotCanvasStore.reset();
      toolBarStore.reset();
      userParamStore.reset();
    });
  }

  setResetScrollbarState(state: boolean) {
    this.resetScrollbarState = state;
  }

  // 初始化webrtc模式所需要的辅助dom
  initWebRtcDom() {
    componentDomStore.videoController = document.createElement("video");
    componentDomStore.videoController.autoplay = true;
  }

  setVideoSrcObject(videoSrcObject: MediaStream | null) {
    if (this.videoController == null) return;
    this.videoController.srcObject = videoSrcObject;
  }

  // 重置状态
  reset() {
    Object.assign(this, this.initialState());
  }
}

const componentDomStore = new ComponentDomStore();

export default componentDomStore;
