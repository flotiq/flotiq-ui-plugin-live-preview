import { sendRefetchSignal } from "../../common/websockets";

export const handleFormAfterSubmit = (
  data,
  getPluginSettings,
  getSpaceId,
  getApiUrl,
) => {
  if (!data || typeof data !== "object") return;

  if (!data.success) return;

  const contentObject = data.contentObject;
  const contentTypeName =
    data.contentType?.name ||
    data.contentTypeDefinition?.name ||
    contentObject?.internal?.contentType;
  const contentType = contentTypeName ? { name: contentTypeName } : null;

  if (!contentType?.name || !contentObject?.id) return;

  sendRefetchSignal(
    getPluginSettings(),
    contentType,
    contentObject,
    getSpaceId(),
    getApiUrl(),
  );
};
