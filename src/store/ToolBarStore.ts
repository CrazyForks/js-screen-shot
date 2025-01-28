import { makeAutoObservable } from "mobx";
import componentDomStore from "@/store/ComponentDomStore";
import { getToolRelativePosition } from "@/lib/common-methods/GetToolRelativePosition";
import { textInfoType, ToolBarStoreDataType } from "@/lib/type/ComponentType";

class ToolBarStore {
  private initialState(): ToolBarStoreDataType {
    return {
      toolClickStatus: false,
      selectedColor: "#F53340",
      toolName: "",
      toolId: null,
      penSize: 2,
      fontSize: 17,
      mosaicPenSize: 10,
      toolPositionStatus: false,
      activeTool: "",
      textEditState: false,
      textInfo: {
        positionX: 0,
        positionY: 0,
        color: "#000000",
        size: 0
      }
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

  // 设置截图工具栏展示状态
  setToolStatus(status: boolean) {
    componentDomStore.updateToolShowStatus(status ? "block" : "none");
  }

  // 设置截图工具位置信息
  setToolInfo(left: number, top: number) {
    if (componentDomStore.toolController == null) return;
    const { left: rLeft, top: rTop } = getToolRelativePosition(left, top);
    componentDomStore.updateToolPosition(rTop, rLeft);
  }

  // 获取工具栏位置
  getToolPosition() {
    if (componentDomStore.toolController == null) return;
    return {
      left: componentDomStore.toolController.offsetLeft,
      top: componentDomStore.toolController.offsetTop
    };
  }

  // 设置选项状态
  setOptionStatus(status: boolean) {
    componentDomStore.updateToolOptionShowState(status ? "block" : "none");
  }

  // 隐藏画笔工具栏三角形角标
  hiddenOptionIcoStatus() {
    componentDomStore.updateToolOptIcon("none");
  }

  // 设置画笔选择工具栏位置
  setOptionPosition(position: number) {
    // 修改位置
    const toolPosition = this.getToolPosition();
    if (toolPosition == null) return;
    const icoLeft = `${toolPosition.left + position}px`;
    const icoTop = `${toolPosition.top + 44}px`;
    const optionLeft = `${toolPosition.left}px`;
    const optionTop = `${toolPosition.top + 44 + 6}px`;
    componentDomStore.updateToolOptionPosition(
      icoLeft,
      icoTop,
      optionLeft,
      optionTop
    );
  }

  // 设置工具点击状态
  setToolClickStatus(status: boolean) {
    this.toolClickStatus = status;
  }

  // 设置选中的颜色
  setSelectedColor(color: string) {
    this.selectedColor = color;
    componentDomStore.updateColorSelectPanelColor(color);
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
    componentDomStore.getBrushSelectionController();
    componentDomStore.updateBrushSelectionShowState(status ? "block" : "none");
  }

  // 设置颜色面板状态
  setColorPanelStatus(status: boolean) {
    componentDomStore.getColorPanel();
    componentDomStore.updateColorPanelShowState(status ? "flex" : "none");
  }

  // 设置右侧面板状态
  setRightPanel(status: boolean) {
    componentDomStore.getRightPanel();
    componentDomStore.updateRightPanelShowState(status ? "flex" : "none");
  }

  // 设置撤销按钮状态
  setUndoStatus(status: boolean) {
    componentDomStore.getUndoController();

    if (status) {
      // 启用撤销按钮
      componentDomStore.enableUndoButton();
      return;
    }
    // 禁用撤销按钮
    componentDomStore.disableUndoButton();
  }

  // 重置状态
  reset() {
    Object.assign(this, this.initialState());
  }
}

const toolBarStore = new ToolBarStore();

export default toolBarStore;
