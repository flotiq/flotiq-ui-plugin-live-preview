import {
  addElementToCache,
  getCachedElement,
} from "../../common/plugin-element-cache";
import pluginInfo from "../../plugin-manifest.json";
import previewIcon from "inline:../../images/preview-icon.svg";
import { URLGenerator } from "./URLGenerator";
import i18n from "../../i18n";
import { getWebSocketConnection } from "../field-config/websockets";

let tabRef = null;

const createPanelElement = () => {
  const panelElement = document.createElement("div");
  panelElement.classList.add("plugin-live-preview");
  panelElement.innerHTML = /*html*/ `
    <span class="plugin-live-preview__header">
      Preview
    </span>
    <a class="plugin-live-preview__link">
      ${previewIcon}
      <span>View</span>
    </a>
  `;

  panelElement.addEventListener(
    "flotiq.attached",
    () => {
      if (!panelElement.parentElement) return;
      panelElement.parentElement.style.order = "-1";
    },
    true,
  );

  return panelElement;
};

const updatePanelElement = (
  pluginContainer,
  settingsForCtd,
  contentTypeName,
  objectId,
  data,
) => {
  const livePreviewLink = pluginContainer.querySelector(
    ".plugin-live-preview__link",
  );

  const urlGenerator = new URLGenerator(
    contentTypeName,
    objectId,
    settingsForCtd,
  );
  livePreviewLink.href = urlGenerator.getURL(data);

  livePreviewLink.textContent = i18n.t("Preview");

  livePreviewLink.onclick = (event) => {
    event.preventDefault();

    if (tabRef && !tabRef?.closed) {
      tabRef.focus();
    } else {
      tabRef = window.open(livePreviewLink, "_blank");
      window.tabRef = tabRef;
    }
  };
};

export const handlePanelPlugin = (
  { contentType, contentObject, formik },
  getPluginSettings,
) => {
  const pluginSettings = getPluginSettings();
  const parsedSettings = JSON.parse(pluginSettings || "{}");

  if (!contentType?.name || !parsedSettings || !formik) return null;

  const settingsForCtd = parsedSettings.config
    ?.filter(
      (plugin) =>
        plugin.content_types.length === 0 ||
        plugin.content_types.find((ctd) => ctd === contentType.name),
    )
    ?.map((config) => ({
      ...config,
      editor_key: parsedSettings.editor_key,
      base_url: parsedSettings.base_url,
      api_key: parsedSettings.api_key,
    }));

  if (!settingsForCtd.length) return null;

  const cacheKey = `${pluginInfo.id}-${contentType.name}-${contentObject?.id || "new"}`;
  let pluginContainer = getCachedElement(cacheKey)?.element;
  if (!pluginContainer) {
    pluginContainer = createPanelElement(cacheKey);

    addElementToCache(pluginContainer, cacheKey, {}, () => {
      const { ws } = getWebSocketConnection(
        settingsForCtd[0].api_key,
        contentType.name,
        contentObject?.id,
      );

      if (!ws) return;
      ws.destroy();
    });
  }

  updatePanelElement(
    pluginContainer,
    settingsForCtd[0],
    contentType.name,
    contentObject?.id,
    formik.values || contentObject,
  );

  return pluginContainer;
};
