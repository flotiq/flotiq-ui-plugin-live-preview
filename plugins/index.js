import { registerFn } from "../common/plugin-element-cache";
import pluginInfo from "../plugin-manifest.json";
import { handlePanelPlugin } from "./sidebar-panel";
import cssString from "inline:./sidebar-panel/style/style.css";

registerFn(pluginInfo, (handler) => {
  let style = document.getElementById(`${pluginInfo.id}-styles`);
  if (!style) {
    style = document.createElement("style");
    style.id = `${pluginInfo.id}-styles`;
    document.head.appendChild(style);
  }
  style.textContent = cssString;

  handler.on("flotiq.form.sidebar-panel::add", (data) =>
    handlePanelPlugin(data, pluginInfo),
  );
});
