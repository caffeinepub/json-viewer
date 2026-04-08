import { Braces, GitCompare, Link, Moon, ScanSearch, Sun } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ComparePanel from "../components/ComparePanel";
import JsonInputPanel from "../components/JsonInputPanel";
import JsonTreePanel from "../components/JsonTreePanel";
import { useTheme } from "../hooks/useTheme";
import type { JsonValue } from "../types/json";
import { decodeShareState, encodeShareState } from "../utils/share";

const SAMPLE_JSON = JSON.stringify(
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

type ViewMode = "single" | "compare";
type ShareStatus = "idle" | "copied" | "manual";

export default function JsonViewerPage() {
  const { isDark, toggleTheme } = useTheme();
  const [mode, setMode] = useState<ViewMode>("single");
  const [input, setInput] = useState<string>("");
  const [parsedJson, setParsedJson] = useState<JsonValue | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<ShareStatus>("idle");
  const [manualUrl, setManualUrl] = useState<string>("");
  const [compareInputs, setCompareInputs] = useState<{
    a: string;
    b: string;
  } | null>(null);
  const manualInputRef = useRef<HTMLInputElement>(null);
  const shareTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On mount: read URL params and auto-populate
  useEffect(() => {
    const state = decodeShareState();
    if (!state) return;

    if (state.mode === "single") {
      setMode("single");
      setInput(state.json);
    } else if (state.mode === "compare") {
      setMode("compare");
      setCompareInputs({ a: state.a, b: state.b });
    }
  }, []);

  useEffect(() => {
    const { value, error } = parseJson(input);
    setParsedJson(value);
    setParseError(error);
  }, [input]);

  // Focus the manual URL input when it appears
  useEffect(() => {
    if (shareStatus === "manual" && manualInputRef.current) {
      manualInputRef.current.focus();
      manualInputRef.current.select();
    }
  }, [shareStatus]);

  const handleFormat = useCallback(() => {
    const { value, error } = parseJson(input);
    if (!error && value !== null) {
      setInput(JSON.stringify(value, null, 2));
    }
  }, [input]);

  const handleClear = useCallback(() => {
    setInput("");
    setParsedJson(null);
    setParseError(null);
  }, []);

  const handleLoadSample = useCallback(() => {
    setInput(SAMPLE_JSON);
  }, []);

  const handleShare = useCallback(
    (opts?: { inputA?: string; inputB?: string }) => {
      let url: string;

      if (mode === "single") {
        url = encodeShareState({ mode: "single", json: input });
      } else {
        url = encodeShareState({
          mode: "compare",
          a: opts?.inputA ?? "",
          b: opts?.inputB ?? "",
        });
      }

      if (shareTimerRef.current) clearTimeout(shareTimerRef.current);

      if (navigator.clipboard?.writeText) {
        navigator.clipboard
          .writeText(url)
          .then(() => {
            setShareStatus("copied");
            shareTimerRef.current = setTimeout(
              () => setShareStatus("idle"),
              2000,
            );
          })
          .catch(() => {
            setManualUrl(url);
            setShareStatus("manual");
          });
      } else {
        setManualUrl(url);
        setShareStatus("manual");
      }
    },
    [mode, input],
  );

  const isValid = parseError === null && parsedJson !== null;

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* App Header */}
      <header className="bg-card border-b border-border shrink-0 px-5 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0">
            <Braces size={15} className="text-primary-foreground" />
          </div>
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="font-display font-bold text-lg tracking-tight text-foreground">
              JSON<span className="text-primary">::</span>Forge
            </span>
            <span className="hidden sm:inline-block text-xs text-muted-foreground font-body truncate">
              Interactive JSON viewer &amp; formatter
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Mode toggle */}
          <fieldset
            className="flex items-center gap-1 bg-muted rounded-lg border-0 m-0 p-1"
            data-ocid="mode-toggle"
          >
            <legend className="sr-only">View mode</legend>
            <button
              type="button"
              onClick={() => setMode("single")}
              data-ocid="mode-single-btn"
              aria-pressed={mode === "single"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-smooth ${
                mode === "single"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ScanSearch size={13} />
              <span className="hidden sm:inline">Single</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("compare")}
              data-ocid="mode-compare-btn"
              aria-pressed={mode === "compare"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-smooth ${
                mode === "compare"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <GitCompare size={13} />
              <span className="hidden sm:inline">Compare</span>
            </button>
          </fieldset>

          {/* Share button */}
          {mode === "single" && (
            <button
              type="button"
              onClick={() => handleShare()}
              data-ocid="share-btn"
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
          )}

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            data-ocid="theme-toggle-btn"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="w-8 h-8 flex items-center justify-center rounded-md bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-smooth shrink-0"
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </header>

      {/* Manual copy fallback */}
      {shareStatus === "manual" && (
        <div className="bg-muted/60 border-b border-border px-5 py-2 flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground font-mono shrink-0">
            Copy link:
          </span>
          <input
            ref={manualInputRef}
            type="text"
            readOnly
            value={manualUrl}
            data-ocid="share-url-input"
            className="flex-1 min-w-0 text-xs font-mono bg-card border border-border rounded px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button
            type="button"
            onClick={() => setShareStatus("idle")}
            className="text-xs text-muted-foreground hover:text-foreground transition-smooth shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {mode === "single" ? (
          <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
            {/* Left: Input Panel (40%) */}
            <section className="flex flex-col w-full md:w-[40%] md:border-r border-b md:border-b-0 border-border bg-card min-h-0 h-[45vh] md:h-auto">
              <JsonInputPanel
                value={input}
                onChange={setInput}
                onFormat={handleFormat}
                onClear={handleClear}
                onLoadSample={handleLoadSample}
                error={parseError}
                isValid={isValid}
              />
            </section>

            {/* Right: Tree Panel (60%) */}
            <section className="flex flex-col flex-1 bg-background min-h-0 h-[55vh] md:h-auto">
              <JsonTreePanel parsedJson={parsedJson} />
            </section>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-hidden">
            <ComparePanel
              initialInputs={compareInputs}
              onShare={handleShare}
              shareStatus={shareStatus}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border px-5 py-2 shrink-0 flex items-center justify-center">
        <p className="text-[11px] text-muted-foreground">
          &copy; {new Date().getFullYear()}. Built with love by{" "}
          <span className="text-primary font-medium">@hongfy</span>
        </p>
      </footer>
    </div>
  );
}
