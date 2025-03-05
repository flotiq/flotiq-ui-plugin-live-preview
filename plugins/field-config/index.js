import { getCtdSettings } from "../../common/settings-parser";
import pluginInfo from "../../plugin-manifest.json";
import { getWebSocketConnection } from "./websockets";

const DEBOUNCE_TIMEOUT = 300;

let increment = 0;

export const handleFormFieldConfig = (
  { config, contentType, name, initialData, formik },
  getPluginSettings,
  getSpaceId,
) => {
  if (!formik) return;

  if (contentType?.id === pluginInfo.id && contentType?.nonCtdSchema) {
    if (name === "editor_key") {
      config.type = "password";
      config.autoComplete = "off";
    }
    return;
  }

  if (!contentType?.name || !formik) return null;

  const settingsForCtd = getCtdSettings(getPluginSettings(), contentType.name);
  if (!settingsForCtd.length) return;

  let debounceTimeout;

  if (!config["data-live-preview-overriden-events"]) {
    const spaceId = getSpaceId();
    const objectRoomId = `${spaceId}/${contentType.name}/${initialData?.id || "add"}`;
    const spaceRoom = spaceId;

    const { doc: objectDoc, ws: objectWs } = getWebSocketConnection(
      settingsForCtd[0].api_key,
      contentType.name,
      objectRoomId,
    );

    const { doc: spaceDoc } = getWebSocketConnection(
      settingsForCtd[0].api_key,
      contentType.name,
      spaceRoom,
    );

    const originChange = config.onChange;
    const originBlur = config.onBlur;

    config.onBlur = (...props) => {
      originBlur?.(...props);
      objectWs.awareness.setLocalStateField("activeField", undefined);

      const spaceValues = spaceDoc.getMap("vals");
      spaceValues.set(increment);
      increment++;
    };

    config.onChange = (...props) => {
      clearTimeout(debounceTimeout);

      const arg1 = props[0];
      const name =
        arg1 instanceof Object && arg1.nativeEvent
          ? arg1.target.name
          : props[1];

      debounceTimeout = setTimeout(() => {
        const spaceValues = spaceDoc.getMap("vals");
        const objectValues = objectDoc.getMap("vals");

        const arg1 = props[0];

        if (arg1 instanceof Object && arg1.nativeEvent) {
          objectValues.set(arg1.target.name, arg1.target.value);
        } else {
          objectValues.set(props[1], arg1);
        }

        spaceValues.set(increment);
        increment++;
      }, DEBOUNCE_TIMEOUT);

      if (originChange) {
        originChange(...props);
      } else {
        formik.handleChange(...props);
      }

      objectWs.awareness.setLocalStateField("activeField", name);
    };

    config["data-live-preview-overriden-events"] = true;
  }

  return null;
};
