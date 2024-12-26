import { makeAutoObservable } from "mobx";
import { positionInfoType } from "@/lib/type/ComponentType";
import { getToolRelativePosition } from "@/lib/common-methods/GetToolRelativePosition";
import componentDomStore from "@/store/ComponentDomStore";

class CropBoxStore {
  private initialState() {
    return {
      draggingTrim: false,
      dragging: false,
      borderSize: 10,
      cutOutBoxPosition: {
        startX: 0,
        startY: 0,
        width: 0,
        height: 0
      } as positionInfoType
    };
  }

  // 可观察属性
  draggingTrim: boolean = this.initialState().draggingTrim;
  dragging: boolean = this.initialState().dragging;
  borderSize: number = this.initialState().borderSize;
  cutOutBoxPosition: positionInfoType = this.initialState().cutOutBoxPosition;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // 设置拖动裁剪状态
  setDraggingTrim(draggingTrim: boolean) {
    this.draggingTrim = draggingTrim;
  }

  // 设置拖动状态
  setDragging(dragging: boolean) {
    this.dragging = dragging;
  }

  // 设置裁剪框位置信息
  setCutOutBoxPosition(
    mouseX: number,
    mouseY: number,
    width: number,
    height: number
  ) {
    this.cutOutBoxPosition = {
      startX: mouseX,
      startY: mouseY,
      width,
      height
    };
  }

  // 获取裁剪框尺寸显示容器
  getCutBoxSizeContainer() {
    componentDomStore.cutBoxSizeContainer = document.getElementById(
      "cutBoxSizePanel"
    ) as HTMLDivElement | null;
    return componentDomStore.cutBoxSizeContainer;
  }

  // 获取截图容器dom
  getScreenShotContainer() {
    componentDomStore.screenShotController = document.getElementById(
      "screenShotContainer"
    ) as HTMLCanvasElement | null;
    return componentDomStore.screenShotController;
  }

  // 设置裁剪框尺寸显示容器展示状态
  setCutBoxSizeStatus(status: boolean) {
    if (componentDomStore.cutBoxSizeContainer == null) return;
    componentDomStore.cutBoxSizeContainer.style.display = status
      ? "flex"
      : "none";
  }

  // 设置裁剪框尺寸显示容器位置
  setCutBoxSizePosition(x: number, y: number) {
    if (componentDomStore.cutBoxSizeContainer == null) return;
    const { left, top } = getToolRelativePosition(x, y);
    let sscTop = 0;
    if (componentDomStore.screenShotController) {
      sscTop = parseInt(componentDomStore.screenShotController.style.top);
    }
    componentDomStore.cutBoxSizeContainer.style.left = `${left}px`;
    componentDomStore.cutBoxSizeContainer.style.top = `${top + sscTop}px`;
  }

  // 设置裁剪框尺寸
  setCutBoxSize(width: number, height: number) {
    if (componentDomStore.cutBoxSizeContainer == null) return;
    // width和height保留整数
    width = Math.floor(width);
    height = Math.floor(height);
    const childrenPanel = componentDomStore.cutBoxSizeContainer.childNodes;
    // p标签已存在直接更改文本值即可
    if (childrenPanel.length > 0) {
      (childrenPanel[0] as HTMLParagraphElement).innerText = `${width} * ${height}`;
      return;
    }
    // 不存在则渲染
    const textPanel = document.createElement("p");
    textPanel.innerText = `${width} * ${height}`;
    componentDomStore.cutBoxSizeContainer.appendChild(textPanel);
  }

  // 重置状态
  reset() {
    Object.assign(this, this.initialState());
  }
}

const cropBoxStore = new CropBoxStore();

export default cropBoxStore;
