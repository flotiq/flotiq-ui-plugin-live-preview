import { getObjectWSConnection } from "../../common/websockets";
import { updateDoc } from "../field-listeners";

export const handleFormRelationChanged = (
  {
    contentType,
    contentObject,
    fieldName,
    relation,
    relationContentType,
    relationContentObject,
    values,
  },
  getPluginSettings,
  getSpaceId,
  getApiUrl,
) => {
  if (!contentType || !fieldName) return;

  const schema = contentType.schemaDefinition?.allOf?.[1]?.properties;
  if (!schema) return;

  const wsConnection = getObjectWSConnection(
    getPluginSettings(),
    contentType,
    contentObject,
    getSpaceId(),
    getApiUrl(),
  );

  if (!wsConnection) return;

  const refreshMap = wsConnection.doc.getMap("refresh");

  refreshMap.set("relation", {
    increment: (refreshMap.get("relation")?.increment || 0) + 1,
    type: relationContentType.name,
    id: relationContentObject.id,
  });

  console.log(fieldName, relation);

  updateDoc(
    fieldName,
    JSON.parse(JSON.stringify(relation)),
    schema,
    wsConnection.doc,
    values,
  );
};
