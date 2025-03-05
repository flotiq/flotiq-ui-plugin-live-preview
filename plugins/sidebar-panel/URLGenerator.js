/**
 * Read key value deep inside object
 * @param {string} key
 * @param {object} object
 * @returns {*} example: read 'object[0].key' from 'object: [{key: value}]
 */
const deepReadKeyValue = (key, object) => {
  return key
    .split(/[[.\]]/)
    .filter((kp) => !!kp)
    .reduce((nestedOptions, keyPart) => {
      return nestedOptions?.[keyPart];
    }, object);
};

export class URLGenerator {
  constructor(contentTypeName, objectId, config) {
    this.config = config;
    this.contentTypeName = contentTypeName;
    this.objectId = objectId;
  }

  getURL(object) {
    const baseURLInstance = new URL(
      `${this.config.base_url.replace(/\/+$/, "")}/api/flotiq/draft`,
    );
    baseURLInstance.searchParams.set("key", this.config.editor_key);

    let path = this.config.route_template.replace(
      /{(?<key>[^{}]+)}/g,
      (...params) => {
        const { key } = params[4];
        return deepReadKeyValue(key, object);
      },
    );

    path += path.includes("?") ? "&" : "?";
    path += `apiKey=${this.config.api_key}`;
    path += `&ctdName=${this.contentTypeName}`;
    path += `&id=${this.objectId || "add"}`;

    baseURLInstance.searchParams.set("draft", "true");
    baseURLInstance.searchParams.set("redirect", `/${path.replace(/^\//, "")}`);

    return baseURLInstance;
  }
}
