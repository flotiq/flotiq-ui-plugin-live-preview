import {
  addElementToCache,
  getCachedElement,
} from "../../common/plugin-element-cache";
import { getCtdSettings } from "../../common/settings-parser";
import pluginInfo from "../../plugin-manifest.json";
import { disconnectFromRoom } from "../../common/websockets";
import {
  createMockElement,
  createPanelElement,
  updatePanelElement,
} from "./panel-elements";

export const handlePanelPlugin = (
  { contentType, contentObject, form, create },
  getPluginSettings,
  getSpaceId,
  rerenderColumn,
) => {
  if (!contentType?.name || !form) return null;
  const settingsForCtd = getCtdSettings(getPluginSettings(), contentType.name);
  const ctdHaspreview = !!settingsForCtd?.length;
  const cacheKey = `${pluginInfo.id}-${contentType.name}-${contentObject?.id || "new"}`;
  let pluginContainer = getCachedElement(cacheKey)?.element;
  if (!pluginContainer) {
    pluginContainer = ctdHaspreview
      ? createPanelElement(create)
      : createMockElement();

    addElementToCache(pluginContainer, cacheKey, null, () => {
      const roomId = `${contentType.name}/${contentObject?.id || "add"}`;
      disconnectFromRoom(roomId);
    });
  }

  if (ctdHaspreview) {
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
  }

  return pluginContainer;
};
