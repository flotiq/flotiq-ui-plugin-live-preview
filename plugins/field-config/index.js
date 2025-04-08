import pluginInfo from "../../plugin-manifest.json";
import { getObjectWSConnection } from "../../common/websockets";
import { deepAssignToDoc, updateObjectDoc } from "../../common/yjs";

export const updateDoc = (props, schema, objectDoc, formikValues) => {
  const arg1 = props[0];
  const { fieldName, newValue } =
    arg1 instanceof Object && typeof arg1.target?.name === "string"
      ? { fieldName: arg1.target.name, newValue: arg1.target.value }
      : { fieldName: props[1], newValue: arg1 };

  if (objectDoc.getMap("vals").size) {
    updateObjectDoc(fieldName, newValue, schema, objectDoc);
  } else {
    deepAssignToDoc(formikValues, objectDoc.getMap("vals"), schema);
  }
};

export const handleFormFieldConfig = (
  { config, contentType, name, initialData, formik, create },
  getPluginSettings,
  getSpaceId,
  getApiUrl,
) => {
  if (!formik || create || !contentType) return;

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
    const originChange = config.onChange;
    const originBlur = config.onBlur;

    config.onBlur = (...props) => {
      originBlur?.(...props);
      wsConnection.ws.awareness.setLocalStateField("activeField", undefined);
    };

    config.onChange = (...props) => {
      updateDoc(props, schema, wsConnection.doc, formik.values);

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

      wsConnection.ws.awareness.setLocalStateField("activeField", name);
    };

    config["data-live-preview-overriden-events"] = true;
  }

  return null;
};
