import { Button } from "@/components/ui/button";
import { AlertCircle, AlignLeft, FileJson, Trash2 } from "lucide-react";
import { useRef } from "react";

interface JsonInputPanelProps {
  value: string;
  onChange: (v: string) => void;
  onFormat: () => void;
  onClear: () => void;
  onLoadSample: () => void;
  error: string | null;
  isValid: boolean;
  label?: string;
}

export default function JsonInputPanel({
  value,
  onChange,
  onFormat,
  onClear,
  onLoadSample,
  error,
  isValid,
  label = "Input",
}: JsonInputPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold tracking-widest text-muted-foreground uppercase">
            {label}
          </span>
          {value && (
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                isValid
                  ? "bg-green-500/15 text-green-600 dark:text-green-400"
                  : "bg-destructive/15 text-destructive"
              }`}
            >
              {isValid ? "valid" : "invalid"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadSample}
            data-ocid="load-sample-btn"
            className="h-7 text-xs gap-1.5 font-mono"
          >
            <FileJson size={12} />
            Sample
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onFormat}
            disabled={!value}
            data-ocid="format-btn"
            className="h-7 text-xs gap-1.5 font-mono"
          >
            <AlignLeft size={12} />
            Format
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            disabled={!value}
            data-ocid="clear-btn"
            className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-destructive"
          >
            <Trash2 size={12} />
            Clear
          </Button>
        </div>
      </div>

      {/* Textarea */}
      <div className="flex-1 relative min-h-0">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste raw JSON here..."
          spellCheck={false}
          data-ocid="json-input"
          className="w-full h-full resize-none bg-card font-mono text-sm text-foreground placeholder:text-muted-foreground/50 p-4 outline-none border-0 leading-relaxed"
        />
      </div>

      {/* Error */}
      {error && (
        <div
          className="flex items-start gap-2 px-4 py-2.5 border-t border-destructive/30 bg-destructive/5 shrink-0"
          data-ocid="json-error"
        >
          <AlertCircle size={14} className="text-destructive mt-0.5 shrink-0" />
          <span className="text-xs font-mono text-destructive leading-relaxed break-all">
            {error}
          </span>
        </div>
      )}
    </div>
  );
}
