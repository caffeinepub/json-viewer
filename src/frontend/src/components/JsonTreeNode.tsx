import { Check, ChevronDown, ChevronRight, Copy } from "lucide-react";
import { useCallback, useState } from "react";
import type { DiffStatus } from "../types/diff";
import type { JsonArray, JsonObject, JsonValue } from "../types/json";
import { getValuePreview, getValueType } from "../types/json";
import { getDiffStatus } from "../utils/diff";

interface JsonTreeNodeProps {
  nodeKey: string | null;
  value: JsonValue;
  depth: number;
  defaultExpanded?: boolean;
  /** dot-notation path from root, used for diff lookups */
  path?: string;
  /** diff path map passed down from tree panel */
  diffPathMap?: Map<string, DiffStatus> | null;
}

function TypeBadge({ type }: { type: string }) {
  const badgeClass: Record<string, string> = {
    string: "bg-green-500/15 text-green-600 dark:text-green-400",
    number: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
    boolean: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    null: "bg-muted text-muted-foreground",
    object: "bg-primary/10 text-primary",
    array: "bg-primary/10 text-primary",
  };

  return (
    <span
      className={`inline-block px-1.5 py-0 text-[10px] font-mono rounded font-medium leading-5 shrink-0 ${badgeClass[type] ?? "bg-muted text-muted-foreground"}`}
    >
      {type}
    </span>
  );
}

function DiffBadge({ status }: { status: DiffStatus }) {
  const cls: Record<DiffStatus, string> = {
    added:
      "bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/30",
    removed:
      "bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/30",
    changed:
      "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border border-yellow-500/30",
    unchanged: "hidden",
  };
  const label: Record<DiffStatus, string> = {
    added: "+added",
    removed: "−removed",
    changed: "~changed",
    unchanged: "",
  };
  if (status === "unchanged") return null;
  return (
    <span
      className={`inline-block px-1.5 py-0 text-[10px] font-mono rounded font-semibold leading-5 shrink-0 ${cls[status]}`}
    >
      {label[status]}
    </span>
  );
}

function CopyButton({
  value,
  className = "",
}: {
  value: JsonValue;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const text =
        typeof value === "string"
          ? value
          : typeof value === "number" || typeof value === "boolean"
            ? String(value)
            : value === null
              ? "null"
              : JSON.stringify(value, null, 2);
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    },
    [value],
  );

  return (
    <button
      type="button"
      onClick={handleCopy}
      data-ocid="copy-node-btn"
      aria-label="Copy value"
      className={`copy-button rounded text-muted-foreground hover:text-foreground transition-colors ${className}`}
    >
      {copied ? (
        <Check size={12} className="text-green-500 dark:text-green-400" />
      ) : (
        <Copy size={12} />
      )}
    </button>
  );
}

function LeafNode({
  nodeKey,
  value,
  depth,
  diffStatus,
}: {
  nodeKey: string | null;
  value: string | number | boolean | null;
  depth: number;
  diffStatus?: DiffStatus | null;
}) {
  const type = getValueType(value);
  const colorClass: Record<string, string> = {
    string: "json-string",
    number: "json-number",
    boolean: "json-boolean",
    null: "json-null",
  };

  const rowHighlight =
    diffStatus === "added"
      ? "bg-green-500/8 hover:bg-green-500/12"
      : diffStatus === "removed"
        ? "bg-red-500/8 hover:bg-red-500/12"
        : diffStatus === "changed"
          ? "bg-yellow-500/8 hover:bg-yellow-500/12"
          : "hover:bg-muted/60";

  return (
    <div
      className={`group flex items-center gap-2 py-0.5 px-2 rounded transition-colors ${rowHighlight}`}
      style={{ paddingLeft: `${depth * 16 + 8}px` }}
      data-ocid="tree-leaf-row"
    >
      <span className="min-w-0 flex items-baseline gap-1.5 flex-1">
        {nodeKey !== null && (
          <span className="font-mono text-sm text-foreground/80 shrink-0">
            {nodeKey}
          </span>
        )}
        {nodeKey !== null && (
          <span className="text-muted-foreground text-sm shrink-0">:</span>
        )}
        <span
          className={`font-mono text-sm truncate ${colorClass[type] ?? ""}`}
        >
          {getValuePreview(value)}
        </span>
      </span>
      <TypeBadge type={type} />
      {diffStatus && diffStatus !== "unchanged" && (
        <DiffBadge status={diffStatus} />
      )}
      <CopyButton value={value} className="opacity-0 group-hover:opacity-100" />
    </div>
  );
}

export default function JsonTreeNode({
  nodeKey,
  value,
  depth,
  defaultExpanded = false,
  path = "",
  diffPathMap = null,
}: JsonTreeNodeProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const type = getValueType(value);

  const diffStatus =
    diffPathMap && path ? getDiffStatus(diffPathMap, path) : null;

  if (type !== "object" && type !== "array") {
    return (
      <LeafNode
        nodeKey={nodeKey}
        value={value as string | number | boolean | null}
        depth={depth}
        diffStatus={diffStatus}
      />
    );
  }

  const entries: [string, JsonValue][] =
    type === "array"
      ? (value as JsonArray).map((v, i) => [String(i), v])
      : Object.entries(value as JsonObject);

  const countLabel =
    type === "array" ? `[${entries.length}]` : `{${entries.length}}`;

  const rowHighlight =
    diffStatus === "added"
      ? "bg-green-500/8 hover:bg-green-500/12"
      : diffStatus === "removed"
        ? "bg-red-500/8 hover:bg-red-500/12"
        : diffStatus === "changed"
          ? "bg-yellow-500/8 hover:bg-yellow-500/12"
          : "hover:bg-muted/60";

  return (
    <div>
      <button
        type="button"
        className={`group w-full flex items-center gap-2 py-0.5 px-2 rounded transition-colors cursor-pointer select-none text-left ${rowHighlight}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => setExpanded((v) => !v)}
        data-ocid="tree-branch-row"
        aria-expanded={expanded}
      >
        <span className="text-muted-foreground shrink-0">
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        <span className="min-w-0 flex items-baseline gap-1.5 flex-1">
          {nodeKey !== null && (
            <span className="font-mono text-sm text-foreground/80 shrink-0">
              {nodeKey}
            </span>
          )}
          {nodeKey !== null && (
            <span className="text-muted-foreground text-sm shrink-0">:</span>
          )}
          <span className="font-mono text-sm text-muted-foreground">
            {countLabel}
          </span>
        </span>
        <TypeBadge type={type} />
        {diffStatus && diffStatus !== "unchanged" && (
          <DiffBadge status={diffStatus} />
        )}
        <CopyButton
          value={value}
          className="opacity-0 group-hover:opacity-100"
        />
      </button>

      {expanded && (
        <div>
          {entries.map(([k, v]) => {
            const childPath = path
              ? type === "array"
                ? `${path}[${k}]`
                : `${path}.${k}`
              : k;
            return (
              <JsonTreeNode
                key={k}
                nodeKey={k}
                value={v}
                depth={depth + 1}
                defaultExpanded={depth < 1}
                path={childPath}
                diffPathMap={diffPathMap}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
