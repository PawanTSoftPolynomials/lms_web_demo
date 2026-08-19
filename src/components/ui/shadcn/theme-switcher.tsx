"use client";

import * as React from "react";
import { Check, Moon, Palette as PaletteIcon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/shadcn/dropdown-menu";
import { PALETTES, type PaletteId } from "@/lib/palettes";
import { usePalette } from "@/providers/PaletteProvider";

const MODES: { id: "light" | "dark"; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
];

/**
 * Global theme switcher: 5 color palettes x 2 modes = 10 combinations,
 * changeable at any time from anywhere it's mounted. Selection persists
 * to localStorage via PaletteProvider (palette) and next-themes (mode).
 */
export function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();
  const { palette, setPalette } = usePalette();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const mode = mounted && resolvedTheme === "light" ? "light" : "dark";
  const activeSwatch = PALETTES.find((p) => p.id === palette) ?? PALETTES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Change theme"
          className="relative border-card-border bg-card text-muted-foreground hover:text-foreground"
        >
          <PaletteIcon className="size-4" />
          <span
            className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-card"
            style={{
              backgroundColor: mounted
                ? mode === "dark"
                  ? activeSwatch.swatchDark
                  : activeSwatch.swatchLight
                : activeSwatch.swatchLight,
            }}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Mode</DropdownMenuLabel>
        <div className="flex gap-1.5 px-1 pb-2">
          {MODES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTheme(id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition-colors ${
                mode === id
                  ? "border-primary bg-accent text-accent-foreground"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>

        <DropdownMenuLabel>Color palette</DropdownMenuLabel>
        <div className="grid grid-cols-1 gap-1 px-1 pb-1">
          {PALETTES.map((p) => {
            const isActive = p.id === palette;
            const swatch = mode === "dark" ? p.swatchDark : p.swatchLight;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPalette(p.id as PaletteId)}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors ${
                  isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <span
                  className="size-3.5 shrink-0 rounded-full border border-black/10"
                  style={{ backgroundColor: swatch }}
                />
                <span className="flex-1 text-left">{p.name}</span>
                {isActive && <Check className="size-3.5 text-primary" />}
              </button>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
