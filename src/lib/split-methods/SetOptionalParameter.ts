import {
  hideBarInfoType,
  screenShotType,
  UserParamStoreDataType
} from "@/lib/type/ComponentType";
import userParamStore from "@/store/UserParamStore";
import componentDomStore from "@/store/ComponentDomStore";

export function setOptionalParameter(options: screenShotType) {
  try {
    const {
      clickCutFullScreen = false,
      imgSrc,
      loadCrossImg = false,
      proxyUrl,
      useCORS,
      h2cIgnoreElementsCallback,
      position,
      wrcReplyTime,
      cropBoxInfo,
      toolPosition,
      wrcImgPosition,
      hiddenScrollBar,
      wrcWindowMode,
      customRightClickEvent
    } = options;

    // 设置各个参数
    userParamStore.setClickCutFullScreenStatus(clickCutFullScreen);

    if (imgSrc != null) {
      userParamStore.setImgSrc(imgSrc);
    }

    userParamStore.setLoadCrossImg(loadCrossImg);

    if (proxyUrl) {
      userParamStore.setProxyUrl(proxyUrl);
    }

    if (useCORS !== undefined) {
      userParamStore.setUseCORS(useCORS);
    }

    if (h2cIgnoreElementsCallback) {
      userParamStore.setH2cIgnoreElementsFn(h2cIgnoreElementsCallback);
    }

    if (position) {
      handlePosition(position);
    }

    if (wrcReplyTime) {
      userParamStore.setWrcReplyTime(wrcReplyTime);
    }

    if (cropBoxInfo) {
      userParamStore.setCropBoxInfo(cropBoxInfo);
    }

    if (toolPosition) {
      userParamStore.setToolPosition(toolPosition);
    }

    if (wrcImgPosition) {
      handleWrcImgPosition(wrcImgPosition);
    }

    if (hiddenScrollBar) {
      handleHiddenScrollBar(hiddenScrollBar);
    }

    if (wrcWindowMode != null) {
      userParamStore.setWrcWindowMode(wrcWindowMode);
    }

    if (customRightClickEvent != null) {
      userParamStore.setCustomRightClickEvent(customRightClickEvent);
    }
  } catch (error) {
    console.error("设置截图参数时出错:", error);
  }
}

// 处理隐藏滚动条
const handleHiddenScrollBar = (hiddenScrollBar: hideBarInfoType) => {
  const {
    state,
    color = "#000000",
    fillWidth = 0,
    fillHeight = 0,
    fillState = false
  } = hiddenScrollBar;

  userParamStore.setHiddenScrollBar({
    state,
    color,
    fillWidth,
    fillHeight,
    fillState
  });

  if (state) {
    componentDomStore.setResetScrollbarState(true);
    document.documentElement.classList.add("hidden-screen-shot-scroll");
    document.body.classList.add("hidden-screen-shot-scroll");
  }
};

// 处理位置
const handlePosition = (position: {
  top?: number | undefined;
  left?: number | undefined;
}) => {
  const { top, left } = position;
  if (top != null || left != null) {
    userParamStore.setPosition(top ?? 0, left ?? 0);
  }
};

// 处理 webrtc 图片位置
const handleWrcImgPosition = (
  wrcImgPosition: UserParamStoreDataType["wrcImgPosition"]
) => {
  const { x, y } = wrcImgPosition;
  userParamStore.setWrcImgPosition({
    x: -Math.abs(x),
    y: -Math.abs(y),
    w: 0,
    h: 0
  });
};
