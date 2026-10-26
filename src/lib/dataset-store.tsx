import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { makeDemoDataset, type Dataset } from "./analytics";

interface Ctx {
  dataset: Dataset | null;
  setDataset: (d: Dataset | null) => void;
  uploadOpen: boolean;
  setUploadOpen: (o: boolean) => void;
}

const DatasetContext = createContext<Ctx | null>(null);
const KEY = "campaignlens:dataset";

// Persist the loaded dataset for this browser tab so it survives page reloads
// and direct navigation to any section (previously it lived only in memory).
function save(d: Dataset | null) {
  try {
    if (!d) return sessionStorage.removeItem(KEY);
    // Demo data is deterministic: store a marker instead of 1,500 rows.
    const payload = d.source === "demo" ? { source: "demo" } : d;
    sessionStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // Quota exceeded (very large file): keep it in memory only for this session.
    sessionStorage.removeItem(KEY);
  }
}

function load(): Dataset | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    if (v?.source === "demo") return makeDemoDataset();
    if (Array.isArray(v?.rows) && Array.isArray(v?.columns)) return v as Dataset;
  } catch {
    /* corrupted entry: ignore */
  }
  return null;
}

export function DatasetProvider({ children }: { children: ReactNode }) {
  const [dataset, setState] = useState<Dataset | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    const restored = load();
    if (restored) setState(restored);
  }, []);

  const setDataset = (d: Dataset | null) => {
    setState(d);
    save(d);
  };

  return (
    <DatasetContext.Provider value={{ dataset, setDataset, uploadOpen, setUploadOpen }}>
      {children}
    </DatasetContext.Provider>
  );
}

export function useDataset() {
  const c = useContext(DatasetContext);
  if (!c) throw new Error("useDataset must be inside DatasetProvider");
  return c;
}
