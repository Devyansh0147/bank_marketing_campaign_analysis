import { createContext, useContext, useState, type ReactNode } from "react";
import type { Dataset } from "./analytics";

interface Ctx {
  dataset: Dataset | null;
  setDataset: (d: Dataset | null) => void;
  uploadOpen: boolean;
  setUploadOpen: (o: boolean) => void;
}

const DatasetContext = createContext<Ctx | null>(null);

export function DatasetProvider({ children }: { children: ReactNode }) {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
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
