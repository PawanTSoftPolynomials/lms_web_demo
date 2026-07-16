import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "miro.medium.com",
            },
            {
                protocol: "https",
                hostname: "www.devprojournal.com",
            },
            {
                protocol: "https",
                hostname: "encrypted-tbn0.gstatic.com",
            },
            {
                protocol: "https",
                hostname: "wildlearner.com",
            },
            {
                protocol: "https",
                hostname: "www.cnet.com",
            },
        ],
    },
    async rewrites() {
        return [
            // Nested module details
            {
                source: "/instructor/courses/:courseId/modules/:moduleId",
                destination: "/instructor/modules/:moduleId",
            },
            // Nested module edit
            {
                source: "/instructor/courses/:courseId/modules/edit/:moduleId",
                destination: "/instructor/modules/edit/:moduleId",
            },
            // Nested module create
            {
                source: "/instructor/courses/:courseId/modules/create",
                destination: "/instructor/modules/create/:courseId",
            },
            // Nested lesson details
            {
                source: "/instructor/courses/:courseId/modules/:moduleId/lessons/:lessonId",
                destination: "/instructor/lessons/:lessonId",
            },
            // Nested lesson create
            {
                source: "/instructor/courses/:courseId/modules/:moduleId/lessons/create",
                destination: "/instructor/lessons/create/:moduleId",
            },
            // Nested lesson edit
            {
                source: "/instructor/courses/:courseId/modules/:moduleId/lessons/edit/:lessonId",
                destination: "/instructor/lessons/edit/:lessonId",
            },
            // Nested content details
            {
                source: "/instructor/courses/:courseId/modules/:moduleId/lessons/:lessonId/contents/:contentId",
                destination: "/instructor/contents/view/:contentId",
            },
            // Nested content create
            {
                source: "/instructor/courses/:courseId/modules/:moduleId/lessons/:lessonId/contents/create",
                destination: "/instructor/contents/create/:lessonId",
            },
            // Nested content edit
            {
                source: "/instructor/courses/:courseId/modules/:moduleId/lessons/:lessonId/contents/edit/:contentId",
                destination: "/instructor/contents/edit/:contentId",
            },
            // Nested quizzes list
            {
                source: "/instructor/courses/:courseId/quizzes",
                destination: "/instructor/quizzes/:courseId",
            },
            // Nested quiz details
            {
                source: "/instructor/courses/:courseId/quizzes/:quizId",
                destination: "/instructor/quizzes/view/:quizId",
            },
            // Nested quiz create
            {
                source: "/instructor/courses/:courseId/quizzes/create",
                destination: "/instructor/quizzes/create/:courseId",
            },
            // Nested quiz edit
            {
                source: "/instructor/courses/:courseId/quizzes/edit/:quizId",
                destination: "/instructor/quizzes/edit/:quizId",
            },
            // Nested questions list
            {
                source: "/instructor/courses/:courseId/quizzes/:quizId/questions",
                destination: "/instructor/questions/:quizId",
            },
            // Nested question create
            {
                source: "/instructor/courses/:courseId/quizzes/:quizId/questions/create",
                destination: "/instructor/questions/create/:quizId",
            },
            // Nested question edit
            {
                source: "/instructor/courses/:courseId/quizzes/:quizId/questions/edit/:questionId",
                destination: "/instructor/questions/edit/:questionId",
            },
            // Nested question view
            {
                source: "/instructor/courses/:courseId/quizzes/:quizId/questions/view/:questionId",
                destination: "/instructor/questions/view/:questionId",
            },
        ];
    },
};

export default nextConfig;