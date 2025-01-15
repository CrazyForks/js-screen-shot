import { makeAutoObservable, runInAction } from "mobx";
import cropBoxStore from "@/store/CropBoxStore";
import screenShotCanvasStore from "@/store/ScreenShotCanvasStore";
import toolBarStore from "@/store/ToolBarStore";
import userParamStore from "@/store/UserParamStore";
import { ComponentDomStoreDataType } from "@/lib/type/ComponentType";

class ComponentDomStore {
  // 初始状态封装对象
  private initialState(): ComponentDomStoreDataType {
    return {
      screenShotController: null,
      toolController: null,
      optionIcoController: null,
      optionController: null,
      cutBoxSizeContainer: null,
      textInputController: null,
      colorSelectPanel: null,
      textSizeContainer: null,
      optionTextSizeController: null,
      brushSelectionController: null,
      colorSelectController: null,
      rightPanel: null,
      undoController: null,
      videoController: null,
      noScrollStatus: false,
      resetScrollbarState: false
    };
  }

  // 可观察属性
  screenShotController = this.initialState().screenShotController;
  toolController = this.initialState().toolController;
  optionIcoController = this.initialState().optionIcoController;
  optionController = this.initialState().optionController;
  cutBoxSizeContainer = this.initialState().cutBoxSizeContainer;
  textInputController = this.initialState().textInputController;
  colorSelectPanel = this.initialState().colorSelectPanel;
  textSizeContainer = this.initialState().textSizeContainer;
  optionTextSizeController = this.initialState().optionTextSizeController;
  brushSelectionController = this.initialState().brushSelectionController;
  colorSelectController = this.initialState().colorSelectController;
  rightPanel = this.initialState().rightPanel;
  undoController = this.initialState().undoController;
  videoController = this.initialState().videoController;

  // 截图容器是否可滚动
  noScrollStatus = this.initialState().noScrollStatus;
  // 是否需要还原页面的滚动条状态
  resetScrollbarState = this.initialState().resetScrollbarState;

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

  // 从dom中获取截图所需的canvas容器并设置到store中
  setCanvasContainer() {
    this.screenShotController = document.getElementById(
      "screenShotContainer"
    ) as HTMLCanvasElement | null;
    this.toolController = document.getElementById(
      "toolPanel"
    ) as HTMLDivElement | null;
    this.textInputController = document.getElementById(
      "textInputPanel"
    ) as HTMLDivElement | null;
    this.optionController = document.getElementById(
      "optionPanel"
    ) as HTMLDivElement | null;
    this.optionIcoController = document.getElementById(
      "optionIcoController"
    ) as HTMLDivElement | null;
    this.cutBoxSizeContainer = document.getElementById(
      "cutBoxSizePanel"
    ) as HTMLDivElement | null;
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
