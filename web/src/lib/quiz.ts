// Клиент квиза: браузер ходит только в свой бэкенд /api (docs/stack.md, 3.1).

export type QuizQuestion = {
  token: string;
  kind: "choice" | "truefalse";
  text: string;
  options: string[];
  source: "live" | "fallback";
};

export type QuizVerdict = { correct: boolean; answer: string };

export type QuizFailure =
  | { kind: "rate_limited" | "busy"; retryAfter: number }
  | { kind: "expired" }
  | { kind: "failed" };

export class QuizError extends Error {
  constructor(readonly failure: QuizFailure) {
    super(failure.kind);
  }
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: "POST",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new QuizError({ kind: "failed" });
  }
  if (response.ok) return (await response.json()) as T;

  const retryAfter = Math.max(1, Math.ceil(Number(response.headers.get("Retry-After")) || 5));
  if (response.status === 429) throw new QuizError({ kind: "rate_limited", retryAfter });
  if (response.status === 503) throw new QuizError({ kind: "busy", retryAfter });
  if (response.status === 404) throw new QuizError({ kind: "expired" });
  throw new QuizError({ kind: "failed" });
}

export function fetchQuestion(): Promise<QuizQuestion> {
  return post<QuizQuestion>("/api/quiz/question");
}

export function sendAnswer(token: string, answer: string): Promise<QuizVerdict> {
  return post<QuizVerdict>("/api/quiz/answer", { token, answer });
}

// Множитель серии как у /quiz в боте: ×1, ×1.25, ×1.5 … до ×3.
export function streakMultiplier(streak: number): number {
  return Math.min(3, 1 + Math.max(0, streak - 1) * 0.25);
}
