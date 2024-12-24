import { makeObservable, observable, action } from "mobx";
import componentDomStore from "@/store/ComponentDomStore";
import { getToolRelativePosition } from "@/lib/common-methods/GetToolRelativePosition";
import { textInfoType } from "@/lib/type/ComponentType";
import { takeOutHistory } from "@/lib/common-methods/TakeOutHistory";

class ToolBarStore {
  @observable toolClickStatus = false;
  @observable selectedColor = "#F53340";
  @observable toolName = "";
  @observable toolId: number | null = null;
  // 当前选择的画笔大小
  @observable penSize = 2;
  // 当前选择的字体大小
  @observable fontSize = 17;
  // 马赛克工具的笔触大小
  @observable mosaicPenSize = 10;
  // 画笔历史记录
  @observable history: Array<Record<string, any>> = [];
  // 工具栏超出截图容器状态
  @observable toolPositionStatus = false;
  // 当前选中的工具
  @observable activeTool = "";
  // 当前是否处于文本编辑状态
  @observable textEditState = false;
  @observable textInfo: textInfoType = {
    positionX: 0,
    positionY: 0,
    color: "#000000",
    size: 0
  };

  constructor() {
    makeObservable(this);
  }

  @action.bound
  getToolController() {
    componentDomStore.toolController = document.getElementById(
      "toolPanel"
    ) as HTMLDivElement | null;
    return componentDomStore.toolController;
  }

  @action.bound
  getOptionController() {
    componentDomStore.optionController = document.getElementById(
      "optionPanel"
    ) as HTMLDivElement | null;
    return componentDomStore.optionController;
  }

  // 获取截图工具栏画笔选择工具dom
  @action.bound
  getOptionIcoController() {
    componentDomStore.optionIcoController = document.getElementById(
      "optionIcoController"
    ) as HTMLDivElement | null;
    return componentDomStore.optionIcoController;
  }

  @action.bound
  getColorSelectPanel() {
    componentDomStore.colorSelectPanel = document.getElementById(
      "colorSelectPanel"
    );
    return componentDomStore.colorSelectPanel;
  }

  // 设置截图工具栏展示状态
  @action.bound
  setToolStatus(status: boolean) {
    // 获取一次最新的工具栏dom
    this.getToolController();
    if (componentDomStore.toolController == null) return;
    if (status) {
      componentDomStore.toolController.style.display = "block";
      return;
    }
    componentDomStore.toolController.style.display = "none";
  }

  // 设置截图工具位置信息
  @action.bound
  setToolInfo(left: number, top: number) {
    this.getToolController();
    if (componentDomStore.toolController == null) return;
    const { left: rLeft, top: rTop } = getToolRelativePosition(left, top);
    componentDomStore.toolController.style.left = rLeft + "px";
    let sscTop = 0;
    if (componentDomStore.screenShotController) {
      sscTop = parseInt(componentDomStore.screenShotController.style.top);
    }
    componentDomStore.toolController.style.top = rTop + sscTop + "px";
  }

  // 获取工具栏位置
  @action.bound
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

  @action.bound
  setOptionStatus(status: boolean) {
    // 获取截图工具栏与三角形角标容器
    this.getOptionIcoController();
    this.getOptionController();
    if (
      componentDomStore.optionIcoController == null ||
      componentDomStore.optionController == null
    )
      return;
    if (status) {
      componentDomStore.optionIcoController.style.display = "block";
      componentDomStore.optionController.style.display = "block";
      return;
    }
    componentDomStore.optionIcoController.style.display = "none";
    componentDomStore.optionController.style.display = "none";
  }

  // 隐藏画笔工具栏三角形角标
  @action.bound
  hiddenOptionIcoStatus() {
    this.getOptionIcoController();
    if (componentDomStore.optionIcoController == null) return;
    componentDomStore.optionIcoController.style.display = "none";
  }

  // 设置画笔选择工具栏位置
  @action.bound
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
    const icoLeft = toolPosition.left + position + "px";
    const icoTop = toolPosition.top + 44 + "px";
    const optionLeft = toolPosition.left + "px";
    const optionTop = toolPosition.top + 44 + 6 + "px";
    componentDomStore.optionIcoController.style.left = icoLeft;
    componentDomStore.optionIcoController.style.top = icoTop;
    componentDomStore.optionController.style.left = optionLeft;
    componentDomStore.optionController.style.top = optionTop;
  }

  @action.bound
  setToolClickStatus(status: boolean) {
    this.toolClickStatus = status;
  }

  @action.bound
  setSelectedColor(color: string) {
    this.selectedColor = color;
    this.getColorSelectPanel();
    if (componentDomStore.colorSelectPanel == null) return;
    componentDomStore.colorSelectPanel.style.backgroundColor = color;
  }

  @action.bound
  setToolName(itemName: string) {
    this.toolName = itemName;
  }

  @action.bound
  setToolId(id: number | null) {
    this.toolId = id;
  }

  @action.bound
  setPenSize(size: number) {
    this.penSize = size;
  }

  @action.bound
  setMosaicPenSize(size: number) {
    this.mosaicPenSize = size;
  }

  @action.bound
  shiftHistory() {
    return this.history.shift();
  }

  @action.bound
  popHistory() {
    return this.history.pop();
  }

  @action.bound
  pushHistory(item: Record<string, any>) {
    this.history.push(item);
  }

  @action.bound
  setToolPositionStatus(status: boolean) {
    this.toolPositionStatus = status;
  }

  @action.bound
  setFontSize(size: number) {
    this.fontSize = size;
  }

  @action.bound
  setActiveToolName(toolName: string) {
    this.activeTool = toolName;
  }

  @action.bound
  setTextInfo(info: textInfoType) {
    this.textInfo = info;
  }

  @action.bound
  setTextEditState(state: boolean) {
    this.textEditState = state;
  }

  @action.bound
  setBrushSelectionStatus(status: boolean) {
    this.getBrushSelectionController();
    if (componentDomStore.brushSelectionController == null) return;
    if (status) {
      componentDomStore.brushSelectionController.style.display = "block";
      return;
    }
    componentDomStore.brushSelectionController.style.display = "none";
  }

  @action.bound
  setColorPanelStatus(status: boolean) {
    this.getColorPanel();
    if (componentDomStore.colorSelectController == null) return;
    if (status) {
      componentDomStore.colorSelectController.style.display = "flex";
      return;
    }
    componentDomStore.colorSelectController.style.display = "none";
  }

  @action.bound
  setRightPanel(status: boolean) {
    this.getRightPanel();
    if (componentDomStore.rightPanel == null) return;
    if (status) {
      componentDomStore.rightPanel.style.display = "flex";
      return;
    }
    componentDomStore.rightPanel.style.display = "none";
  }

  @action.bound
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
}

const toolBarStore = new ToolBarStore();

export default toolBarStore;
