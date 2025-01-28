import { makeAutoObservable, runInAction } from "mobx";
import { ComponentDomStoreDataType } from "@/lib/type/ComponentType";
import { takeOutHistory } from "@/lib/common-methods/TakeOutHistory";
import drawingDataStore from "@/store/DrawingDataStore";

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

  private getColorSelectPanel() {
    this.colorSelectPanel = document.getElementById("colorSelectPanel");
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
    // 重置组件状态
    drawingDataStore.resetCompState();
  }

  setNoScrollStatus(status?: boolean) {
    if (status != null) {
      this.noScrollStatus = status;
    }
  }
  setResetScrollbarState(state: boolean) {
    this.resetScrollbarState = state;
  }

  // 初始化webrtc模式所需要的辅助dom
  initWebRtcDom() {
    this.videoController = document.createElement("video");
    this.videoController.autoplay = true;
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

  updateCutBoxSizeShowState(domStyleState: "flex" | "none") {
    if (this.cutBoxSizeContainer == null) return;
    this.cutBoxSizeContainer.style.display = domStyleState;
  }

  updateTextInputShowState(domStyleState: "block" | "none") {
    if (this.textInputController == null) return;
    this.textInputController.style.display = domStyleState;
  }

  updateCutBoxSizePosition(left: number, top: number, sscTop: number) {
    if (this.cutBoxSizeContainer == null) return;
    this.cutBoxSizeContainer.style.left = `${left}px`;
    this.cutBoxSizeContainer.style.top = `${top + sscTop}px`;
  }

  updateCutBoxSizeInfo(width: number, height: number) {
    if (this.cutBoxSizeContainer == null) return;
    const childrenPanel = this.cutBoxSizeContainer.childNodes;
    // p标签已存在直接更改文本值即可
    if (childrenPanel.length > 0) {
      (childrenPanel[0] as HTMLParagraphElement).innerText = `${width} * ${height}`;
      return;
    }
    // 不存在则渲染
    const textPanel = document.createElement("p");
    textPanel.innerText = `${width} * ${height}`;
    this.cutBoxSizeContainer.appendChild(textPanel);
  }

  updateScreenShotControllerSize(width: number, height: number) {
    if (this.screenShotController == null) return;
    this.screenShotController.width = width;
    this.screenShotController.height = height;
  }

  updateScreenShotPosition(rLeft: number, rTop: number) {
    if (this.screenShotController == null) return;
    this.screenShotController.style.left = `${rLeft}px`;
    this.screenShotController.style.top = `${rTop}px`;
  }

  addColorSelectPanelClassStyle(className: string) {
    this.getColorSelectPanel();
    if (this.colorSelectPanel == null) return;
    this.colorSelectPanel.classList.add(className);
  }

  updateColorSelectPanelColor(color: string) {
    this.getColorSelectPanel();
    if (this.colorSelectPanel == null) return;
    this.colorSelectPanel.style.backgroundColor = color;
  }

  updateToolShowStatus(status: "block" | "none") {
    if (this.toolController == null) return;
    this.toolController.style.display = status;
  }

  updateToolPosition(rTop: number, rLeft: number) {
    if (this.toolController == null) return;
    this.toolController.style.left = `${rLeft}px`;
    let sscTop = 0;
    if (this.screenShotController) {
      sscTop = parseInt(this.screenShotController.style.top);
    }
    this.toolController.style.top = `${rTop + sscTop}px`;
  }

  // 显示截图区域容器
  showScreenShotPanel() {
    if (this.screenShotController == null) return;
    this.screenShotController.style.display = "block";
  }

  getBrushSelectionController() {
    this.brushSelectionController = document.getElementById(
      "brushSelectPanel"
    ) as HTMLDivElement | null;
  }

  getColorPanel() {
    this.colorSelectController = document.getElementById("colorPanel");
  }

  getRightPanel() {
    this.rightPanel = document.getElementById("rightPanel");
  }

  getUndoController() {
    this.undoController = document.getElementById("undoPanel");
  }

  updateToolOptionShowState(domStyleState: "block" | "none") {
    if (this.optionIcoController == null || this.optionController == null)
      return;
    this.optionIcoController.style.display = domStyleState;
    this.optionController.style.display = domStyleState;
  }

  updateToolOptIcon(domStyleState: "block" | "none") {
    if (this.optionIcoController == null) return;
    this.optionIcoController.style.display = domStyleState;
  }

  updateToolOptionPosition(
    icoLeft: string,
    icoTop: string,
    optionLeft: string,
    optionTop: string
  ) {
    if (this.optionIcoController == null || this.optionController == null)
      return;
    this.optionIcoController.style.left = icoLeft;
    this.optionIcoController.style.top = icoTop;
    this.optionController.style.left = optionLeft;
    this.optionController.style.top = optionTop;
  }

  updateBrushSelectionShowState(domStyleState: "block" | "none") {
    if (this.brushSelectionController == null) return;
    this.brushSelectionController.style.display = domStyleState;
  }

  updateColorPanelShowState(domStyleState: "flex" | "none") {
    if (this.colorSelectController == null) return;
    this.colorSelectController.style.display = domStyleState;
  }

  private undoFn() {
    takeOutHistory(this.screenShotController?.getContext("2d"), () => {
      // 禁用撤销功能
      drawingDataStore.updateCanUndo(false);
    });
  }

  updateRightPanelShowState(domStyleState: "flex" | "none") {
    if (this.rightPanel == null) return;
    this.rightPanel.style.display = domStyleState;
  }

  // 启用撤销按钮
  enableUndoButton() {
    if (this.undoController == null) return;
    this.undoController.classList.add("undo");
    this.undoController.classList.remove("undo-disabled");
    this.undoController.addEventListener("click", this.undoFn);
  }

  // 禁用撤销按钮
  disableUndoButton() {
    if (this.undoController == null) return;
    this.undoController.classList.add("undo-disabled");
    this.undoController.classList.remove("undo");
    this.undoController.removeEventListener("click", this.undoFn);
  }

  // 重置状态
  reset() {
    Object.assign(this, this.initialState());
  }
}

const componentDomStore = new ComponentDomStore();

export default componentDomStore;
