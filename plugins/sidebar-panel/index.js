import {
  addElementToCache,
  getCachedElement,
} from "../../common/plugin-element-cache";
import { getCtdSettings } from "../../common/settings-parser";
import pluginInfo from "../../plugin-manifest.json";
import { clearConnections } from "../../common/websockets";
import { createPanelElement, updatePanelElement } from "./panel-elements";

export const handlePanelPlugin = (
  { contentType, contentObject, form, create },
  getPluginSettings,
  getSpaceId,
  rerenderColumn,
) => {
  if (!contentType?.name || !form) return null;
  const settingsForCtd = getCtdSettings(getPluginSettings(), contentType.name);
  if (!settingsForCtd?.length) return null;

  const cacheKey = `${pluginInfo.id}-${contentType.name}-${contentObject?.id || "new"}`;
  let pluginContainer = getCachedElement(cacheKey)?.element;
  if (!pluginContainer) {
    pluginContainer = createPanelElement(create);

    addElementToCache(pluginContainer, cacheKey, null, () => {
      clearConnections();
    });
  }

  const spaceId = getSpaceId();

  const objectData = { ...contentObject, ...form.getValues() };
  updatePanelElement(
    pluginContainer,
    settingsForCtd,
    objectData,
    spaceId,
    create,
    rerenderColumn,
  );

  return pluginContainer;
};
