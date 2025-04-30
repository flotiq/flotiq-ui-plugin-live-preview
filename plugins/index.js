import { registerFn } from "../common/plugin-element-cache";
import i18n from "../i18n";
import pluginInfo from "../plugin-manifest.json";
import { handleFormFieldConfig } from "./field-config";
import { clearConnections } from "../common/websockets";
import { handleManagePlugin } from "./manage-form";
import { handlePanelPlugin } from "./sidebar-panel";
import cssString from "inline:./styles/index.css";
import { handleChangeTranslation } from "./mulitlingual-translations";

const loadStyles = () => {
  if (!document.getElementById(`${pluginInfo.id}-styles`)) {
    const style = document.createElement("style");
    style.id = `${pluginInfo.id}-styles`;
    style.textContent = cssString;
    document.head.appendChild(style);
  }
};

registerFn(
  pluginInfo,
  (handler, _, { getPluginSettings, getLanguage, getSpaceId, getApiUrl }) => {
    loadStyles();

    const language = getLanguage();
    if (language !== i18n.language) {
      i18n.changeLanguage(language);
    }

    window.addEventListener("beforeunload", () => {
      clearConnections();
    });

    handler.on("flotiq.plugins.manage::form-schema", (data) =>
      handleManagePlugin(data),
    );
    handler.on("flotiq.form.sidebar-panel::add", (data) =>
      handlePanelPlugin(data, getPluginSettings, getSpaceId),
    );
    handler.on("flotiq.form.field::config", (data) =>
      handleFormFieldConfig(data, getPluginSettings, getSpaceId, getApiUrl),
    );
    handler.on("flotiq.language::changed", ({ language }) => {
      if (language !== i18n.language) {
        i18n.changeLanguage(language);
      }
    });

    handler.on("flotiq-multilingual.translation::changed", (data) => {
      handleChangeTranslation(data, getPluginSettings, getSpaceId, getApiUrl);
    });
  },
);
