import { makeAutoObservable } from "mobx";
import componentDomStore from "@/store/ComponentDomStore";

class TextInputStore {
  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  private getTextSizeContainer() {
    componentDomStore.textSizeContainer = document.getElementById(
      "textSizePanel"
    ) as HTMLDivElement | null;
    return componentDomStore.textSizeContainer;
  }

  private getOptionTextSizeController() {
    componentDomStore.optionTextSizeController = document.getElementById(
      "textSelectPanel"
    ) as HTMLDivElement | null;
    return componentDomStore.optionTextSizeController;
  }

  // 设置文本输入工具栏展示状态
  setTextStatus(status: boolean) {
    if (componentDomStore.textInputController == null) return;
    if (status) {
      // 显示文本输入工具
      componentDomStore.textInputController.style.display = "block";
      return;
    }
    componentDomStore.textInputController.style.display = "none";
  }

  // 设置截图工具栏文字大小下拉框选项选择工具展示状态
  setTextSizeOptionStatus(status: boolean) {
    this.getOptionTextSizeController();
    if (componentDomStore.optionTextSizeController == null) return;
    if (status) {
      componentDomStore.optionTextSizeController.style.display = "flex";
      return;
    }
    componentDomStore.optionTextSizeController.style.display = "none";
  }

  setTextSizePanelStatus(status: boolean) {
    this.getTextSizeContainer();
    if (componentDomStore.textSizeContainer == null) return;
    if (status) {
      console.log("显示");
      componentDomStore.textSizeContainer.style.display = "flex";
      return;
    }
    componentDomStore.textSizeContainer.style.display = "none";
  }
}

const textInputStore = new TextInputStore();

export default textInputStore;
