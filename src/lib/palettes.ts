export type PaletteId = "orange" | "ocean" | "forest" | "violet" | "rose" | "teal";

export interface Palette {
  id: PaletteId;
  name: string;
  /** Preview swatch shown in light mode */
  swatchLight: string;
  /** Preview swatch shown in dark mode */
  swatchDark: string;
}

export const PALETTES: Palette[] = [
  { id: "orange", name: "Blossom", swatchLight: "#f2c7c7", swatchDark: "#f2c7c7" },
  { id: "ocean", name: "Ocean", swatchLight: "#0284c7", swatchDark: "#38bdf8" },
  { id: "forest", name: "Forest", swatchLight: "#059669", swatchDark: "#34d399" },
  { id: "violet", name: "Violet", swatchLight: "#7c3aed", swatchDark: "#a78bfa" },
  { id: "rose", name: "Rose", swatchLight: "#e11d48", swatchDark: "#fb7185" },
  { id: "teal", name: "Teal", swatchLight: "#44a1a4", swatchDark: "#60afb2" },
];

export const DEFAULT_PALETTE: PaletteId = "orange";

// Bumped to v3 for the earlier Crimson retheme. The "orange" id's resolved
// colors have moved twice since (Amber Forest, then this pastel "Blossom"
// palette — see globals.css) without needing another bump: id and storage
// key stay put, only the tokens underneath them change.
export const PALETTE_STORAGE_KEY = "lms-palette-v3";

export function isPaletteId(value: string | null): value is PaletteId {
  return !!value && PALETTES.some((p) => p.id === value);
}
