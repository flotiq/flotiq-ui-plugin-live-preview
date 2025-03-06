import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";

const WEBSOCKET_ENDPOINT = "ws://localhost:1234";

// Global websocket connection cache
const connections = new Map();

export function getWebSocketConnection(apiKey, roomId) {
  if (!connections.has(roomId)) {
    const ydoc = new Y.Doc();
    const ws = new WebsocketProvider(WEBSOCKET_ENDPOINT, roomId, ydoc, {
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
      connections.delete(roomId);
    });

    ws.on("status", (isOpened) => {
      if (!isOpened) return;
      const update = Y.encodeStateAsUpdate(ydoc);
      Y.applyUpdate(ydoc, update);
    });

    // Ustawiamy awareness dla użytkownika
    ws.awareness.setLocalState({
      userId: userData.id, // Przekazujemy ID użytkownika
      name: userData.firstName + " " + userData.lastName, // Możesz dodać inne dane, np. nazwę
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Randomowy kolor
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
