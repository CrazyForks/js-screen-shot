import { makeObservable, observable, action } from "mobx";
import componentDomStore from "@/store/ComponentDomStore";
import cropBoxStore from "@/store/CropBoxStore";
import { getToolRelativePosition } from "@/lib/common-methods/GetToolRelativePosition";

class ScreenShotCanvasStore {
  // 存储获取到的屏幕截图
  @observable imageController: HTMLCanvasElement | null = null;

  constructor() {
    makeObservable(this);
  }

  // 设置截图容器宽高
  @action.bound
  setScreenShotInfo(width: number, height: number) {
    cropBoxStore.getScreenShotContainer();
    if (componentDomStore.screenShotController == null) return;
    // 增加截图锁屏
    if (componentDomStore.noScrollStatus) {
      document.body.classList.add("__screenshot-lock-scroll");
    }
    componentDomStore.screenShotController.width = width;
    componentDomStore.screenShotController.height = height;
  }

  // 设置截图容器位置
  @action.bound
  setScreenShotPosition(left: number, top: number) {
    cropBoxStore.getScreenShotContainer();
    if (componentDomStore.screenShotController == null) return;
    const { left: rLeft, top: rTop } = getToolRelativePosition(left, top);
    componentDomStore.screenShotController.style.left = rLeft + "px";
    componentDomStore.screenShotController.style.top = rTop + "px";
  }

  // 显示截图区域容器
  @action.bound
  showScreenShotPanel() {
    cropBoxStore.getScreenShotContainer();
    if (componentDomStore.screenShotController == null) return;
    componentDomStore.screenShotController.style.display = "block";
  }

  @action.bound
  setImageController(imageController: HTMLCanvasElement) {
    this.imageController = imageController;
  }
}

const screenShotCanvasStore = new ScreenShotCanvasStore();

export default screenShotCanvasStore;
