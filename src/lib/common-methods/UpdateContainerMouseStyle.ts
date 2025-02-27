export function updateContainerMouseStyle(
  container: HTMLCanvasElement,
  toolName: string
) {
  switch (toolName) {
    case "text":
      container.style.cursor = "text";
      break;
    default:
      console.log("执行了");
      container.style.cursor = "default";
      break;
  }
}
