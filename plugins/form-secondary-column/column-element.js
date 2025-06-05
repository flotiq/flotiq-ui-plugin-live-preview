import i18n from "../../i18n";
import { openInNewTab } from "../sidebar-panel/panel-elements";

import previewIcon from "inline:../../images/preview-icon.svg";
import closeIcon from "inline:../../images/close-icon.svg";
import refreshIcon from "inline:../../images/refresh-icon.svg";
import mobileIcon from "inline:../../images/mobile-icon.svg";
import desktopIcon from "inline:../../images/desktop-icon.svg";
import fullSizeIcon from "inline:../../images/full-size-icon.svg";

export const openedState = {
  isOpened: false,
  link: null,
};

export const createSecondaryColumn = (rerender) => {
  const panelElement = document.createElement("div");
  panelElement.className = "plugin-live-preview__secondary-column";

  panelElement.innerHTML = /*html*/ `
      <div class="plugin-live-preview__status-bar">
        <div class="plugin-live-preview__status-bar__wrapper">
          <div class="plugin-live-preview__status-dot"></div>
          <div class="plugin-live-preview__status-info">${i18n.t("Connecting")}</div>
          <button 
            class="plugin-live-preview__status-button 
                  plugin-live-preview__status-button--blue 
                  plugin-live-preview__refresh"
            type="button"
          >
            ${refreshIcon}
          </button>
        </div>

        <div class="plugin-live-preview__status-bar__wrapper plugin-live-preview__status-bar__wrapper--middle">
          <button 
            class="plugin-live-preview__status-button plugin-live-preview__size-button"
            data-size="mobile"
            type="button"
          >
            ${mobileIcon}
          </button>
          <button 
            class="plugin-live-preview__status-button 
                  plugin-live-preview__status-button--blue 
                  plugin-live-preview__size-button"
            data-size="desktop"
            type="button"
          >
            ${desktopIcon}
          </button>
          <button 
            class="plugin-live-preview__status-button plugin-live-preview__size-button"
            data-size="full-size"
            type="button"
          >
            ${fullSizeIcon}
          </button>
        </div>

        <div class="plugin-live-preview__status-bar__wrapper plugin-live-preview__status-bar__wrapper--end">
          <a class="plugin-live-preview__status-button plugin-live-preview__open-tab">${previewIcon}</a>
          <button 
            class="plugin-live-preview__status-button plugin-live-preview__close"
            type="button"
          >
            ${closeIcon}
          </button>
        </div>
    </div>
  `;

  const button = panelElement.querySelector(".plugin-live-preview__close");
  button.onclick = () => {
    openedState.isOpened = false;
    rerender();
  };

  const openInNewTabLink = panelElement.querySelector(
    ".plugin-live-preview__open-tab",
  );

  openInNewTabLink.href = openedState.link;

  openInNewTabLink.onclick = (event) => {
    event.preventDefault();
    openInNewTab(openedState.link);
  };

  const iframe = document.createElement("iframe");
  iframe.src = openedState.link;
  iframe.className = "plugin-live-preview__iframe";
  iframe.referrerPolicy = "origin";
  panelElement.appendChild(iframe);

  const reloadButton = panelElement.querySelector(
    ".plugin-live-preview__refresh",
  );
  reloadButton.onclick = () => {
    iframe.src += "";
  };

  const sizeButtons = panelElement.querySelectorAll(
    ".plugin-live-preview__size-button",
  );

  sizeButtons.forEach((button) => {
    button.onclick = () => {
      if (button.classList.contains("plugin-live-preview__status-button--blue"))
        return;

      const selected = panelElement.querySelectorAll(
        ".plugin-live-preview__size-button.plugin-live-preview__status-button--blue",
      );
      selected.forEach((selected) =>
        selected.classList.remove("plugin-live-preview__status-button--blue"),
      );

      button.classList.add("plugin-live-preview__status-button--blue");

      const size = button.attributes["data-size"].value;
      panelElement.setAttribute("data-size", size);
    };
  });

  return panelElement;
};
