/**
 * 取出一条历史记录
 */
import toolBarStore from "@/store/ToolBarStore";
import componentDomStore from "@/store/ComponentDomStore";

export function takeOutHistory() {
  toolBarStore.popHistory();
  const screenShortCanvas = componentDomStore.screenShotController?.getContext(
    "2d"
  );
  if (screenShortCanvas != null) {
    if (toolBarStore.history.length > 0) {
      screenShortCanvas.putImageData(
        toolBarStore.history[toolBarStore.history.length - 1]["data"],
        0,
        0
      );
    }
  }

  // 历史记录已取完，禁用撤回按钮点击
  if (toolBarStore.history.length - 1 <= 0) {
    toolBarStore.setUndoStatus(false);
  }
}
