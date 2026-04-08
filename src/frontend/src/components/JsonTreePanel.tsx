import { Input } from "@/components/ui/input";
import { Search, TreePine } from "lucide-react";
import { useMemo, useState } from "react";
import type { DiffStatus } from "../types/diff";
import type { JsonArray, JsonObject, JsonValue } from "../types/json";
import { getValueType } from "../types/json";
import JsonTreeNode from "./JsonTreeNode";

interface JsonTreePanelProps {
  parsedJson: JsonValue | null;
  label?: string;
  diffPathMap?: Map<string, DiffStatus> | null;
}

function filterJson(value: JsonValue, query: string): JsonValue | null {
  if (!query) return value;
  const q = query.toLowerCase();

  const type = getValueType(value);
  if (type === "object") {
    const obj = value as JsonObject;
    const filtered: JsonObject = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k.toLowerCase().includes(q)) {
        filtered[k] = v;
      } else {
        const child = filterJson(v, q);
        if (child !== null) filtered[k] = child;
      }
    }
    return Object.keys(filtered).length > 0 ? filtered : null;
  }

  if (type === "array") {
    const arr = value as JsonArray;
    const filtered: JsonArray = [];
    for (const v of arr) {
      const child = filterJson(v, q);
      if (child !== null) filtered.push(child);
    }
    return filtered.length > 0 ? filtered : null;
  }

  if (typeof value === "string" && value.toLowerCase().includes(q))
    return value;
  return null;
}

export default function JsonTreePanel({
  parsedJson,
  label = "Tree View",
  diffPathMap = null,
}: JsonTreePanelProps) {
  const [search, setSearch] = useState("");

  const displayJson = useMemo(() => {
    if (!parsedJson) return null;
    if (!search.trim()) return parsedJson;
    return filterJson(parsedJson, search.trim());
  }, [parsedJson, search]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0 gap-3">
        <span className="text-xs font-mono font-semibold tracking-widest text-muted-foreground uppercase shrink-0">
          {label}
        </span>
        {parsedJson !== null && (
          <div className="relative flex-1 max-w-xs">
            <Search
              size={12}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search keys..."
              aria-label="Search keys"
              data-ocid="tree-search"
              className="h-7 pl-7 text-xs font-mono bg-background border-border"
            />
          </div>
        )}
      </div>

      {/* Tree content */}
      <div
        className="flex-1 overflow-y-auto min-h-0 py-2"
        data-ocid="tree-panel"
      >
        {parsedJson === null ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 px-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <TreePine size={22} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground/70">
                No JSON loaded
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Paste valid JSON in the input panel to see the tree view
              </p>
            </div>
          </div>
        ) : displayJson === null ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 px-8 text-center">
            <p className="text-sm text-muted-foreground">
              No keys match &ldquo;{search}&rdquo;
            </p>
          </div>
        ) : (
          <JsonTreeNode
            nodeKey={null}
            value={displayJson}
            depth={0}
            defaultExpanded={true}
            path=""
            diffPathMap={diffPathMap}
          />
        )}
      </div>
    </div>
  );
}
