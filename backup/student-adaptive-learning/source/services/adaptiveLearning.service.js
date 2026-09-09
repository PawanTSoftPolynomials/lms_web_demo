import Cookies from "js-cookie";

import api from "@/lib/axios";

/**
 * Fetch Pedagogical Decision from Decision Engine
 * @param {Object} data - { kc, hasNextTarget? }
 */
export const getPedagogicalDecision = async (data) => {
    const { data: responseData } = await api.post(
        "/learner-model/decision",
        data
    );

    return responseData.data ?? responseData;
};

/**
 * Trigger Adaptive Learning Response from Decision Engine + LLM Gateway
 * @param {Object} data - { kc, message?, hasNextTarget?, courseId?, quizId?, questionId? }
 */
export const respondToStudent = async (data) => {
    const { data: responseData } = await api.post(
        "/adaptive-learning/respond",
        data,
        { timeout: 120000 }
    );

    return responseData.data ?? responseData;
};

export const respondToAdaptiveLearning = respondToStudent;

/**
 * Streaming counterpart to respondToStudent(). axios can't expose a browser
 * ReadableStream, so this uses fetch() directly — but reproduces the exact
 * same Bearer-token auth api.js's request interceptor attaches, since fetch
 * bypasses axios (and its interceptors) entirely.
 *
 * The backend (POST /adaptive-learning/respond/stream) sends newline-delimited
 * `data: {...}\n\n` blocks, each a JSON object with a `type` of "chunk",
 * "done", or "error" — see adaptiveLearning.controller.js#respondStream.
 *
 * Resolves with the same normalized payload shape as respondToStudent() once
 * the backend sends its "done" event. Rejects (never resolves) on a
 * pre-stream HTTP error, a mid-stream "error" event, an unexpected stream
 * end, or `signal` being aborted.
 *
 * @param {Object} params
 * @param {Object} params.data - { kc, message?, hasNextTarget?, courseId?, quizId?, questionId? }
 * @param {(content: string) => void} [params.onChunk] - Called with each content delta as it arrives
 * @param {AbortSignal} [params.signal]
 * @returns {Promise<Object>}
 */
export const streamAdaptiveResponse = async ({ data, onChunk, signal }) => {
    const token = Cookies.get("accessToken");

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/adaptive-learning/respond/stream`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(data),
            signal,
        }
    );

    if (!response.ok || !response.body) {
        let message = `Adaptive learning stream failed (${response.status})`;
        try {
            const errorJson = await response.json();
            message = errorJson?.message || message;
        } catch {
            // Non-JSON error body — keep the generic message.
        }
        throw new Error(message);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let boundary;
        while ((boundary = buffer.indexOf("\n\n")) !== -1) {
            const rawEvent = buffer.slice(0, boundary);
            buffer = buffer.slice(boundary + 2);

            const dataLine = rawEvent
                .split("\n")
                .find((line) => line.startsWith("data:"));
            if (!dataLine) continue;

            let payload;
            try {
                payload = JSON.parse(dataLine.slice(5).trim());
            } catch {
                continue;
            }

            if (payload.type === "chunk") {
                onChunk?.(payload.content);
            } else if (payload.type === "done") {
                return payload.result;
            } else if (payload.type === "error") {
                throw new Error(payload.message || "Adaptive learning generation failed.");
            }
        }
    }

    throw new Error("Adaptive learning stream ended unexpectedly.");
};

/**
 * Generates ONE diagnostic verification question for the KC/misconception a
 * MISCONCEPTION_REMEDIATION response just addressed — closes the adaptive
 * loop (remediation -> check understanding -> re-decide) without reloading
 * the quiz-result page. Never part of the original quiz submission.
 *
 * @param {Object} data - { kc, courseId?, quizId?, questionId?, misconception? }
 * @returns {Promise<Object>} { question, options, type, kc, purpose, verificationToken }
 */
export const generateVerificationQuestion = async (data) => {
    const { data: responseData } = await api.post(
        "/adaptive-learning/verification/generate",
        data,
        { timeout: 120000 }
    );

    return responseData.data ?? responseData;
};

/**
 * Submits the student's chosen answer for a generated verification question.
 * `verificationToken` is the opaque token generateVerificationQuestion()
 * returned — the backend scores correctness server-side from what it signed
 * into that token, never from a client-supplied isCorrect. Updates the
 * learner model and returns the Decision Engine's next recommendation.
 *
 * @param {Object} data - { verificationToken, selectedAnswer }
 * @returns {Promise<Object>} { isCorrect, correctAnswer, kc, nextDecision }
 */
export const evaluateVerificationAnswer = async (data) => {
    const { data: responseData } = await api.post(
        "/adaptive-learning/verification/evaluate",
        data
    );

    return responseData.data ?? responseData;
};
