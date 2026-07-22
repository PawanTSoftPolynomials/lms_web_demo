import api from "@/lib/axios";

export const getModules = async (
  courseId
) => {
  try {
    const url = courseId
      ? `/modules?courseId=${courseId}`
      : "/modules";

    const response = await api.get(url);
    return response.data?.data ?? response.data ?? [];
  } catch (error) {
    console.warn("API error fetching modules, returning fallback modules list:", error?.message);
    return [
      {
        id: 'mod-1',
        title: 'Module 1: Java Advanced Concepts & Concurrency',
        order: 1,
        lessons: [
          { id: 'les-1', title: '1.1 Streams API & Functional Operators', duration: '45 mins', type: 'VIDEO' },
          { id: 'les-2', title: '1.2 Multithreading & Executor Service Lab', duration: '60 mins', type: 'QUIZ' }
        ]
      },
      {
        id: 'mod-2',
        title: 'Module 2: Spring Boot Architecture & REST Services',
        order: 2,
        lessons: [
          { id: 'les-3', title: '2.1 Spring DI, IoC & Controller Setup', duration: '50 mins', type: 'ASSIGNMENT' }
        ]
      }
    ];
  }
};
export const getModuleById =
  async (moduleId) => {
    const response =
      await api.get(
        `/modules/${moduleId}`
      );

    return response.data;
  };

export const createModule =
  async (data) => {
    const response =
      await api.post(
        "/modules",
        data
      );

    return response.data;
  };

export const updateModule =
  async (
    moduleId,
    data
  ) => {
    const response =
      await api.put(
        `/modules/${moduleId}`,
        data
      );

    return response.data;
  };

export const deleteModule =
  async (moduleId) => {
    const response =
      await api.delete(
        `/modules/${moduleId}`
      );

    return response.data;
  };