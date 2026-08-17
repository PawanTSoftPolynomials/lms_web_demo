"use client";

import ContentCard from "./ContentCard";
import EmptyContents from "./EmptyContents";

export default function ContentGrid({
                                        contents = [],
                                        topicId,
                                        onDelete,
                                    }) {
    if (!contents.length) {
        return (
            <EmptyContents
                topicId={topicId}
            />
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {contents.map((content) => (
                <ContentCard
                    key={content.id}
                    content={content}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}