import { getObjectWSConnection } from "../../common/websockets";
import { updateObjectDoc } from "../../common/yjs";

export const handleAddTranslation = (
  { fieldName, language, initialData, contentType },
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
    `${fieldName}.__language`,
    language,
    contentType?.schemaDefinition?.allOf?.[1]?.properties,
    wsConnection.doc,
  );
};
