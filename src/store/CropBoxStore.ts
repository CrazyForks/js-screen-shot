import { makeObservable, observable, action } from "mobx";
import { positionInfoType } from "@/lib/type/ComponentType";
import { getToolRelativePosition } from "@/lib/common-methods/GetToolRelativePosition";
import componentDomStore from "@/store/ComponentDomStore";

class CropBoxStore {
  @observable draggingTrim = false;
  @observable dragging = false;
  @observable borderSize = 10;
  @observable cutOutBoxPosition: positionInfoType = {
    startX: 0,
    startY: 0,
    width: 0,
    height: 0
  };

  constructor() {
    makeObservable(this);
  }

  @action.bound
  setDraggingTrim(draggingTrim: boolean) {
    this.draggingTrim = draggingTrim;
  }

  @action.bound
  setDragging(dragging: boolean) {
    this.dragging = dragging;
  }

  // 设置裁剪框位置信息
  @action.bound
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
  @action.bound
  getCutBoxSizeContainer() {
    componentDomStore.cutBoxSizeContainer = document.getElementById(
      "cutBoxSizePanel"
    ) as HTMLDivElement | null;
    return componentDomStore.cutBoxSizeContainer;
  }

  // 获取截图容器dom
  @action.bound
  getScreenShotContainer() {
    componentDomStore.screenShotController = document.getElementById(
      "screenShotContainer"
    ) as HTMLCanvasElement | null;
    return componentDomStore.screenShotController;
  }

  // 设置裁剪框尺寸显示容器展示状态
  @action.bound
  setCutBoxSizeStatus(status: boolean) {
    if (componentDomStore.cutBoxSizeContainer == null) return;
    if (status) {
      componentDomStore.cutBoxSizeContainer.style.display = "flex";
      return;
    }
    componentDomStore.cutBoxSizeContainer.style.display = "none";
  }

  // 设置裁剪框尺寸显示容器位置
  @action.bound
  setCutBoxSizePosition(x: number, y: number) {
    if (componentDomStore.cutBoxSizeContainer == null) return;
    const { left, top } = getToolRelativePosition(x, y);
    componentDomStore.cutBoxSizeContainer.style.left = left + "px";
    let sscTop = 0;
    if (componentDomStore.screenShotController) {
      sscTop = parseInt(componentDomStore.screenShotController.style.top);
    }
    componentDomStore.cutBoxSizeContainer.style.top = top + sscTop + "px";
  }

  // 设置裁剪框尺寸
  @action.bound
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
}
const cropBoxStore = new CropBoxStore();

export default cropBoxStore;
