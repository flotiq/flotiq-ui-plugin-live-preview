import { onBuildHandler } from "./build-handler";

export const updateNetlifyItem = (htmlElement, slug, values) => {
  // eslint-disable-next-line max-len
  //const buildInstance = `http://localhost:3000/api/flotiq/draft?key=3edb8c7de0fd9bda84767dec9cfdac62&draft=true&redirect=/${slug}`;
  const buttonLabel = "Live preview";

  const pluginButton = htmlElement.querySelector(
    ".plugin-deploy-netlify__button",
  );

  // :: Update button label and onclick handler
  pluginButton.innerText = buttonLabel;
  pluginButton.onclick = () => onBuildHandler(values);
};

export const createNetlifyItem = () => {
  const pluginContainerItem = document.createElement("div");
  pluginContainerItem.classList.add("plugin-deploy-netlify__item");

  pluginContainerItem.innerHTML = /* html */ `
    <button id="preview-button" class="plugin-deploy-netlify__button">
      Build site
    </button>
  `;

  return pluginContainerItem;
};
