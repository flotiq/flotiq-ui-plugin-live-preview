import { getSchema } from "./form-schema";

let configCache = null;

export const handleManagePlugin = ({ contentTypes, modalInstance }) => {
  if (configCache) return configCache;

  const ctds = (contentTypes || [])
    .filter((ctd) => !ctd.internal || ctd.name === "_media")
    .map(({ name, label }) => ({ value: name, label }));

  configCache = {};

  configCache.schema = getSchema(ctds);
  modalInstance.promise.then(() => (configCache = null));

  return configCache;
};
