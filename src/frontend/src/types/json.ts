export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray;

export interface JsonObject {
  [key: string]: JsonValue;
}

export type JsonArray = JsonValue[];

export type JsonValueType =
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "object"
  | "array";

export function getValueType(value: JsonValue): JsonValueType {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value as JsonValueType;
}

export function getValuePreview(value: JsonValue): string {
  if (value === null) return "null";
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return `[${value.length} items]`;
  return `{${Object.keys(value).length} keys}`;
}
