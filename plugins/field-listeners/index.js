import pluginInfo from "../../plugin-manifest.json";
import { getObjectWSConnection } from "../../common/websockets";
import { deepAssignToDoc, updateObjectDoc } from "../../common/yjs";

export const updateDoc = (
  fieldName,
  newValue,
  schema,
  objectDoc,
  formikValues,
  isArrayChanged,
) => {
  if (objectDoc.getMap("vals").size) {
    updateObjectDoc(
      fieldName,
      newValue,
      schema,
      objectDoc.getMap("vals"),
      isArrayChanged,
    );
  } else {
    deepAssignToDoc(formikValues, objectDoc.getMap("vals"), schema);
  }
};

export const handleFormFieldListenrsAdd = (
  { contentType, initialData, formik, name, create },
  getPluginSettings,
  getSpaceId,
  getApiUrl,
) => {
  if (!formik || create || !contentType) return;

  if (contentType?.id === pluginInfo.id && contentType?.nonCtdSchema) {
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

  return {
    onBlur: () => {
      wsConnection.ws.awareness.setLocalStateField("activeField", undefined);
    },
    onChange: ({ value, fieldApi }) => {
      updateDoc(
        name,
        value,
        schema,
        wsConnection.doc,
        formik.values,
        fieldApi.options.mode === "array",
      );
    },
  };
};
