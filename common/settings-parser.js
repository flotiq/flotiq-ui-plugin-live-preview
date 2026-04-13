export const getCtdSettings = (pluginSettings, contentTypeName) => {
  const parsedSettings = JSON.parse(pluginSettings || "{}");
  return parsedSettings.config
    ?.filter(
      (plugin) =>
        plugin.content_types.length === 0 ||
        plugin.content_types.find((ctd) => ctd === contentTypeName),
    )
    ?.map((config) => ({
      ...config,
      editor_key: parsedSettings.editor_key,
      base_url: parsedSettings.base_url,
      api_key: parsedSettings.api_key,
    }));
};

export const getGlobalSettings = (pluginSettings) => {
  const parsedSettings = JSON.parse(pluginSettings || "{}");
  return {
    editor_key: parsedSettings.editor_key,
    base_url: parsedSettings.base_url,
    api_key: parsedSettings.api_key,
  };
};
