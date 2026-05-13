import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";
import { getUserColor } from "../plugins/field-config/user-colors";
import { getGlobalSettings } from "./settings-parser";
import { renderDebugPanel } from "./ws-debug-panel";

const connections = new Map();

renderDebugPanel(connections);

setInterval(() => {
  renderDebugPanel();
}, 1000);

function getWebSocketEndpoint(apiUrl) {
  if (process.env.WS_ENDPOINT) return process.env.WS_ENDPOINT;

  return apiUrl !== "https://api.flotiq.com"
    ? "wss://flotiq-websockets-staging.dev.cdwv.pl"
    : "wss://collab-gateway.flotiq.com";
}

function disposeConnection(roomId) {
  if (!connections.has(roomId)) return;

  const connection = connections.get(roomId);
  if (connection.isDisposing) return;

  connection.isDisposing = true;

  const { ws, doc } = connection;

  ws.shouldConnect = false;
  ws.disconnect();
  ws.destroy();

  if (!doc.isDestroyed) {
    doc.destroy();
  }

  connections.delete(roomId);
  renderDebugPanel();
}

function getWebSocketConnection(apiKey, roomId, apiUrl) {
  if (!connections.has(roomId)) {
    const ydoc = new Y.Doc();
    const websocketEnpoint = getWebSocketEndpoint(apiUrl);

    const ws = new WebsocketProvider(
      websocketEnpoint,
      `ws/editor/${roomId}`, // roomId = "contentType/id"
      ydoc,
      {
        params: { apiKey },
        connect: true,
      },
    );

    connections.set(roomId, { ws, doc: ydoc, isDisposing: false });
    renderDebugPanel();

    const userData = JSON.parse(window.localStorage["cms.user"]).data;

    ws.on("connection-close", () => {
      if (connections.get(roomId)?.isDisposing) return;
      renderDebugPanel();
    });

    ws.on("status", (event) => {
      if (event.status === "connected") {
        const update = Y.encodeStateAsUpdate(ydoc);
        Y.applyUpdate(ydoc, update);
      }

      renderDebugPanel();
    });

    // Set user information for the connection
    ws.awareness.setLocalState({
      userId: userData.id,
      name: userData.firstName + " " + userData.lastName,
      color: getUserColor(userData.id),
      lightColor: getUserColor(userData.id, true),
    });
  }

  return connections.get(roomId);
}

export function disconnectFromRoom(roomId) {
  disposeConnection(roomId);
}

export function clearConnections() {
  Array.from(connections.keys()).forEach((roomId) => {
    disposeConnection(roomId);
  });
}

export const getObjectWSConnection = (
  pluginSettings,
  contentType,
  initialData,
  spaceId,
  apiUrl,
) => {
  if (!spaceId || !apiUrl || !pluginSettings || !contentType?.name) return;

  const globalSettings = getGlobalSettings(pluginSettings);
  if (!globalSettings.api_key) return;

  const objectRoomId = `${contentType.name}/${initialData?.id || "add"}`;

  return getWebSocketConnection(globalSettings.api_key, objectRoomId, apiUrl);
};

export const sendRefetchSignal = (
  pluginSettings,
  contentType,
  initialData,
  spaceId,
  apiUrl,
) => {
  if (!spaceId || !apiUrl || !pluginSettings || !contentType?.name) return;

  const objectRoomId = `${contentType.name}/${initialData?.id || "add"}`;
  const wsConnection = connections.get(objectRoomId);

  if (!wsConnection?.ws?.ws) return;

  const nativeSocket = wsConnection.ws.ws;
  if (nativeSocket.readyState !== WebSocket.OPEN) return;

  const docKey =
    contentType?.name && initialData?.id
      ? `${contentType.name}/${initialData.id}`
      : undefined;

  const payload = docKey ? { type: "refetch", docKey } : { type: "refetch" };

  try {
    nativeSocket.send(JSON.stringify(payload));
  } catch {
    // fire-and-forget
  }
};
