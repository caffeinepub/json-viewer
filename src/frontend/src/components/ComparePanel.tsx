import { Link } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { DiffResult } from "../types/diff";
import type { JsonValue } from "../types/json";
import { computeDiff } from "../utils/diff";
import JsonInputPanel from "./JsonInputPanel";
import JsonTreePanel from "./JsonTreePanel";

const SAMPLE_A = JSON.stringify(
  {
    name: "JSON::Forge",
    version: "1.0.0",
    active: true,
    score: 42,
    tags: ["viewer", "formatter", "tool"],
    author: { handle: "@hongfy", role: "developer" },
    config: { theme: "dark", autoFormat: true, maxDepth: null },
  },
  null,
  2,
);

const SAMPLE_B = JSON.stringify(
  {
    name: "JSON::Forge",
    version: "2.0.0",
    active: false,
    tags: ["viewer", "formatter", "diff", "tool"],
    author: { handle: "@hongfy", role: "lead" },
    config: { theme: "light", autoFormat: true },
    license: "MIT",
  },
  null,
  2,
);

function parseJson(raw: string): {
  value: JsonValue | null;
  error: string | null;
} {
  if (!raw.trim()) return { value: null, error: null };
  try {
    return { value: JSON.parse(raw) as JsonValue, error: null };
  } catch (e) {
    return {
      value: null,
      error: e instanceof Error ? e.message : "Invalid JSON",
    };
  }
}

function DiffSummary({ diff }: { diff: DiffResult }) {
  const total = diff.added + diff.removed + diff.changed;
  if (total === 0) {
    return (
      <div
        className="flex items-center gap-2 px-4 py-2 border-b border-border bg-accent/30 shrink-0"
        data-ocid="diff-summary"
      >
        <span className="text-xs font-mono text-accent-foreground font-semibold">
          ✓ Identical — no differences found
        </span>
      </div>
    );
  }
  return (
    <div
      className="flex items-center gap-4 px-4 py-2 border-b border-border bg-muted/40 shrink-0 flex-wrap"
      data-ocid="diff-summary"
    >
      <span className="text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">
        Diff
      </span>
      {diff.added > 0 && (
        <span className="flex items-center gap-1 text-xs font-mono">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
          <span className="text-green-700 dark:text-green-400 font-semibold">
            +{diff.added}
          </span>
          <span className="text-muted-foreground">added</span>
        </span>
      )}
      {diff.removed > 0 && (
        <span className="flex items-center gap-1 text-xs font-mono">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
          <span className="text-red-700 dark:text-red-400 font-semibold">
            -{diff.removed}
          </span>
          <span className="text-muted-foreground">removed</span>
        </span>
      )}
      {diff.changed > 0 && (
        <span className="flex items-center gap-1 text-xs font-mono">
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-500" />
          <span className="text-yellow-700 dark:text-yellow-400 font-semibold">
            ~{diff.changed}
          </span>
          <span className="text-muted-foreground">changed</span>
        </span>
      )}
    </div>
  );
}

type ShareStatus = "idle" | "copied" | "manual";

interface ComparePanelProps {
  initialInputs?: { a: string; b: string } | null;
  onShare?: (opts: { inputA: string; inputB: string }) => void;
  shareStatus?: ShareStatus;
}

export default function ComparePanel({
  initialInputs,
  onShare,
  shareStatus = "idle",
}: ComparePanelProps) {
  const [inputA, setInputA] = useState("");
  const [inputB, setInputB] = useState("");
  const [parsedA, setParsedA] = useState<JsonValue | null>(null);
  const [parsedB, setParsedB] = useState<JsonValue | null>(null);
  const [errorA, setErrorA] = useState<string | null>(null);
  const [errorB, setErrorB] = useState<string | null>(null);

  // Apply initial inputs from URL share state (run once on mount)
  useEffect(() => {
    if (!initialInputs) return;
    setInputA(initialInputs.a);
    setInputB(initialInputs.b);
  }, [initialInputs]);

  useEffect(() => {
    const { value, error } = parseJson(inputA);
    setParsedA(value);
    setErrorA(error);
  }, [inputA]);

  useEffect(() => {
    const { value, error } = parseJson(inputB);
    setParsedB(value);
    setErrorB(error);
  }, [inputB]);

  const diff = useMemo(() => computeDiff(parsedA, parsedB), [parsedA, parsedB]);

  const hasBothJson = parsedA !== null && parsedB !== null;

  const handleFormatA = useCallback(() => {
    const { value, error } = parseJson(inputA);
    if (!error && value !== null) setInputA(JSON.stringify(value, null, 2));
  }, [inputA]);

  const handleFormatB = useCallback(() => {
    const { value, error } = parseJson(inputB);
    if (!error && value !== null) setInputB(JSON.stringify(value, null, 2));
  }, [inputB]);

  const handleLoadSampleA = useCallback(() => setInputA(SAMPLE_A), []);
  const handleLoadSampleB = useCallback(() => setInputB(SAMPLE_B), []);
  const handleClearA = useCallback(() => {
    setInputA("");
    setParsedA(null);
    setErrorA(null);
  }, []);
  const handleClearB = useCallback(() => {
    setInputB("");
    setParsedB(null);
    setErrorB(null);
  }, []);

  const handleShareCompare = useCallback(() => {
    onShare?.({ inputA, inputB });
  }, [onShare, inputA, inputB]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Diff summary bar + share button row */}
      <div className="flex items-center shrink-0 border-b border-border bg-muted/40">
        <div className="flex-1 min-w-0">
          {hasBothJson && <DiffSummary diff={diff} />}
        </div>
        {onShare && (
          <div className="px-3 py-2 shrink-0">
            <button
              type="button"
              onClick={handleShareCompare}
              data-ocid="share-compare-btn"
              disabled={shareStatus === "copied"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-semibold border transition-smooth ${
                shareStatus === "copied"
                  ? "bg-accent/20 border-accent/40 text-accent-foreground cursor-default"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
              }`}
            >
              <Link size={13} />
              <span>{shareStatus === "copied" ? "Copied!" : "Share"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Two-column editors + trees */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Left column: JSON A */}
        <div className="flex flex-col w-full lg:w-1/2 lg:border-r border-border min-h-0 h-[50%] lg:h-auto">
          {/* Input A */}
          <div className="h-[45vh] lg:h-[45%] border-b border-border shrink-0 flex flex-col">
            <JsonInputPanel
              value={inputA}
              onChange={setInputA}
              onFormat={handleFormatA}
              onClear={handleClearA}
              onLoadSample={handleLoadSampleA}
              error={errorA}
              isValid={errorA === null && parsedA !== null}
              label="JSON A"
            />
          </div>
          {/* Tree A */}
          <div className="flex-1 min-h-0 bg-background">
            <JsonTreePanel
              parsedJson={parsedA}
              label="Tree A"
              diffPathMap={hasBothJson ? diff.pathMap : null}
            />
          </div>
        </div>

        {/* Right column: JSON B */}
        <div className="flex flex-col w-full lg:w-1/2 min-h-0 h-[50%] lg:h-auto">
          {/* Input B */}
          <div className="h-[45vh] lg:h-[45%] border-b border-border shrink-0 flex flex-col bg-card">
            <JsonInputPanel
              value={inputB}
              onChange={setInputB}
              onFormat={handleFormatB}
              onClear={handleClearB}
              onLoadSample={handleLoadSampleB}
              error={errorB}
              isValid={errorB === null && parsedB !== null}
              label="JSON B"
            />
          </div>
          {/* Tree B */}
          <div className="flex-1 min-h-0 bg-background">
            <JsonTreePanel
              parsedJson={parsedB}
              label="Tree B"
              diffPathMap={hasBothJson ? diff.pathMap : null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
