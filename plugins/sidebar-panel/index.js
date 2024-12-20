import {
  addElementToCache,
  getCachedElement,
} from "../../common/plugin-element-cache";
import { updateTabData } from "./build-handler";
import { createNetlifyItem, updateNetlifyItem } from "./panel-button";

const createPanelElement = (cacheKey) => {
  const panelElement = document.createElement("div");
  panelElement.classList.add("plugin-deploy-netlify");
  panelElement.id = cacheKey;
  panelElement.innerHTML = /*html*/ `
    <span id="plugin-deploy-netlify__header" class="plugin-deploy-netlify__header">
      Links
    </span>
    <div class="plugin-deploy-netlify__button-list"></div>
  `;

  addElementToCache(panelElement, cacheKey);

  return panelElement;
};

const updatePanelElement = (pluginContainer, slug, values) => {
  const buttonList = pluginContainer.querySelector(
    ".plugin-deploy-netlify__button-list",
  );

  let htmlItem = buttonList.children[0];
  if (!htmlItem) {
    htmlItem = createNetlifyItem();
    buttonList.appendChild(htmlItem);
  }

  updateNetlifyItem(htmlItem, slug, values);
};

export const handlePanelPlugin = (
  { contentType, contentObject, create, duplicate, formik },
  pluginInfo,
) => {
  const isCreating = duplicate || create;
  if (isCreating || !formik) return;

  const cacheKey = `${pluginInfo.id}-${contentType?.name}-${
    isCreating ? contentObject?.id : "new"
  }`;

  let pluginContainer = getCachedElement(cacheKey)?.element;

  if (!pluginContainer) {
    pluginContainer = createPanelElement(cacheKey);

    pluginContainer.addEventListener(
      "flotiq.attached",
      () => {
        if (!pluginContainer.parentElement) return;
        pluginContainer.parentElement.style.order = "-1";
      },
      true,
    );
  }

  updatePanelElement(pluginContainer, contentObject.slug, formik.values);

  updateTabData(formik.values);

  return pluginContainer;
};
