import pluginInfo from "../../plugin-manifest.json";
import { getObjectWSConnection } from "../../common/websockets";

export const handleFormFieldConfig = (
  { config, contentType, name, initialData, form, create },
  getPluginSettings,
  getSpaceId,
  getApiUrl,
) => {
  if (!form || create || !contentType) return;

  if (contentType?.id === pluginInfo.id && contentType?.nonCtdSchema) {
    if (["editor_key", "api_key"].includes(name)) {
      config.type = "password";
      config.autocomplete = "new-password";
    }
    return;
  }

  const schema = contentType.schemaDefinition?.allOf?.[1]?.properties;
  if (!schema) return;

  const wsConnection = getObjectWSConnection(
    getPluginSettings(),
    contentType,
    initialData,
    getSpaceId(),
    getApiUrl(),
  );

  if (!wsConnection) return;

  if (!config["data-live-preview-overriden-events"]) {
    config.onFocus = (...props) => {
      const arg1 = props[0];
      const name =
        arg1 instanceof Object && typeof arg1.target?.name === "string"
          ? arg1.target.name
          : arg1;

      wsConnection.ws.awareness.setLocalStateField("activeField", name);
    };

    config["data-live-preview-overriden-events"] = true;
  }

  return null;
};
