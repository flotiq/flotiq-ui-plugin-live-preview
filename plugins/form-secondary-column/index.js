import {
  addElementToCache,
  getCachedElement,
} from "../../common/plugin-element-cache";
import { getCtdSettings } from "../../common/settings-parser";
import pluginInfo from "../../plugin-manifest.json";
import { createSecondaryColumn, openedState } from "./column-element";

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
  }

  addElementToCache(panelElement, cacheKey);

  return panelElement;
};
