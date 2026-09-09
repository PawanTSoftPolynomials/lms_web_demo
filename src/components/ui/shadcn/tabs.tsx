"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext(component: string) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) {
    throw new Error(`<${component} /> must be used inside <Tabs>`);
  }
  return ctx;
}

interface TabsProps extends Omit<React.ComponentProps<"div">, "onChange"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

function Tabs({ value, defaultValue, onValueChange, className, children, ...props }: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
  const isControlled = value !== undefined;
  const current = isControlled ? value : internalValue;

  const setValue = React.useCallback(
    (next: string) => {
      if (!isControlled) setInternalValue(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange]
  );

  return (
    <TabsContext.Provider value={{ value: current, setValue }}>
      <div data-slot="tabs" className={cn("flex flex-col gap-3", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabsList({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="tablist"
      data-slot="tabs-list"
      className={cn(
        "inline-flex items-center gap-1 overflow-x-auto scrollbar-none rounded-xl border border-border bg-muted p-1",
        className
      )}
      {...props}
    />
  );
}

interface TabsTriggerProps extends React.ComponentProps<"button"> {
  value: string;
}

function TabsTrigger({ value, className, children, ...props }: TabsTriggerProps) {
  const { value: activeValue, setValue } = useTabsContext("TabsTrigger");
  const isActive = activeValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? "active" : "inactive"}
      data-slot="tabs-trigger"
      onClick={() => setValue(value)}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        isActive
          ? "bg-card text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface TabsContentProps extends React.ComponentProps<"div"> {
  value: string;
}

function TabsContent({ value, className, ...props }: TabsContentProps) {
  const { value: activeValue } = useTabsContext("TabsContent");
  if (activeValue !== value) return null;

  return (
    <div
      role="tabpanel"
      data-slot="tabs-content"
      className={cn("focus-visible:outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
