import * as Y from "yjs";
import diff from "fast-diff";
import { deepAssignKeyValue } from "./lib";

/** Convert a fast-diff result to a YJS delta. */
const diffToDelta = (diffResult) => {
  return diffResult
    .map(
      ([op, value]) =>
        ({
          [diff.INSERT]: { insert: value },
          [diff.EQUAL]: { retain: value.length },
          [diff.DELETE]: { delete: value.length },
        })[op],
    )
    .filter(Boolean);
};

export const updateObjectDoc = (
  fieldName,
  fieldValue,
  schema,
  valsMap,
  isArrayChanged,
) => {
  const parsedObject = {};
  deepAssignKeyValue(fieldName, fieldValue, parsedObject);
  deepAssignToDoc(parsedObject, valsMap, schema, isArrayChanged);
};

const applyToParent = (parentType, fieldName, value, isArray) => {
  if (isArray) {
    if (parentType.get(fieldName)) {
      parentType.delete(fieldName);
    }
    parentType.insert(fieldName, [value]);
  } else {
    parentType.set(fieldName, value);
  }
};

const updateParent = (parentType, schemaType, fieldName, value, isArray) => {
  let yType = null;
  if (schemaType === "array") yType = Y.Array;
  if (schemaType === "object") yType = Y.Map;
  if (schemaType === "string") yType = Y.Text;

  if (!yType) {
    applyToParent(parentType, fieldName, value, isArray);
    return null;
  }

  let yObject = parentType.get(fieldName, yType);

  if (!yObject) {
    yObject = new yType();
    applyToParent(parentType, fieldName, yObject, isArray);
  }

  return yObject;
};

export const deepAssignToDoc = (
  parsedObject,
  parentType,
  schema,
  shouldCheckArrayItems = false,
  isArray = false,
) => {
  Object.entries(parsedObject)
    .filter(([fieldName]) => (isArray && schema) || !!schema[fieldName])
    .forEach(([fieldName, value]) => {
      const fieldSchema = !isArray ? schema[fieldName] : schema;

      const yType = updateParent(
        parentType,
        fieldSchema.type,
        fieldName,
        value,
        isArray,
      );

      if (yType) {
        if (fieldSchema.type === "array") {
          if (shouldCheckArrayItems && value.length !== yType.length) {
            const lengthDiff = yType.length - value.length;
            yType.delete(yType.length - lengthDiff, lengthDiff);
          }

          deepAssignToDoc(value, yType, fieldSchema.items, true, true);
        } else if (fieldSchema.type === "object") {
          deepAssignToDoc(value, yType, fieldSchema.properties, true);
        } else {
          const delta = diffToDelta(diff(yType.toString(), value));
          yType.applyDelta(delta);
        }
      }
    });
};
