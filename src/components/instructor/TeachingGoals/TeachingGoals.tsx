"use client";

import { useState } from "react";
import { Check, Plus, Target, Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Progress } from "@/components/ui/shadcn/progress";
import { Skeleton } from "@/components/ui/shadcn/skeleton";
import { cn } from "@/lib/utils";
import { EmptyWidgetState } from "@/components/instructor/shared/EmptyWidgetState";
import {
  useCreateTeachingGoal,
  useDeleteTeachingGoal,
  useUpdateTeachingGoal,
} from "@/hooks/queries/instructor/useDashboardHome";
import type { TeachingGoal } from "@/types/instructor-dashboard";

interface TeachingGoalsProps {
  goals?: TeachingGoal[];
  isLoading?: boolean;
}

export function TeachingGoals({ goals, isLoading }: TeachingGoalsProps) {
  const [label, setLabel] = useState("");
  const [target, setTarget] = useState("");
  const createGoal = useCreateTeachingGoal();
  const updateGoal = useUpdateTeachingGoal();
  const deleteGoal = useDeleteTeachingGoal();

  const overall = goals && goals.length > 0 ? Math.round((goals.filter((g) => g.done).length / goals.length) * 100) : 0;

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = Number(target);
    if (!label.trim() || !targetNum || targetNum < 1) return;
    createGoal.mutate(
      { label: label.trim(), target: targetNum },
      { onSuccess: () => { setLabel(""); setTarget(""); } }
    );
  };

  const handleToggleDone = (goal: TeachingGoal) => {
    updateGoal.mutate({ goalId: goal.id, payload: { done: !goal.done } });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teaching Goals</CardTitle>
        {goals && goals.length > 0 && (
          <span className="text-[10.5px] font-bold text-primary">{overall}% complete</span>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => <Skeleton key={idx} className="h-10 rounded-lg" />)
        ) : (
          <>
            {!goals || goals.length === 0 ? (
              <EmptyWidgetState icon={Target} message="No teaching goals set for this term yet." />
            ) : (
              <>
                <Progress value={overall} className="h-1.5" />
                <ul className="space-y-2.5 pt-1">
                  {goals.map((goal) => (
                    <li key={goal.id} className="group flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleToggleDone(goal)}
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                          goal.done
                            ? "bg-success border-success text-success-foreground"
                            : "border-input text-transparent hover:border-primary/50"
                        )}
                      >
                        <Check className="size-3" strokeWidth={3} />
                      </button>
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "text-xs font-semibold",
                            goal.done ? "text-muted-foreground line-through" : "text-foreground"
                          )}
                        >
                          {goal.label}
                        </p>
                      </div>
                      <span className="text-[10.5px] font-bold text-muted-foreground tabular-nums shrink-0">
                        {goal.current}/{goal.target}
                      </span>
                      <button
                        type="button"
                        aria-label="Delete goal"
                        onClick={() => deleteGoal.mutate(goal.id)}
                        className="shrink-0 text-muted-foreground/50 opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <form onSubmit={handleAddGoal} className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="New goal…"
                className="min-w-0 flex-1 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-xs outline-none focus:border-primary/50"
              />
              <input
                type="number"
                min={1}
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Target"
                className="w-16 shrink-0 rounded-lg border border-input bg-transparent px-2 py-1.5 text-xs outline-none focus:border-primary/50"
              />
              <button
                type="submit"
                disabled={createGoal.isPending || !label.trim() || !target}
                className="flex shrink-0 items-center justify-center rounded-lg bg-primary p-1.5 text-primary-foreground disabled:opacity-40"
              >
                <Plus className="size-3.5" />
              </button>
            </form>
          </>
        )}
      </CardContent>
    </Card>
  );
}
