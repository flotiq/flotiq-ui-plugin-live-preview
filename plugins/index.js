import { registerFn } from "../common/plugin-element-cache";
import i18n from "../i18n";
import pluginInfo from "../plugin-manifest.json";
import { handleFormFieldConfig } from "./field-config";
import { clearConnections } from "../common/websockets";
import { handleManagePlugin } from "./manage-form";
import { handlePanelPlugin } from "./sidebar-panel";
import cssString from "inline:./styles/index.css";
import { handleChangeTranslation } from "./mulitlingual-translations";
import { handleFormFieldListenrsAdd } from "./field-listeners";
import { handleSecondaryColumnAdd } from "./form-secondary-column";
import { handleFormRelationChanged } from "./form-relation-changed";
import { handleFormAfterSubmit } from "./form-after-submit";

const rerenderFn = {};

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
  (handler, _, { getPluginSettings, getLanguage, getSpaceId, getApiUrl, getFeatureFlag }) => {
    const isCollaborationEnabled = getFeatureFlag('formCollaboration');
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
      handlePanelPlugin(data, getPluginSettings, getSpaceId, rerenderFn.column),
    );
    handler.on("flotiq.form.field::config", (data) =>
      handleFormFieldConfig(data, getPluginSettings, getSpaceId, getApiUrl),
    );
    if (!isCollaborationEnabled) {
      handler.on("flotiq.form.field.listeners::add", (data) =>
        handleFormFieldListenrsAdd(
          data,
          getPluginSettings,
          getSpaceId,
          getApiUrl,
        ),
      );
    }

    handler.on("flotiq.form.secondary-column::add", (data) => {
      rerenderFn.column = data.rerender;
      return handleSecondaryColumnAdd(data, getPluginSettings, getSpaceId);
    });

    handler.on("flotiq.language::changed", ({ language }) => {
      if (language !== i18n.language) {
        i18n.changeLanguage(language);
      }
    });

    if (!isCollaborationEnabled) {
      handler.on("flotiq.form.relation::after-submit", (data) => {
        handleFormRelationChanged(data, getPluginSettings, getSpaceId, getApiUrl);
      });
    }

    handler.on("flotiq.form::after-submit", (data) =>
      handleFormAfterSubmit(data, getPluginSettings, getSpaceId, getApiUrl),
    );

    if (!isCollaborationEnabled) {
      handler.on("flotiq-multilingual.translation::changed", (data) => {
        handleChangeTranslation(data, getPluginSettings, getSpaceId, getApiUrl);
      });
    }
  },
);
