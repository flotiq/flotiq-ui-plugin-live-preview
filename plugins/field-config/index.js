import throttle from "lodash/throttle";
import * as Y from "yjs";
import diff from "fast-diff";

import pluginInfo from "../../plugin-manifest.json";
import { getCtdSettings } from "../../common/settings-parser";
import { getWebSocketConnection } from "./websockets";

const THROTTLE_TIMEOUT = 300;

/** Convert a fast-diff result to a YJS delta. */
const diffToDelta = (diffResult) => {
  return diffResult
    .map(
      ([op, value]) =>
        ({
          [diff.INSERT]: { insert: value },
          [diff.EQUAL]: { retain: value.length },
          [diff.DELETE]: { delete: value.length },
        })[op],
    )
    .filter(Boolean);
};

const throttledUpdate = throttle((props, schema, objectDoc) => {
  const objectValues = objectDoc.getMap("vals");
  const arg1 = props[0];

  const { fieldName, newValue } =
    arg1 instanceof Object && typeof arg1.target?.name === "string"
      ? { fieldName: arg1.target.name, newValue: arg1.target.value }
      : { fieldName: props[1], newValue: arg1 };

  if (schema.type === "string") {
    let ytext = objectValues.get(fieldName);
    if (!ytext) {
      ytext = new Y.Text();
      objectValues.set(fieldName, ytext);
    }
    const delta = diffToDelta(diff(ytext.toString(), newValue));
    ytext.applyDelta(delta);
  } else {
    objectValues.set(fieldName, newValue);
  }
}, THROTTLE_TIMEOUT);

export const handleFormFieldConfig = (
  { config, contentType, name, initialData, formik, create, schema },
  getPluginSettings,
  getSpaceId,
  getApiUrl,
) => {
  if (!formik || create || !schema?.type) return;

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
    const apiUrl = getApiUrl();

    const { doc: objectDoc, ws: objectWs } = getWebSocketConnection(
      settingsForCtd[0].api_key,
      objectRoomId,
      apiUrl,
    );

    const originChange = config.onChange;
    const originBlur = config.onBlur;

    config.onBlur = (...props) => {
      originBlur?.(...props);
      objectWs.awareness.setLocalStateField("activeField", undefined);
    };

    config.onChange = (...props) => {
      throttledUpdate(props, schema, objectDoc);

      if (originChange) {
        originChange(...props);
      } else {
        formik.handleChange(...props);
      }
    };

    config.onFocus = (...props) => {
      const arg1 = props[0];
      const name =
        arg1 instanceof Object && typeof arg1.target?.name === "string"
          ? arg1.target.name
          : arg1;

      objectWs.awareness.setLocalStateField("activeField", name);
    };

    config["data-live-preview-overriden-events"] = true;
  }

  return null;
};
