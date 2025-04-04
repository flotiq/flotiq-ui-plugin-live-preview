import { deepReadKeyValue } from "../../common/lib";

export class URLGenerator {
  constructor(config, spaceId) {
    this.config = config;
    this.spaceId = spaceId;
  }

  getURL(object) {
    const baseURLInstance = new URL(
      `${this.config.base_url.replace(/\/+$/, "")}/api/flotiq/live-preview`,
    );
    baseURLInstance.searchParams.set("key", this.config.editor_key);
    baseURLInstance.searchParams.set("apiKey", this.config.api_key);
    baseURLInstance.searchParams.set("spaceId", this.spaceId);
    baseURLInstance.searchParams.set("objectId", object.id);
    baseURLInstance.searchParams.set(
      "contentType",
      object.internal?.contentType,
    );

    const path = this.config.route_template.replace(
      /{(?<key>[^{}]+)}/g,
      (...params) => {
        const { key } = params[4];
        return deepReadKeyValue(key, object);
      },
    );

    baseURLInstance.searchParams.set("live-preview", "true");
    baseURLInstance.searchParams.set("redirect", `/${path.replace(/^\//, "")}`);

    return baseURLInstance;
  }
}
