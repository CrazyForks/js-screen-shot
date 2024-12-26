import { makeAutoObservable } from "mobx";
import componentDomStore from "@/store/ComponentDomStore";
import { getToolRelativePosition } from "@/lib/common-methods/GetToolRelativePosition";
import { textInfoType } from "@/lib/type/ComponentType";
import { takeOutHistory } from "@/lib/common-methods/TakeOutHistory";

class ToolBarStore {
  private initialState() {
    return {
      toolClickStatus: false,
      selectedColor: "#F53340",
      toolName: "",
      toolId: null as number | null,
      penSize: 2,
      fontSize: 17,
      mosaicPenSize: 10,
      history: [] as Array<Record<string, any>>,
      toolPositionStatus: false,
      activeTool: "",
      textEditState: false,
      textInfo: {
        positionX: 0,
        positionY: 0,
        color: "#000000",
        size: 0
      } as textInfoType
    };
  }

  toolClickStatus: boolean = this.initialState().toolClickStatus;
  selectedColor: string = this.initialState().selectedColor;
  toolName: string = this.initialState().toolName;
  toolId: number | null = this.initialState().toolId;
  // 当前选择的画笔大小
  penSize: number = this.initialState().penSize;
  // 当前选择的字体大小
  fontSize: number = this.initialState().fontSize;
  // 马赛克工具的笔触大小
  mosaicPenSize: number = this.initialState().mosaicPenSize;
  // 画笔历史记录
  history: Array<Record<string, any>> = this.initialState().history;
  // 工具栏超出截图容器状态
  toolPositionStatus: boolean = this.initialState().toolPositionStatus;
  // 当前选中的工具
  activeTool: string = this.initialState().activeTool;
  // 当前是否处于文本编辑状态
  textEditState: boolean = this.initialState().textEditState;
  textInfo: textInfoType = this.initialState().textInfo;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // 获取工具栏 DOM 控制器
  getToolController() {
    componentDomStore.toolController = document.getElementById(
      "toolPanel"
    ) as HTMLDivElement | null;
    return componentDomStore.toolController;
  }

  getOptionController() {
    componentDomStore.optionController = document.getElementById(
      "optionPanel"
    ) as HTMLDivElement | null;
    return componentDomStore.optionController;
  }

  // 获取截图工具栏画笔选择工具 DOM
  getOptionIcoController() {
    componentDomStore.optionIcoController = document.getElementById(
      "optionIcoController"
    ) as HTMLDivElement | null;
    return componentDomStore.optionIcoController;
  }

  getColorSelectPanel() {
    componentDomStore.colorSelectPanel = document.getElementById(
      "colorSelectPanel"
    );
    return componentDomStore.colorSelectPanel;
  }

  // 设置截图工具栏展示状态
  setToolStatus(status: boolean) {
    // 获取一次最新的工具栏 DOM
    this.getToolController();
    if (componentDomStore.toolController == null) return;
    componentDomStore.toolController.style.display = status ? "block" : "none";
  }

  // 设置截图工具位置信息
  setToolInfo(left: number, top: number) {
    this.getToolController();
    if (componentDomStore.toolController == null) return;
    const { left: rLeft, top: rTop } = getToolRelativePosition(left, top);
    componentDomStore.toolController.style.left = `${rLeft}px`;
    let sscTop = 0;
    if (componentDomStore.screenShotController) {
      sscTop = parseInt(componentDomStore.screenShotController.style.top);
    }
    componentDomStore.toolController.style.top = `${rTop + sscTop}px`;
  }

  // 获取工具栏位置
  getToolPosition() {
    this.getToolController();
    if (componentDomStore.toolController == null) return;
    return {
      left: componentDomStore.toolController.offsetLeft,
      top: componentDomStore.toolController.offsetTop
    };
  }

  private getBrushSelectionController() {
    componentDomStore.brushSelectionController = document.getElementById(
      "brushSelectPanel"
    ) as HTMLDivElement | null;
    return componentDomStore.brushSelectionController;
  }

  private getColorPanel() {
    componentDomStore.colorSelectController = document.getElementById(
      "colorPanel"
    );
    return componentDomStore.colorSelectController;
  }

  private getRightPanel() {
    componentDomStore.rightPanel = document.getElementById("rightPanel");
    return componentDomStore.rightPanel;
  }

  private getUndoController() {
    componentDomStore.undoController = document.getElementById("undoPanel");
    return componentDomStore.undoController;
  }

  // 设置选项状态
  setOptionStatus(status: boolean) {
    // 获取截图工具栏与三角形角标容器
    this.getOptionIcoController();
    this.getOptionController();
    if (
      componentDomStore.optionIcoController == null ||
      componentDomStore.optionController == null
    )
      return;
    componentDomStore.optionIcoController.style.display = status
      ? "block"
      : "none";
    componentDomStore.optionController.style.display = status
      ? "block"
      : "none";
  }

  // 隐藏画笔工具栏三角形角标
  hiddenOptionIcoStatus() {
    this.getOptionIcoController();
    if (componentDomStore.optionIcoController == null) return;
    componentDomStore.optionIcoController.style.display = "none";
  }

  // 设置画笔选择工具栏位置
  setOptionPosition(position: number) {
    // 获取截图工具栏与三角形角标容器
    this.getOptionIcoController();
    this.getOptionController();
    if (
      componentDomStore.optionIcoController == null ||
      componentDomStore.optionController == null
    )
      return;
    // 修改位置
    const toolPosition = this.getToolPosition();
    if (toolPosition == null) return;
    const icoLeft = `${toolPosition.left + position}px`;
    const icoTop = `${toolPosition.top + 44}px`;
    const optionLeft = `${toolPosition.left}px`;
    const optionTop = `${toolPosition.top + 44 + 6}px`;
    componentDomStore.optionIcoController.style.left = icoLeft;
    componentDomStore.optionIcoController.style.top = icoTop;
    componentDomStore.optionController.style.left = optionLeft;
    componentDomStore.optionController.style.top = optionTop;
  }

  // 设置工具点击状态
  setToolClickStatus(status: boolean) {
    this.toolClickStatus = status;
  }

  // 设置选中的颜色
  setSelectedColor(color: string) {
    this.selectedColor = color;
    this.getColorSelectPanel();
    if (componentDomStore.colorSelectPanel == null) return;
    componentDomStore.colorSelectPanel.style.backgroundColor = color;
  }

  // 设置工具名称
  setToolName(itemName: string) {
    this.toolName = itemName;
  }

  // 设置工具 ID
  setToolId(id: number | null) {
    this.toolId = id;
  }

  // 设置画笔大小
  setPenSize(size: number) {
    this.penSize = size;
  }

  // 设置马赛克笔触大小
  setMosaicPenSize(size: number) {
    this.mosaicPenSize = size;
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

  // 设置工具位置状态
  setToolPositionStatus(status: boolean) {
    this.toolPositionStatus = status;
  }

  // 设置字体大小
  setFontSize(size: number) {
    this.fontSize = size;
  }

  // 设置当前激活的工具名称
  setActiveToolName(toolName: string) {
    this.activeTool = toolName;
  }

  // 设置文本信息
  setTextInfo(info: textInfoType) {
    this.textInfo = info;
  }

  // 设置文本编辑状态
  setTextEditState(state: boolean) {
    this.textEditState = state;
  }

  // 设置画笔选择状态
  setBrushSelectionStatus(status: boolean) {
    this.getBrushSelectionController();
    if (componentDomStore.brushSelectionController == null) return;
    componentDomStore.brushSelectionController.style.display = status
      ? "block"
      : "none";
  }

  // 设置颜色面板状态
  setColorPanelStatus(status: boolean) {
    this.getColorPanel();
    if (componentDomStore.colorSelectController == null) return;
    componentDomStore.colorSelectController.style.display = status
      ? "flex"
      : "none";
  }

  // 设置右侧面板状态
  setRightPanel(status: boolean) {
    this.getRightPanel();
    if (componentDomStore.rightPanel == null) return;
    componentDomStore.rightPanel.style.display = status ? "flex" : "none";
  }

  // 设置撤销按钮状态
  setUndoStatus(status: boolean) {
    this.getUndoController();
    if (componentDomStore.undoController == null) return;
    if (status) {
      // 启用撤销按钮
      componentDomStore.undoController.classList.add("undo");
      componentDomStore.undoController.classList.remove("undo-disabled");
      componentDomStore.undoController.addEventListener(
        "click",
        takeOutHistory
      );
      return;
    }
    // 禁用撤销按钮
    componentDomStore.undoController.classList.add("undo-disabled");
    componentDomStore.undoController.classList.remove("undo");
    componentDomStore.undoController.removeEventListener(
      "click",
      takeOutHistory
    );
  }

  // 重置状态
  reset() {
    Object.assign(this, this.initialState());
  }
}

const toolBarStore = new ToolBarStore();

export default toolBarStore;
