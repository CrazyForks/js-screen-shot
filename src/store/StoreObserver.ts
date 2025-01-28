// 监听store中的数据变化
import { reaction, runInAction } from "mobx";
import drawingDataStore from "@/store/DrawingDataStore";
import componentDomStore from "@/store/ComponentDomStore";
import cropBoxStore from "@/store/CropBoxStore";
import screenShotCanvasStore from "@/store/ScreenShotCanvasStore";
import toolBarStore from "@/store/ToolBarStore";
import userParamStore from "@/store/UserParamStore";
import textInputStore from "@/store/TextInputStore";

const observeStore = () => {
  reaction(
    () => drawingDataStore.resetAllStore,
    state => {
      if (state) {
        // 重置所有store
        runInAction(() => {
          componentDomStore.reset();
          cropBoxStore.reset();
          screenShotCanvasStore.reset();
          toolBarStore.reset();
          userParamStore.reset();
          drawingDataStore.reset();
          textInputStore.reset();
        });
      }
    }
  );
  reaction(
    () => drawingDataStore.canUndo,
    isDisable => {
      if (!isDisable) {
        // 更新工具栏的撤销图标为禁用状态
        toolBarStore.setUndoStatus(false);
      }
    }
  );
};

export default observeStore;
