import { makeAutoObservable } from "mobx";
import componentDomStore from "@/store/ComponentDomStore";
import { getToolRelativePosition } from "@/lib/common-methods/GetToolRelativePosition";
import { ScreenShotCanvasStoreDataType } from "@/lib/type/ComponentType";

class ScreenShotCanvasStore {
  private initialState(): ScreenShotCanvasStoreDataType {
    return {
      imageController: null,
      screenShotCanvas: null
    };
  }

  // 存储获取到的屏幕截图
  imageController: HTMLCanvasElement | null = this.initialState()
    .imageController;
  screenShotCanvas: CanvasRenderingContext2D | null = this.initialState()
    .screenShotCanvas;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // 设置截图容器宽高
  setScreenShotInfo(width: number, height: number) {
    // 增加截图锁屏
    if (componentDomStore.noScrollStatus) {
      document.body.classList.add("__screenshot-lock-scroll");
    }
    componentDomStore.updateScreenShotControllerSize(width, height);
  }

  updateScreenShotCanvas(screenShotCanvas: CanvasRenderingContext2D) {
    this.screenShotCanvas = screenShotCanvas;
  }

  // 设置截图容器位置
  setScreenShotPosition(left: number, top: number) {
    const { left: rLeft, top: rTop } = getToolRelativePosition(left, top);
    componentDomStore.updateScreenShotPosition(rLeft, rTop);
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
