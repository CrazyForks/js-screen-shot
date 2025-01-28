/**
 * 取出一条历史记录
 */
import drawingDataStore from "@/store/DrawingDataStore";

export function takeOutHistory(
  screenShortCanvas: CanvasRenderingContext2D | null | undefined,
  disableUndo: () => void
) {
  drawingDataStore.popHistory();
  if (screenShortCanvas != null) {
    if (drawingDataStore.history.length > 0) {
      screenShortCanvas.putImageData(
        drawingDataStore.history[drawingDataStore.history.length - 1]["data"],
        0,
        0
      );
    }
  }

  // 历史记录已取完，禁用撤回按钮点击
  if (drawingDataStore.history.length - 1 <= 0) {
    disableUndo();
  }
}
