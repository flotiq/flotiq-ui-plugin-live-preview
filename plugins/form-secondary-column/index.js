import {
  addElementToCache,
  getCachedElement,
} from "../../common/plugin-element-cache";
import { getCtdSettings } from "../../common/settings-parser";
import i18n from "../../i18n";
import pluginInfo from "../../plugin-manifest.json";
import { createSecondaryColumn, openedState } from "./column-element";

const messageEvent = (event) => {
  if (event.data?.message !== "Live preview time updated") return;

  const livePreviewUpdated = document
    .querySelector(".plugin-live-preview__secondary-column")
    .querySelector(".plugin-live-preview__status-info");

  livePreviewUpdated.textContent = event.data?.time
    ? i18n.t("LivePreviewUpdated", {
        time: event.data.time,
      })
    : i18n.t("Connected");
};

export const handleSecondaryColumnAdd = (
  { contentType, contentObject, formik, rerender },
  getPluginSettings,
) => {
  if (!contentType?.name || !formik || !openedState.isOpened) return null;
  const settingsForCtd = getCtdSettings(getPluginSettings(), contentType.name);
  if (!settingsForCtd?.length) return null;

  const cacheKey = `${pluginInfo.id}-${contentType.name}-${contentObject?.id || "new"}-column`;
  let panelElement = getCachedElement(cacheKey)?.element;

  if (!panelElement) {
    panelElement = createSecondaryColumn(rerender);

    const removeColumn = () => {
      openedState.isOpened = false;
      rerender();
    };

    const resizeEvent = () => {
      if (window.innerWidth < 1024) {
        removeColumn();
      }
    };

    addElementToCache(
      panelElement,
      cacheKey,
      () => {
        if (!panelElement.parentElement) return;
        panelElement.parentElement.className = "plugin-live-preview__wrapper";
        window.addEventListener("message", messageEvent);
        window.addEventListener("resize", resizeEvent);
      },
      () => {
        window.removeEventListener("message", messageEvent);
        window.removeEventListener("resize", resizeEvent);
        removeColumn();
      },
    );
  }

  return panelElement;
};
