import { getCtdSettings } from "../../common/settings-parser";
import pluginInfo from "../../plugin-manifest.json";
import { getWebSocketConnection } from "./websockets";
import throttle from "lodash/throttle";

const THROTTLE_TIMEOUT = 300;

const incrementSpaceWs = (ydoc) => {
  const vals = ydoc.getMap("vals");
  const number = vals.get("num") || 0;
  vals.set("num", number + 1);
};

const throttledUpdate = throttle((props, objectDoc, spaceDoc) => {
  const objectValues = objectDoc.getMap("vals");
  const arg1 = props[0];
  if (arg1 instanceof Object && arg1.nativeEvent) {
    objectValues.set(arg1.target.name, arg1.target.value);
  } else {
    objectValues.set(props[1], arg1);
  }
  incrementSpaceWs(spaceDoc);
}, THROTTLE_TIMEOUT);

export const handleFormFieldConfig = (
  { config, contentType, name, initialData, formik, create },
  getPluginSettings,
  getSpaceId,
  getApiUrl,
) => {
  if (!formik || create) return;

  if (contentType?.id === pluginInfo.id && contentType?.nonCtdSchema) {
    if (["editor_key", "api_key"].includes(name)) {
      config.type = "password";
      config.autocomplete = "new-password";
    }
    return;
  }

  if (!contentType?.name || !formik) return null;

  const settingsForCtd = getCtdSettings(getPluginSettings(), contentType.name);
  if (!settingsForCtd.length) return;

  const spaceId = getSpaceId();
  if (!spaceId) return;

  if (!config["data-live-preview-overriden-events"]) {
    const objectRoomId = `${spaceId}/${contentType.name}/${initialData?.id || "add"}`;
    const spaceRoom = spaceId;

    const apiUrl = getApiUrl();

    const { doc: objectDoc, ws: objectWs } = getWebSocketConnection(
      settingsForCtd[0].api_key,
      objectRoomId,
      apiUrl,
    );

    const { doc: spaceDoc } = getWebSocketConnection(
      settingsForCtd[0].api_key,
      spaceRoom,
      apiUrl,
    );

    const originChange = config.onChange;
    const originBlur = config.onBlur;

    config.onBlur = (...props) => {
      originBlur?.(...props);
      objectWs.awareness.setLocalStateField("activeField", undefined);
      incrementSpaceWs(spaceDoc);
    };

    config.onChange = (...props) => {
      const arg1 = props[0];
      const name =
        arg1 instanceof Object && arg1.nativeEvent
          ? arg1.target.name
          : props[1];

      throttledUpdate(props, objectDoc, spaceDoc);

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
