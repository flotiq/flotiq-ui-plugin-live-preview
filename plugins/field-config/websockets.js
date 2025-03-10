import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";
import { getUserColor } from "./user-colors";

const connections = new Map();

export function getWebSocketConnection(apiKey, roomId, apiUrl) {
  if (!connections.has(roomId)) {
    const ydoc = new Y.Doc();

    const websocketEnpoint =
      apiUrl !== "https://api.flotiq.com"
        ? "wss://flotiq-websockets-staging.dev.cdwv.pl"
        : "wss://sockets.flotiq.com";

    const ws = new WebsocketProvider(websocketEnpoint, roomId, ydoc, {
      params: { apiKey },
      connect: true,
    });

    connections.set(roomId, { ws, doc: ydoc });

    const userData = JSON.parse(window.localStorage["cms.user"]).data;

    ws.on("connection-close", () => {
      const users = Array.from(ws.awareness.getStates().values()) || [];
      const flotiqEditors = users.filter(
        (user) => user?.userId && user.userId !== userData.id,
      );

      if (!flotiqEditors.length) {
        ydoc.getMap("vals").clear();
        ydoc.destroy();
      }

      ws.awareness.destroy();
    });

    ws.on("status", (isOpened) => {
      if (!isOpened) return;
      const update = Y.encodeStateAsUpdate(ydoc);
      Y.applyUpdate(ydoc, update);
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

export function clearConnections() {
  if (connections.size > 0)
    connections.forEach((value) => {
      value.ws.disconnect();
      value.ws.destroy();
    });

  connections.clear();
}
