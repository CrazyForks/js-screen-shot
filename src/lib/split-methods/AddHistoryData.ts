import cropBoxStore from "@/store/CropBoxStore";
import toolBarStore from "@/store/ToolBarStore";
import userParamStore from "@/store/UserParamStore";

// 保存当前画布状态
export function addHistory() {
  const screenShotController = cropBoxStore.getScreenShotContainer();
  if (screenShotController == null) return;
  // 获取canvas容器
  // 获取canvas画布与容器
  const context = screenShotController.getContext(
    "2d"
  ) as CanvasRenderingContext2D;
  const controller = screenShotController;
  if (toolBarStore.history.length > userParamStore.maxUndoNum) {
    // 删除最早的一条画布记录
    toolBarStore.shiftHistory();
  }
  // 保存当前画布状态
  toolBarStore.pushHistory({
    data: context.getImageData(0, 0, controller.width, controller.height)
  });
  // 启用撤销按钮
  toolBarStore.setUndoStatus(true);
}

export function showLastHistory(context: CanvasRenderingContext2D) {
  context.putImageData(
    toolBarStore.history[toolBarStore.history.length - 1]["data"],
    0,
    0
  );
}
