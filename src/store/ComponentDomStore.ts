import { makeObservable, observable, action } from "mobx";
import PlugInParameters from "@/lib/main-entrance/PlugInParameters";

class ComponentDomStore {
  @observable screenShotController: HTMLCanvasElement | null = null;
  @observable toolController: HTMLDivElement | null = null;
  @observable optionIcoController: HTMLDivElement | null = null;
  @observable optionController: HTMLDivElement | null = null;
  @observable cutBoxSizeContainer: HTMLDivElement | null = null;
  @observable textInputController: HTMLDivElement | null = null;
  @observable colorSelectPanel: HTMLElement | null = null;
  @observable textSizeContainer: HTMLDivElement | null = null;
  @observable optionTextSizeController: HTMLDivElement | null = null;
  @observable brushSelectionController: HTMLDivElement | null = null;
  @observable colorSelectController: HTMLElement | null = null;
  @observable rightPanel: HTMLElement | null = null;
  @observable undoController: HTMLElement | null = null;

  // 截图容器是否可滚动
  @observable noScrollStatus = false;
  // 是否需要还原页面的滚动条状态
  @observable resetScrollbarState = false;

  constructor() {
    makeObservable(this);
  }

  @action.bound
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
  }

  @action.bound
  setNoScrollStatus(status?: boolean) {
    if (status != null) {
      this.noScrollStatus = status;
    }
  }

  @action.bound
  setResetScrollbarState(state: boolean) {
    this.resetScrollbarState = state;
  }
}

const componentDomStore = new ComponentDomStore();

export default componentDomStore;
