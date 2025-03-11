import previewIcon from "inline:../../images/preview-icon.svg";
import { URLGenerator } from "./URLGenerator";
import i18n from "../../i18n";

let tabRef = null;

export const createPanelElement = (disabled) => {
  const panelElement = document.createElement("div");
  panelElement.classList.add("plugin-live-preview");

  let container = /*html*/ `
      <span class="plugin-live-preview__header">
        Preview
      </span>
      <div class="plugin-live-preview__button-list"></div>
  `;

  if(disabled) {
    container += /* html */  `
        <span class="plugin-live-preview__disabled">
            ${ i18n.t("SaveToPreview") }
        </span>`
  }

  panelElement.innerHTML = container;

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

export const updatePanelElement = (
  pluginContainer,
  settingsForCtd,
  data,
  spaceId,
  create,
) => {
  const buttonList = pluginContainer.querySelector(
    ".plugin-live-preview__button-list",
  );

  settingsForCtd.forEach((buttonSettings, index) => {
    let htmlItem = buttonList.children[index];
    if (!htmlItem) {
      htmlItem = createLink();
      buttonList.appendChild(htmlItem);
    }
    updateLink(htmlItem, buttonSettings, data, spaceId, create);
    return htmlItem;
  });

  // Remove unnecessary items
  while (settingsForCtd.length < buttonList.children.length) {
    buttonList.children[buttonList.children.length - 1].remove();
  }
};

const createLink = () => {
  const linkItem = document.createElement("a");
  linkItem.classList.add("plugin-live-preview__link");

  linkItem.innerHTML = /*html*/ `
      ${previewIcon}
      <span>Public version</span>
    `;
  return linkItem;
};

const updateLink = (htmlElement, config, contentObject, spaceId, disabled) => {
  const urlGenerator = new URLGenerator(config, spaceId);
  const link = urlGenerator.getURL(contentObject);

  htmlElement.querySelector("span").textContent = i18n.t("Preview");

  if (disabled) {
    htmlElement.classList.add("plugin-live-preview__link--disabled");
    htmlElement.onclick = (event) => {
      event.preventDefault();
    }
    return;
  }

  htmlElement.href = link;

  htmlElement.onclick = (event) => {
    event.preventDefault();

    if (tabRef && !tabRef?.closed) {
      tabRef.location.replace(link);
      tabRef.focus();
    } else {
      tabRef = window.open(link, "_blank");
      window.tabRef = tabRef;
    }
  };
};
