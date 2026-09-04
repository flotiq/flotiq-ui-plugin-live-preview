import i18n from "../../i18n";

import warningIcon from "inline:../../images/warning-icon.svg";

const createPermissionWarning = () => {
  const permissionWarning = document.createElement("div");
  permissionWarning.className = "plugin-live-preview__permission-warning";
  permissionWarning.setAttribute("role", "alert");
  permissionWarning.innerHTML = /*html*/ `
    ${warningIcon}
    <div class="plugin-live-preview__permission-warning__content">
      <strong>${i18n.t("LivePreviewUnavailable")}</strong>
      <p>${i18n.t("LivePreviewPermissionDenied")}</p>
    </div>
  `;

  return permissionWarning;
};

async function getLocalNetworkPermissionStatuses() {
  if (!navigator.permissions?.query) return [];

  const statuses = [];

  for (const permissionName of [
    "loopback-network",
    "local-network",
    "local-network-access",
  ]) {
    try {
      statuses.push(
        await navigator.permissions.query({ name: permissionName }),
      );
    } catch {
      continue;
    }
  }

  return statuses;
}

const getPermissionState = (permissionStatuses) => {
  if (permissionStatuses.some(({ state }) => state === "denied")) {
    return "denied";
  }

  if (permissionStatuses.some(({ state }) => state === "granted")) {
    return "granted";
  }

  return permissionStatuses.length ? "prompt" : "unknown";
};

const isLocalPreviewUrl = (previewUrl) => {
  try {
    const { hostname } = new URL(previewUrl);

    return ["localhost", "127.0.0.1", "[::1]", "::1"].includes(hostname);
  } catch {
    return false;
  }
};

export const watchLocalNetworkPermission = (panelElement, iframe, previewUrl) => {
  if (!isLocalPreviewUrl(previewUrl)) return () => {};

  let isCleanedUp = false;
  let permissionStatuses = [];
  let permissionWarning;

  const updatePermissionState = () => {
    if (isCleanedUp) return;

    const state = getPermissionState(permissionStatuses);
    const isDenied = state === "denied";

    if (isDenied && !permissionWarning) {
      permissionWarning = createPermissionWarning();
      panelElement.appendChild(permissionWarning);
    }

    if (!isDenied && permissionWarning) {
      permissionWarning.remove();
      permissionWarning = undefined;
    }

    iframe.hidden = isDenied;
  };

  getLocalNetworkPermissionStatuses().then((statuses) => {
    if (!statuses.length || isCleanedUp) return;

    permissionStatuses = statuses;

    permissionStatuses.forEach((permissionStatus) => {
      permissionStatus.addEventListener("change", updatePermissionState);
    });
    updatePermissionState();
  });

  return () => {
    isCleanedUp = true;
    permissionStatuses.forEach((permissionStatus) => {
      permissionStatus.removeEventListener("change", updatePermissionState);
    });
    permissionWarning?.remove();
  };
};
