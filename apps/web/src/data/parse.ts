/**
 * Checks for the JSON files in `src/content/`. Each takes `where`, the path to the value
 * (like `content/reading.json [0].items[2].url`), so a bad entry fails the build with a
 * message that points at it.
 */

export function fail(where: string, message: string): never {
  throw new Error(`${where}: ${message}`)
}

export function parseObject(value: unknown, where: string): Record<string, unknown> {
  if (value === undefined) fail(where, "is missing")
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(where, "must be an object")
  }
  return value as Record<string, unknown>
}

export function parseArray(value: unknown, where: string): unknown[] {
  if (!Array.isArray(value)) fail(where, "must be an array")
  return value
}

export function parseString(value: unknown, where: string): string {
  if (typeof value !== "string" || value.trim() === "") fail(where, "must be a non-empty string")
  return value
}

export function parseStringArray(value: unknown, where: string): string[] {
  return parseArray(value, where).map((item, i) => parseString(item, `${where}[${i}]`))
}

export function parseUrl(value: unknown, where: string): string {
  const url = parseString(value, where)
  if (!URL.canParse(url)) fail(where, `"${url}" is not a valid URL`)
  return url
}

export function parseOneOf<const T extends readonly string[]>(
  value: unknown,
  options: T,
  where: string,
): T[number] {
  if (!options.includes(value as string)) {
    fail(where, `must be one of ${options.join(", ")}, got ${JSON.stringify(value)}`)
  }
  return value as T[number]
}
