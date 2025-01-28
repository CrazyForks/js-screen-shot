import { makeAutoObservable } from "mobx";
import componentDomStore from "@/store/ComponentDomStore";

class TextInputStore {
  private initialState() {
    return {
      textSizeContainer: null,
      optionTextSizeController: null
    };
  }

  textSizeContainer: null | HTMLDivElement = this.initialState()
    .textSizeContainer;
  optionTextSizeController: null | HTMLDivElement = this.initialState()
    .optionTextSizeController;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  private getTextSizeContainer() {
    this.textSizeContainer = document.getElementById(
      "textSizePanel"
    ) as HTMLDivElement | null;
  }

  private getOptionTextSizeController() {
    this.optionTextSizeController = document.getElementById(
      "textSelectPanel"
    ) as HTMLDivElement | null;
  }

  // 设置文本输入工具栏展示状态
  setTextStatus(status: boolean) {
    if (componentDomStore.textInputController == null) return;
    if (status) {
      // 显示文本输入工具
      componentDomStore.updateTextInputShowState("block");
      return;
    }
    componentDomStore.updateTextInputShowState("none");
  }

  // 设置截图工具栏文字大小下拉框选项选择工具展示状态
  setTextSizeOptionStatus(status: boolean) {
    this.getOptionTextSizeController();
    if (this.optionTextSizeController == null) return;
    if (status) {
      this.optionTextSizeController.style.display = "flex";
      return;
    }
    this.optionTextSizeController.style.display = "none";
  }

  setTextSizePanelStatus(status: boolean) {
    this.getTextSizeContainer();
    if (this.textSizeContainer == null) return;
    if (status) {
      this.textSizeContainer.style.display = "flex";
      return;
    }
    this.textSizeContainer.style.display = "none";
  }
  // 重置状态
  reset() {
    Object.assign(this, this.initialState());
  }
}

const textInputStore = new TextInputStore();

export default textInputStore;
