/**
 * Generate checksum for given strings
 * @param {string[]} args
 * @returns {number} checksum
 */
export const strToChecksum = (...args) => {
  let hash = 0,
    i,
    chr,
    len;
  const text = args.join("-");
  if (text.length === 0) return hash;
  for (i = 0, len = text.length; i < len; i++) {
    chr = text.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

export const getUserColor = (userId, light = false) => {
  const randomHue = strToChecksum(userId, "hue") % 360;
  const randomSaturation = strToChecksum(userId, "saturation") % 100;
  return `hsl(${randomHue} ${randomSaturation}% ${light ? "80%" : "30%"}`;
};
