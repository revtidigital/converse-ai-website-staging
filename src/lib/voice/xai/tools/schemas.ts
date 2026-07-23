import type { JsonObject, JsonValue, XaiToolJsonSchema, XaiToolPropertySchema } from "./types";

export const MAX_TOOL_ARGUMENT_BYTES = 8_192;
export const MAX_TOOL_STRING_LENGTH = 1_000;

export interface ValidationResult {
  ok: boolean;
  value?: JsonObject;
  error?: string;
  code?: string;
}

export function parseToolArguments(input: string): ValidationResult {
  if (new TextEncoder().encode(input).byteLength > MAX_TOOL_ARGUMENT_BYTES) {
    return { ok: false, error: "Tool arguments are too large", code: "arguments_too_large" };
  }
  try {
    const parsed = JSON.parse(input) as JsonValue;
    if (!isPlainObject(parsed)) return { ok: false, error: "Tool arguments must be a JSON object", code: "invalid_arguments" };
    return { ok: true, value: parsed };
  } catch {
    return { ok: false, error: "Tool arguments are malformed JSON", code: "malformed_json" };
  }
}

export function validateToolArguments(schema: XaiToolJsonSchema, value: JsonObject): ValidationResult {
  const error = validateObject(schema, value, "arguments");
  if (error) return { ok: false, error, code: "schema_validation_failed" };
  return { ok: true, value };
}

function validateObject(schema: XaiToolJsonSchema, value: JsonObject, path: string): string | null {
  const properties = schema.properties ?? {};
  for (const required of schema.required ?? []) {
    if (!(required in value)) return `${path}.${required} is required`;
  }
  if (schema.additionalProperties === false) {
    for (const key of Object.keys(value)) {
      if (!(key in properties)) return `${path}.${key} is not allowed`;
    }
  }
  for (const [key, propertySchema] of Object.entries(properties)) {
    if (!(key in value)) continue;
    const error = validateProperty(propertySchema, value[key], `${path}.${key}`);
    if (error) return error;
  }
  return null;
}

function validateProperty(schema: XaiToolPropertySchema, value: JsonValue, path: string): string | null {
  if (schema.type === "object") {
    if (!isPlainObject(value)) return `${path} must be an object`;
    return validateObject(schema, value, path);
  }
  if (schema.type === "array") {
    if (!Array.isArray(value)) return `${path} must be an array`;
    if (schema.maxItems !== undefined && value.length > schema.maxItems) return `${path} has too many items`;
    for (let index = 0; index < value.length; index += 1) {
      const error = validateProperty(schema.items, value[index], `${path}[${index}]`);
      if (error) return error;
    }
    return null;
  }
  if (schema.type === "string") {
    if (typeof value !== "string") return `${path} must be a string`;
    const maxLength = Math.min(schema.maxLength ?? MAX_TOOL_STRING_LENGTH, MAX_TOOL_STRING_LENGTH);
    if (value.length > maxLength) return `${path} is too long`;
    if (schema.minLength !== undefined && value.length < schema.minLength) return `${path} is too short`;
    if (schema.enum && !schema.enum.includes(value)) return `${path} must be one of: ${schema.enum.join(", ")}`;
    return null;
  }
  if (schema.type === "number" || schema.type === "integer") {
    if (typeof value !== "number" || !Number.isFinite(value)) return `${path} must be a number`;
    if (schema.type === "integer" && !Number.isInteger(value)) return `${path} must be an integer`;
    if (schema.minimum !== undefined && value < schema.minimum) return `${path} is too small`;
    if (schema.maximum !== undefined && value > schema.maximum) return `${path} is too large`;
    return null;
  }
  if (schema.type === "boolean" && typeof value !== "boolean") return `${path} must be a boolean`;
  return null;
}

function isPlainObject(value: JsonValue): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
