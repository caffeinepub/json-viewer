import type { DiffResult, DiffStatus } from "../types/diff";
import type { JsonValue } from "../types/json";

function deepEqual(a: JsonValue, b: JsonValue): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object") return false;
  const aArr = Array.isArray(a);
  const bArr = Array.isArray(b);
  if (aArr !== bArr) return false;
  if (aArr && bArr) {
    const aa = a as JsonValue[];
    const ba = b as JsonValue[];
    if (aa.length !== ba.length) return false;
    return aa.every((v, i) => deepEqual(v, ba[i]));
  }
  const ao = a as Record<string, JsonValue>;
  const bo = b as Record<string, JsonValue>;
  const aKeys = Object.keys(ao);
  const bKeys = Object.keys(bo);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((k) => k in bo && deepEqual(ao[k], bo[k]));
}

function walk(
  aVal: JsonValue | undefined,
  bVal: JsonValue | undefined,
  path: string,
  pathMap: Map<string, DiffStatus>,
  counts: { added: number; removed: number; changed: number },
) {
  const aUndef = aVal === undefined;
  const bUndef = bVal === undefined;

  if (aUndef && !bUndef) {
    pathMap.set(path, "added");
    counts.added++;
    return;
  }
  if (!aUndef && bUndef) {
    pathMap.set(path, "removed");
    counts.removed++;
    return;
  }
  if (aUndef || bUndef) return;

  // Both exist
  const a = aVal as JsonValue;
  const b = bVal as JsonValue;

  const aIsObj = a !== null && typeof a === "object" && !Array.isArray(a);
  const bIsObj = b !== null && typeof b === "object" && !Array.isArray(b);
  const aIsArr = Array.isArray(a);
  const bIsArr = Array.isArray(b);

  if (aIsObj && bIsObj) {
    const ao = a as Record<string, JsonValue>;
    const bo = b as Record<string, JsonValue>;
    const allKeys = new Set([...Object.keys(ao), ...Object.keys(bo)]);
    for (const k of allKeys) {
      walk(ao[k], bo[k], path ? `${path}.${k}` : k, pathMap, counts);
    }
    return;
  }

  if (aIsArr && bIsArr) {
    const aa = a as JsonValue[];
    const ba = b as JsonValue[];
    const len = Math.max(aa.length, ba.length);
    for (let i = 0; i < len; i++) {
      walk(aa[i], ba[i], `${path}[${i}]`, pathMap, counts);
    }
    return;
  }

  // Leaf or type mismatch
  if (!deepEqual(a, b)) {
    pathMap.set(path, "changed");
    counts.changed++;
  }
}

export function computeDiff(
  jsonA: JsonValue | null,
  jsonB: JsonValue | null,
): DiffResult {
  const pathMap = new Map<string, DiffStatus>();
  const counts = { added: 0, removed: 0, changed: 0 };

  if (jsonA !== null && jsonB !== null) {
    walk(jsonA, jsonB, "", pathMap, counts);
  }

  return { ...counts, pathMap };
}

/** Given a nodeKey path built from depth traversal, return the diff status */
export function getDiffStatus(
  pathMap: Map<string, DiffStatus>,
  path: string,
): DiffStatus | null {
  // Exact match
  const exact = pathMap.get(path);
  if (exact) return exact;

  // Check if any child has a diff — mark parent as "changed"
  for (const [k] of pathMap) {
    if (k.startsWith(`${path}.`) || k.startsWith(`${path}[`)) {
      return "changed";
    }
  }

  return null;
}
