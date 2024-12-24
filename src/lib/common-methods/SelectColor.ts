import toolBarStore from "@/store/ToolBarStore";

export function selectColor() {
  // 显示颜色选择面板
  toolBarStore.setColorPanelStatus(true);
}
