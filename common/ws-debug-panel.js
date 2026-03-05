const openRoomPanels = new Set();
const DEBUG_STORAGE_KEY = "flotiq-live-preview-debug";
const DEBUG_STORAGE_POLL_MS = 400;
const FALSEY_DEBUG_VALUES = new Set([
  "",
  "0",
  "false",
  "off",
  "no",
  "null",
  "undefined",
]);

let lastUsedConnections = new Map();
let isDebugPanelMounted = false;
let debugPanel;
let debugSummary;
let debugSummaryLabel;
let debugContent;

function getDebugStorageValue() {
  const browserView = document.defaultView;

  try {
    return browserView?.sessionStorage?.getItem(DEBUG_STORAGE_KEY);
  } catch {
    return null;
  }
}

function isDebugPanelEnabled() {
  const debugValue = getDebugStorageValue();
  if (debugValue == null) return false;

  const normalizedValue = `${debugValue}`.trim().toLowerCase();
  return !FALSEY_DEBUG_VALUES.has(normalizedValue);
}

function clearDebugPanelElements() {
  if (!debugPanel) return;

  debugPanel.remove();
  debugPanel = null;
  debugSummary = null;
  debugSummaryLabel = null;
  debugContent = null;
}

function mountDebugPanel() {
  if (debugPanel) return;

  debugPanel = document.createElement("details");
  debugPanel.style.position = "fixed";
  debugPanel.style.bottom = "0";
  debugPanel.style.right = "20px";
  debugPanel.style.width = "360px";
  debugPanel.style.maxHeight = "60vh";
  debugPanel.style.overflow = "hidden";
  debugPanel.style.backgroundColor = "rgba(0,0,0,0.8)";
  debugPanel.style.color = "white";
  debugPanel.style.fontSize = "12px";
  debugPanel.style.zIndex = "9999";
  debugPanel.style.borderTopLeftRadius = "6px";
  debugPanel.style.borderTopRightRadius = "6px";

  debugSummary = document.createElement("summary");
  debugSummary.style.cursor = "pointer";
  debugSummary.style.padding = "8px";
  debugSummary.style.userSelect = "none";
  debugSummary.style.display = "flex";
  debugSummary.style.alignItems = "center";
  debugSummary.style.gap = "8px";

  debugSummaryLabel = document.createElement("span");
  debugSummaryLabel.textContent = "Websocket connections: 0";
  debugSummary.appendChild(debugSummaryLabel);

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.textContent = "✕";
  closeButton.setAttribute("aria-label", "Hide live preview debug panel");
  closeButton.style.marginLeft = "auto";
  closeButton.style.border = "1px solid rgba(255,255,255,0.4)";
  closeButton.style.background = "transparent";
  closeButton.style.color = "white";
  closeButton.style.cursor = "pointer";
  closeButton.style.lineHeight = "1";
  closeButton.style.padding = "2px 6px";
  closeButton.style.borderRadius = "4px";
  closeButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const browserView = document.defaultView;
    try {
      browserView?.sessionStorage?.setItem(DEBUG_STORAGE_KEY, "0");
    } catch {
      // Ignore storage write failures and still close the panel in UI.
    }

    clearDebugPanelElements();
    isDebugPanelMounted = false;
  });
  debugSummary.appendChild(closeButton);

  debugPanel.appendChild(debugSummary);

  debugContent = document.createElement("div");
  debugContent.style.padding = "8px";
  debugContent.style.maxHeight = "calc(60vh - 36px)";
  debugContent.style.overflowY = "auto";
  debugPanel.appendChild(debugContent);

  document.body.appendChild(debugPanel);
}

function unmountDebugPanel() {
  clearDebugPanelElements();
}

function syncDebugPanelMountState() {
  const shouldBeMounted = isDebugPanelEnabled();
  const hasChanged = shouldBeMounted !== isDebugPanelMounted;

  if (hasChanged) {
    if (shouldBeMounted) mountDebugPanel();
    else unmountDebugPanel();
    isDebugPanelMounted = shouldBeMounted;
  }

  return {
    isMounted: shouldBeMounted,
    hasChanged,
  };
}

function safeStringify(value) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "Unable to serialize data";
  }
}

function getYjsDocDebugData(doc) {
  const sharedTypes = {};

  doc.share.forEach((type, key) => {
    if (typeof type?.toJSON === "function") {
      sharedTypes[key] = type.toJSON();
      return;
    }

    sharedTypes[key] = {
      type: type?.constructor?.name || "UnknownType",
    };
  });

  return {
    guid: doc.guid,
    clientId: doc.clientID,
    collections: sharedTypes,
  };
}

function getAwarenessDebugData(ws) {
  return Array.from(ws.awareness.getStates().entries()).map(
    ([clientId, state]) => ({ clientId, state }),
  );
}

export function renderDebugPanel(connections) {
  if (connections) lastUsedConnections = connections;
  else connections = lastUsedConnections;

  const { isMounted } = syncDebugPanelMountState();
  if (!isMounted || !debugSummaryLabel || !debugContent) return;

  debugSummaryLabel.textContent = `Websocket connections: ${connections.size}`;
  debugContent.replaceChildren();

  if (!connections.size) {
    const noConnectionsInfo = document.createElement("div");
    noConnectionsInfo.textContent = "No active connections";
    debugContent.appendChild(noConnectionsInfo);
    return;
  }

  openRoomPanels.forEach((roomId) => {
    if (!connections.has(roomId)) {
      openRoomPanels.delete(roomId);
    }
  });

  connections.forEach(({ ws, doc }, roomId) => {
    const roomPanel = document.createElement("details");
    roomPanel.style.marginBottom = "6px";
    roomPanel.style.border = "1px solid rgba(255,255,255,0.2)";
    roomPanel.style.borderRadius = "4px";
    roomPanel.style.padding = "4px";

    if (openRoomPanels.has(roomId)) roomPanel.open = true;

    let roomDataPre;

    const updateRoomDataVisibility = () => {
      if (roomPanel.open) {
        openRoomPanels.add(roomId);

        if (!roomDataPre) {
          roomDataPre = document.createElement("pre");
          roomDataPre.style.margin = "6px 0 0 0";
          roomDataPre.style.whiteSpace = "pre-wrap";
          roomDataPre.style.wordBreak = "break-word";
          roomPanel.appendChild(roomDataPre);
        }

        const roomData = {
          yjs: getYjsDocDebugData(doc),
          awareness: getAwarenessDebugData(ws),
        };

        roomDataPre.textContent = safeStringify(roomData);
        return;
      }

      openRoomPanels.delete(roomId);
      if (roomDataPre) {
        roomDataPre.remove();
        roomDataPre = null;
      }
    };

    roomPanel.addEventListener("toggle", updateRoomDataVisibility);

    const roomSummary = document.createElement("summary");
    roomSummary.style.cursor = "pointer";
    roomSummary.style.userSelect = "none";
    roomSummary.textContent = `${roomId} (${ws.wsconnected ? "connected" : "disconnected"})`;
    roomPanel.appendChild(roomSummary);

    updateRoomDataVisibility();

    debugContent.appendChild(roomPanel);
  });
}

function onDebugStorageUpdate() {
  const { isMounted, hasChanged } = syncDebugPanelMountState();
  if (isMounted && hasChanged) {
    renderDebugPanel();
  }
}

const browserView = document.defaultView;

browserView?.addEventListener("storage", (event) => {
  if (event.storageArea !== browserView.sessionStorage) return;
  if (event.key !== DEBUG_STORAGE_KEY) return;
  onDebugStorageUpdate();
});

setInterval(onDebugStorageUpdate, DEBUG_STORAGE_POLL_MS);
