export type PaletteId = "orange" | "ocean" | "forest" | "violet" | "rose";

export interface Palette {
  id: PaletteId;
  name: string;
  /** Preview swatch shown in light mode */
  swatchLight: string;
  /** Preview swatch shown in dark mode */
  swatchDark: string;
}

export const PALETTES: Palette[] = [
  { id: "orange", name: "Orange", swatchLight: "#ff7a00", swatchDark: "#ff8c1a" },
  { id: "ocean", name: "Ocean", swatchLight: "#0284c7", swatchDark: "#38bdf8" },
  { id: "forest", name: "Forest", swatchLight: "#059669", swatchDark: "#34d399" },
  { id: "violet", name: "Violet", swatchLight: "#7c3aed", swatchDark: "#a78bfa" },
  { id: "rose", name: "Rose", swatchLight: "#e11d48", swatchDark: "#fb7185" },
];

export const DEFAULT_PALETTE: PaletteId = "orange";

export const PALETTE_STORAGE_KEY = "lms-palette";

export function isPaletteId(value: string | null): value is PaletteId {
  return !!value && PALETTES.some((p) => p.id === value);
}
