import api from "@/lib/axios";

export interface CreateGoalPayload {
  label: string;
  target: number;
}

export interface UpdateGoalPayload {
  label?: string;
  target?: number;
  current?: number;
  done?: boolean;
}

export const createTeachingGoal = async (payload: CreateGoalPayload) => {
  const { data } = await api.post("/teaching-goals", payload);
  return data?.data;
};

export const updateTeachingGoal = async (goalId: string, payload: UpdateGoalPayload) => {
  const { data } = await api.patch(`/teaching-goals/${goalId}`, payload);
  return data?.data;
};

export const deleteTeachingGoal = async (goalId: string) => {
  await api.delete(`/teaching-goals/${goalId}`);
};
