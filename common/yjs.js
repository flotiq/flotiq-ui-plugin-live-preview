import * as Y from "yjs";
import diff from "fast-diff";
import { deepAssignKeyValue } from "./lib";

const parseFieldPath = (fieldName) => {
  return fieldName.split(/[[.\]]/).filter((keyPart) => !!keyPart);
};

const isSameFieldPath = (currentPath, targetPath) => {
  if (!targetPath || currentPath.length !== targetPath.length) return false;

  return currentPath.every(
    (pathSegment, index) => pathSegment === targetPath[index],
  );
};

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
  const arrayChangePath = isArrayChanged ? parseFieldPath(fieldName) : null;

  deepAssignKeyValue(fieldName, fieldValue, parsedObject);
  valsMap.doc.transact(() => {
    deepAssignToDoc(parsedObject, valsMap, schema, arrayChangePath);
  });
};

const applyToParent = (parentType, fieldName, value, isArray) => {
  if (isArray) {
    const index = +fieldName;
    if (index < parentType.length) {
      parentType.delete(index);
      parentType.insert(index, [value]);
    } else {
      parentType.insert(index, [value]);
    }
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
  arrayChangePath = null,
  isArray = false,
  currentPath = [],
) => {
  Object.entries(parsedObject)
    .filter(([fieldName]) => (isArray && schema) || !!schema[fieldName])
    .forEach(([fieldName, value]) => {
      const fieldSchema = !isArray ? schema[fieldName] : schema;
      const nextPath = currentPath.concat(fieldName);

      const yType = updateParent(
        parentType,
        fieldSchema.type,
        fieldName,
        value,
        isArray,
      );

      if (yType) {
        if (fieldSchema.type === "array") {
          yType.doc.transact(() => {
            if (
              isSameFieldPath(nextPath, arrayChangePath) &&
              yType.length > value.length
            ) {
              yType.delete(value.length, yType.length - value.length);
            }
            deepAssignToDoc(
              value,
              yType,
              fieldSchema.items,
              arrayChangePath,
              true,
              nextPath,
            );
          });
        } else if (fieldSchema.type === "object") {
          deepAssignToDoc(
            value,
            yType,
            fieldSchema.properties,
            arrayChangePath,
            false,
            nextPath,
          );
        } else {
          const delta = diffToDelta(diff(yType.toString(), value));
          yType.applyDelta(delta);
        }
      }
    });
};
