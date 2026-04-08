export type DiffStatus = "added" | "removed" | "changed" | "unchanged";

export interface DiffResult {
  added: number;
  removed: number;
  changed: number;
  /** Flat map of dot-notation path → diff status (excludes "unchanged") */
  pathMap: Map<string, DiffStatus>;
}
