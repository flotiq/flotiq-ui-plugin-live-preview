import { getObjectWSConnection } from "../../common/websockets";
import { deepAssignToDoc, updateObjectDoc } from "../../common/yjs";

export const updateDoc = (
  fieldName,
  newValue,
  schema,
  objectDoc,
  formValues,
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
    deepAssignToDoc(formValues, objectDoc.getMap("vals"), schema);
  }
};

export const handleFormFieldListenrsAdd = (
  { contentType, initialData, form, create },
  getPluginSettings,
  getSpaceId,
  getApiUrl,
) => {
  if (!form || create || !contentType) return;

  if (contentType?.nonCtdSchema) {
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
        fieldApi.name,
        value,
        schema,
        wsConnection.doc,
        form.getValues(),
        fieldApi.options.mode === "array",
      );
    },
  };
};
