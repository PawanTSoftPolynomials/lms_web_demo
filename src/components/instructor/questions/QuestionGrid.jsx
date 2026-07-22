"use client";

import QuestionCard from "./QuestionCard";
import EmptyQuestions from "./EmptyQuestions";

export default function QuestionGrid({
                                         questions = [], quizId, onDelete, onImport,
                                     }) {
    if (!questions.length) {
        return (<EmptyQuestions
                quizId={quizId}
                onImport={onImport}
            />);
    }

    return (<div
            className="
                grid
                gap-6
                md:grid-cols-2
                xl:grid-cols-3
            "
        >
            {questions.map((question) => (<QuestionCard
                    key={question.id}
                    question={question}
                    onDelete={onDelete}
                />))}
        </div>);
}