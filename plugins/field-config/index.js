import pluginInfo from "../../plugin-manifest.json";
import { getWebSocketConnection } from "./websockets";

const DEBOUNCE_TIMEOUT = 300;

export const handleFormFieldConfig = (
  { config, contentType, name, initialData, formik },
  getPluginSettings,
) => {
  if (!formik) return;

  if (contentType?.id === pluginInfo.id && contentType?.nonCtdSchema) {
    if (name === "editor_key") {
      config.type = "password";
      config.autoComplete = "off";
    }
    return;
  }

  const pluginSettings = getPluginSettings();
  const parsedSettings = JSON.parse(pluginSettings || "{}");

  if (!contentType?.name || !parsedSettings || !formik) return null;

  const settingsForCtd = parsedSettings.config
    ?.filter(
      (plugin) =>
        plugin.content_types.length === 0 ||
        plugin.content_types.find((ctd) => ctd === contentType.name),
    )
    ?.map((config) => ({
      ...config,
      editor_key: parsedSettings.editor_key,
      api_key: parsedSettings.api_key,
      base_url: parsedSettings.base_url,
    }));

  if (!settingsForCtd.length) return;

  const { doc, ws } = getWebSocketConnection(
    settingsForCtd[0].api_key,
    contentType.name,
    initialData?.id,
  );

  // console.log(ws, doc);

  let debounceTimeout;

  if (!config["data-live-preview-overriden-events"]) {
    const originChange = config.onChange;
    const originBlur = config.onBlur;

    config.onBlur = (...props) => {
      originBlur?.(...props);
      ws.awareness.setLocalStateField("activeField", undefined);
    };

    config.onChange = (...props) => {
      clearTimeout(debounceTimeout);

      const arg1 = props[0];
      const name =
        arg1 instanceof Object && arg1.nativeEvent
          ? arg1.target.name
          : props[1];

      debounceTimeout = setTimeout(() => {
        const vals = doc.getMap("vals");

        const arg1 = props[0];

        if (arg1 instanceof Object && arg1.nativeEvent) {
          console.log("change", arg1.target.name, arg1.target.value);
          vals.set(arg1.target.name, arg1.target.value);
        } else {
          console.log(props[1], arg1);
          vals.set(props[1], arg1);
        }
      }, DEBOUNCE_TIMEOUT);

      if (originChange) {
        originChange(...props);
      } else {
        formik.handleChange(...props);
      }

      ws.awareness.setLocalStateField("activeField", name);
      console.log("active field", name);
    };

    config["data-live-preview-overriden-events"] = true;
  }

  return null;
};
