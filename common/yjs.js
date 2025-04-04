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

export const updateObjectDoc = (fieldName, fieldValue, schema, objectDoc) => {
  const parsedObject = {};
  deepAssignKeyValue(fieldName, fieldValue, parsedObject);
  deepAssignToDoc(parsedObject, objectDoc.getMap("vals"), schema);
};

const applyToParent = (parentType, sharedType, fieldName, isArrayIndex) => {
  if (isArrayIndex) {
    parentType.insert(fieldName, [sharedType]);
  } else {
    parentType.set(fieldName, sharedType);
  }
};

export const deepAssignToDoc = (
  parsedObject,
  parentType,
  schema,
  isArrayIndex,
) => {
  Object.entries(parsedObject)
    .filter(
      ([fieldName]) =>
        /**
         * @todo
         * Due to no hydration in middleware, we need to omit the relations.
         * Remove the condition "!schema[fieldName].items?.$ref" when hydration is available
         */
        isArrayIndex || (!!schema[fieldName] && !schema[fieldName].items?.$ref),
    )
    .forEach(([fieldName, value]) => {
      const fieldSchema = isArrayIndex ? schema : schema[fieldName];

      if (["array", "object"].includes(fieldSchema.type) || isArrayIndex) {
        const isArray = fieldSchema.type === "array";
        let yType = parentType.get(fieldName, isArray ? Y.Array : Y.Map);

        if (!yType) {
          yType = isArray ? new Y.Array() : new Y.Map();
          applyToParent(parentType, yType, fieldName, isArrayIndex);
        }

        if (isArray && !isArrayIndex && value.length !== yType.length) {
          const lengthDiff = yType.length - value.length;
          yType.delete(yType.length - lengthDiff, lengthDiff);
        }

        return deepAssignToDoc(
          value,
          yType,
          isArrayIndex
            ? fieldSchema
            : fieldSchema.items?.properties || fieldSchema.properties,
          fieldSchema.type === "array" && !isArrayIndex,
        );
      }

      if (fieldSchema.type === "string") {
        let ytext = parentType.get(fieldName, Y.Text);
        if (!ytext) {
          ytext = new Y.Text();
          applyToParent(parentType, ytext, fieldName, isArrayIndex);
        }
        const delta = diffToDelta(diff(ytext.toString(), value));
        ytext.applyDelta(delta);
      } else {
        applyToParent(parentType, value, fieldName, isArrayIndex);
      }
    });
};
