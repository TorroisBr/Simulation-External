import {
  validateWorldExchange as validateWithSchema,
  type ValidationIssue,
  type ValidationResult,
  type WorldExchange,
} from "@simulation-external/world-schema";

export type { ValidationIssue, ValidationResult, WorldExchange };

export class WorldExchangeParseError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "WorldExchangeParseError";
  }
}

export class WorldExchangeValidationError extends Error {
  readonly issues: ValidationIssue[];

  constructor(issues: ValidationIssue[]) {
    const detail = issues
      .map(({ path, code, message }) => `${path} [${code}]: ${message}`)
      .join("\n");
    super(`World Exchange validation failed:\n${detail}`);
    this.name = "WorldExchangeValidationError";
    this.issues = issues;
  }
}

export class WorldExchangeSerializationError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "WorldExchangeSerializationError";
  }
}

/** Validate an unknown value using the canonical World Exchange schema. */
export function validateWorldExchange(input: unknown): ValidationResult {
  return validateWithSchema(input);
}

/**
 * Decode UTF-8 JSON bytes or parse an already-decoded JSON string, then apply
 * the canonical World Exchange v1 validation without repairing the document.
 */
export function parseWorldExchange(
  input: string | Uint8Array | ArrayBuffer,
): WorldExchange {
  let json: string;
  try {
    json =
      typeof input === "string"
        ? input
        : new TextDecoder("utf-8", { fatal: true }).decode(input);
  } catch (error) {
    throw new WorldExchangeParseError(
      "World Exchange file is not valid UTF-8.",
      { cause: error },
    );
  }

  let document: unknown;
  try {
    document = JSON.parse(json) as unknown;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new WorldExchangeParseError(
      `Invalid World Exchange JSON: ${detail}`,
      {
        cause: error,
      },
    );
  }

  const result = validateWorldExchange(document);
  if (!result.valid) throw new WorldExchangeValidationError(result.issues);
  return result.value;
}

/**
 * Serialize a valid exchange as UTF-8-ready JSON. Object keys are sorted
 * recursively; arrays retain their supplied order because their order may be
 * meaningful to a source or consumer. Output uses two-space indentation and a
 * trailing newline.
 */
export function serializeWorldExchange(input: unknown): string {
  const validation = validateWorldExchange(input);
  if (!validation.valid)
    throw new WorldExchangeValidationError(validation.issues);

  try {
    const json = JSON.stringify(sortObjectKeys(validation.value), null, 2);
    if (json === undefined) {
      throw new TypeError("World Exchange did not serialize to a JSON object.");
    }
    return `${json}\n`;
  } catch (error) {
    if (error instanceof WorldExchangeSerializationError) throw error;
    const detail = error instanceof Error ? error.message : String(error);
    throw new WorldExchangeSerializationError(
      `World Exchange serialization failed: ${detail}`,
      { cause: error },
    );
  }
}

function sortObjectKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortObjectKeys);
  if (value === null || typeof value !== "object") return value;

  const record = value as Record<string, unknown>;
  const sorted = Object.create(null) as Record<string, unknown>;
  for (const key of Object.keys(record).sort()) {
    sorted[key] = sortObjectKeys(record[key]);
  }
  return sorted;
}
