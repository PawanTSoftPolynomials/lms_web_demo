export const instructorDashboardMock = {
  performance: [
    { month: "Jan", students: 12, quizzes: 8 },
    { month: "Feb", students: 18, quizzes: 12 },
    { month: "Mar", students: 22, quizzes: 16 },
    { month: "Apr", students: 28, quizzes: 20 },
    { month: "May", students: 35, quizzes: 25 },
    { month: "Jun", students: 42, quizzes: 30 },
  ],

  engagement: {
    active: 84,
    inactive: 16,
  },

  courses: [
    {
      id: 1,
      title: "Java Full Stack Development",
      category: "Software Development",
      level: "Beginner",
      status: "Published",
      students: 128,
      modules: [
        {
          id: 1,
          title: "Java Basics",
          lessons: 8,
          status: "Published",
        },
        {
          id: 2,
          title: "Object Oriented Programming",
          lessons: 10,
          status: "Published",
        },
        {
          id: 3,
          title: "Spring Boot",
          lessons: 14,
          status: "Draft",
        },
      ],
    },

    {
      id: 2,
      title: "React Development",
      category: "Frontend",
      level: "Intermediate",
      status: "Draft",
      students: 72,
      modules: [
        {
          id: 1,
          title: "React Fundamentals",
          lessons: 6,
          status: "Published",
        },
        {
          id: 2,
          title: "React Hooks",
          lessons: 9,
          status: "Draft",
        },
      ],
    },

    {
      id: 3,
      title: "Node.js API Development",
      category: "Backend",
      level: "Advanced",
      status: "Published",
      students: 95,
      modules: [
        {
          id: 1,
          title: "Express.js",
          lessons: 7,
          status: "Published",
        },
        {
          id: 2,
          title: "JWT Authentication",
          lessons: 8,
          status: "Published",
        },
      ],
    },
  ],

  quizzes: [
    {
      id: 1,
      title: "Java Basics Quiz",
      course: "Java Full Stack Development",
      attempts: 124,
      averageScore: 84,
      questions: [
        "Variables",
        "Data Types",
        "Loops",
        "Arrays",
        "Methods",
      ],
    },

    {
      id: 2,
      title: "React Hooks Quiz",
      course: "React Development",
      attempts: 81,
      averageScore: 78,
      questions: [
        "useState",
        "useEffect",
        "useMemo",
        "useCallback",
      ],
    },

    {
      id: 3,
      title: "Express Routing Quiz",
      course: "Node.js API Development",
      attempts: 64,
      averageScore: 88,
      questions: [
        "Routing",
        "Middleware",
        "REST API",
        "Controllers",
      ],
    },
  ],
};