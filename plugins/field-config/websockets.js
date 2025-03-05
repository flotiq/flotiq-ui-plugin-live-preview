import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";

const WEBSOCKET_ENDPOINT = "ws://localhost:1234";

// Global websocket connection cache
const connections = new Map();

export function getWebSocketConnection(apiKey, ctdName, id) {
  const roomId = `${ctdName}/${id || "add"}`;

  if (!connections.has(roomId)) {
    const ydoc = new Y.Doc();
    const ws = new WebsocketProvider(WEBSOCKET_ENDPOINT, roomId, ydoc, {
      params: { apiKey, ctdName },
      connect: true,
    });

    connections.set(roomId, { ws, doc: ydoc });

    ws.on("connection-close", () => {
      ydoc.getMap("vals").clear();
      connections.delete(roomId);
    });

    const userData = JSON.parse(window.localStorage["cms.user"]).data;

    // Ustawiamy awareness dla użytkownika
    ws.awareness.setLocalState({
      userId: userData.id, // Przekazujemy ID użytkownika
      name: userData.firstName + " " + userData.lastName, // Możesz dodać inne dane, np. nazwę
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Randomowy kolor
    });
  }

  return connections.get(roomId);
}
