const appRoots = {};

export const addElementToCache = (
  element,
  key,
  onAttach = null,
  onRemove = null,
) => {
  appRoots[key] = {
    element,
  };

  let detachTimeoutId;

  element.addEventListener("flotiq.attached", () => {
    if (detachTimeoutId) {
      clearTimeout(detachTimeoutId);
      detachTimeoutId = null;
    }
    onAttach?.();
  });

  element.addEventListener("flotiq.detached", () => {
    detachTimeoutId = setTimeout(() => {
      delete appRoots[key];
      onRemove?.();
    }, 50);
  });
};

export const getCachedElement = (key) => {
  return appRoots[key];
};

export const registerFn = (pluginInfo, callback) => {
  if (window.FlotiqPlugins?.add) {
    window.FlotiqPlugins.add(pluginInfo, callback);
    return;
  }
  if (!window.initFlotiqPlugins) window.initFlotiqPlugins = [];
  window.initFlotiqPlugins.push({ pluginInfo, callback });
};
