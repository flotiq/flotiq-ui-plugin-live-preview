import { getObjectWSConnection } from "../../common/websockets";
import { updateObjectDoc } from "../../common/yjs";

export const handleChangeTranslation = (
  { fieldName, initialData, contentType, newTranslation },
  getPluginSettings,
  getSpaceId,
  getApiUrl,
) => {
  const wsConnection = getObjectWSConnection(
    getPluginSettings(),
    contentType,
    initialData,
    getSpaceId(),
    getApiUrl(),
  );

  if (!wsConnection) return;

  updateObjectDoc(
    fieldName,
    newTranslation,
    contentType?.schemaDefinition?.allOf?.[1]?.properties,
    wsConnection.doc,
  );
};
