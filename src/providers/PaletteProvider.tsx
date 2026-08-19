"use client";

import * as React from "react";
import {
  DEFAULT_PALETTE,
  PALETTE_STORAGE_KEY,
  type PaletteId,
  isPaletteId,
} from "@/lib/palettes";

type PaletteContextValue = {
  palette: PaletteId;
  setPalette: (palette: PaletteId) => void;
};

const PaletteContext = React.createContext<PaletteContextValue | null>(null);

/** Inline, blocking script so the stored palette applies before first paint (avoids a flash of the default palette). */
export const PALETTE_ANTI_FLASH_SCRIPT = `try{var p=localStorage.getItem('${PALETTE_STORAGE_KEY}');document.documentElement.setAttribute('data-palette',p||'${DEFAULT_PALETTE}');}catch(e){}`;

export function PaletteProvider({ children }: { children: React.ReactNode }) {
  const [palette, setPaletteState] = React.useState<PaletteId>(DEFAULT_PALETTE);

  React.useEffect(() => {
    const stored = window.localStorage.getItem(PALETTE_STORAGE_KEY);
    if (isPaletteId(stored)) setPaletteState(stored);
  }, []);

  const setPalette = React.useCallback((next: PaletteId) => {
    setPaletteState(next);
    document.documentElement.setAttribute("data-palette", next);
    window.localStorage.setItem(PALETTE_STORAGE_KEY, next);
  }, []);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-palette", palette);
  }, [palette]);

  const value = React.useMemo(() => ({ palette, setPalette }), [palette, setPalette]);

  return <PaletteContext.Provider value={value}>{children}</PaletteContext.Provider>;
}

export function usePalette() {
  const ctx = React.useContext(PaletteContext);
  if (!ctx) throw new Error("usePalette must be used within a PaletteProvider");
  return ctx;
}
