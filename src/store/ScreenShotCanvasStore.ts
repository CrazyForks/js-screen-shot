import { makeAutoObservable } from "mobx";
import componentDomStore from "@/store/ComponentDomStore";
import cropBoxStore from "@/store/CropBoxStore";
import { getToolRelativePosition } from "@/lib/common-methods/GetToolRelativePosition";

class ScreenShotCanvasStore {
  private initialState() {
    return {
      imageController: null as HTMLCanvasElement | null
    };
  }

  // 存储获取到的屏幕截图
  imageController: HTMLCanvasElement | null = this.initialState()
    .imageController;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // 设置截图容器宽高
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
  setScreenShotPosition(left: number, top: number) {
    cropBoxStore.getScreenShotContainer();
    if (componentDomStore.screenShotController == null) return;
    const { left: rLeft, top: rTop } = getToolRelativePosition(left, top);
    componentDomStore.screenShotController.style.left = `${rLeft}px`;
    componentDomStore.screenShotController.style.top = `${rTop}px`;
  }

  // 显示截图区域容器
  showScreenShotPanel() {
    cropBoxStore.getScreenShotContainer();
    if (componentDomStore.screenShotController == null) return;
    componentDomStore.screenShotController.style.display = "block";
  }

  // 设置截图画布控制器
  setImageController(imageController: HTMLCanvasElement) {
    this.imageController = imageController;
  }

  // 重置状态
  reset() {
    Object.assign(this, this.initialState());
  }
}

const screenShotCanvasStore = new ScreenShotCanvasStore();

export default screenShotCanvasStore;
