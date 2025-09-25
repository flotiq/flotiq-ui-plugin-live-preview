import {
  addElementToCache,
  getCachedElement,
} from "../../common/plugin-element-cache";
import { getCtdSettings } from "../../common/settings-parser";
import i18n from "../../i18n";
import pluginInfo from "../../plugin-manifest.json";
import { URLGenerator } from "../sidebar-panel/URLGenerator";
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

const onIframeClose = (rerender) => {
  const url = new URL(window.location.href);
  if (url.searchParams.get("livePreviewOpened") === "true") {
    url.searchParams.delete("livePreviewOpened");
    window.history.replaceState("", document.title, url.toString());
  }

  openedState.isOpened = false;
  rerender();
};

export const handleSecondaryColumnAdd = (
  { contentType, contentObject, form, rerender },
  getPluginSettings,
  getSpaceId,
) => {
  const url = new URL(window.location.href);
  if (url.searchParams.get("livePreviewOpened") === "true") {
    openedState.isOpened = true;
  }

  if (!contentType?.name || !form || !openedState.isOpened) return null;
  const settingsForCtd = getCtdSettings(getPluginSettings(), contentType.name);
  if (!settingsForCtd?.length) return null;

  const cacheKey = `${pluginInfo.id}-${contentType.name}-${contentObject?.id || "new"}-column`;
  let panelElement = getCachedElement(cacheKey)?.element;

  if (!panelElement) {
    const userId = JSON.parse(window.localStorage["cms.user"]).data?.id;

    const urlGenerator = new URLGenerator(
      settingsForCtd[0],
      getSpaceId(),
      userId,
    );
    const baseLink = urlGenerator.getURL(contentObject);

    panelElement = createSecondaryColumn(rerender, baseLink, onIframeClose);

    const resizeEvent = () => {
      if (window.innerWidth < 1024) {
        onIframeClose(rerender);
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
        onIframeClose(rerender);
      },
    );
  }

  return panelElement;
};
