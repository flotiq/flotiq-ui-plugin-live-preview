/**
 * insert value into object under path referred by key
 * @param key e.g. subObject.subArray[0]
 * @param value
 * @param options target to insert into
 * @returns
 */
export const deepAssignKeyValue = (key, value, options) => {
  return key
    .split(/[[.\]]/)
    .filter((kp) => !!kp)
    .reduce((nestedOptions, keyPart, index, keysArray) => {
      if (!nestedOptions[keyPart]) {
        const isArray =
          index < keysArray.length - 1 && /^\d+$/.test(keysArray[index + 1]);

        if (!isArray) {
          nestedOptions[keyPart] = {};
        } else {
          nestedOptions[keyPart] = [];
        }
      }
      if (index >= keysArray.length - 1) {
        if (value === undefined) delete nestedOptions[keyPart];
        else nestedOptions[keyPart] = value;
      }
      return nestedOptions[keyPart];
    }, options);
};

/**
 * Read key value deep inside object
 * @param {string} key
 * @param {object} object
 * @returns {*} example: read 'object[0].key' from 'object: [{key: value}]
 */
export const deepReadKeyValue = (key, object) => {
  return key
    .split(/[[.\]]/)
    .filter((kp) => !!kp)
    .reduce((nestedOptions, keyPart) => {
      return nestedOptions?.[keyPart];
    }, object);
};
