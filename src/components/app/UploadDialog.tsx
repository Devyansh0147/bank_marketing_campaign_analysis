import { useRef, useState } from "react";
import { FileSpreadsheet, Loader2, AlertCircle, CheckCircle2, FlaskConical, UploadCloud } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDataset } from "@/lib/dataset-store";
import { makeDemoDataset, parseCsv, type Dataset } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const MAX_MB = 25;

export function UploadDialog() {
  const { uploadOpen, setUploadOpen, setDataset } = useDataset();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Dataset | null>(null);
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const reset = () => {
    setError(null);
    setPreview(null);
    setLoading(false);
  };

  const handleFile = async (file: File) => {
    reset();
    if (!file.name.toLowerCase().endsWith(".csv")) return setError("Please choose a .csv file.");
    if (file.size > MAX_MB * 1024 * 1024) return setError(`File is larger than ${MAX_MB} MB.`);
    setLoading(true);
    const text = await file.text();
    await new Promise((r) => setTimeout(r, 50));
    const res = parseCsv(text, file.name);
    setLoading(false);
    if (!res.ok) return setError(res.error!);
    setPreview(res.dataset!);
  };

  const confirm = (d: Dataset) => {
    setDataset(d);
    setUploadOpen(false);
    reset();
  };

  return (
    <Dialog open={uploadOpen} onOpenChange={(o) => { setUploadOpen(o); if (!o) reset(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Load campaign data</DialogTitle>
          <DialogDescription>
            CSV with a header row and an outcome column (<code>y</code> or <code>deposit</code>, yes/no). Comma or semicolon separated. Processed locally in your browser.
          </DialogDescription>
        </DialogHeader>

        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          className={cn(
            "flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
            drag ? "border-primary bg-accent" : "border-border bg-muted/40",
          )}
        >
          {loading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          ) : (
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
          )}
          <p className="mt-3 text-sm font-medium">{loading ? "Parsing file…" : "Drag a CSV here"}</p>
          <Button variant="outline" size="sm" className="mt-3" disabled={loading} onClick={() => input.current?.click()}>
            Browse files
          </Button>
          <input
            ref={input}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
          />
        </div>

        {error && (
          <div role="alert" className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {preview && (
          <div className="space-y-3 rounded-lg border bg-card p-4">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{preview.name}</div>
                <div className="text-xs text-muted-foreground">
                  {preview.rows.length.toLocaleString()} rows · {preview.columns.length} columns
                </div>
              </div>
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-wrap gap-1">
              {preview.columns.slice(0, 18).map((c) => (
                <span key={c} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">{c}</span>
              ))}
            </div>
            {preview.warnings.map((w) => (
              <p key={w} className="text-xs text-warning-foreground">⚠ {w}</p>
            ))}
            <Button className="w-full" onClick={() => confirm(preview)}>Use this dataset</Button>
          </div>
        )}

        <div className="flex items-center gap-3 rounded-lg border border-warning bg-warning-soft p-3">
          <FlaskConical className="h-5 w-5 shrink-0 text-warning-foreground" />
          <div className="flex-1 text-xs text-warning-foreground">
            <strong>No file?</strong> Load 1,500 synthetic records to explore the interface. Results are not real.
          </div>
          <Button size="sm" variant="outline" onClick={() => confirm(makeDemoDataset())}>Load demo</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
