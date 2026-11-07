"use client";

import { useState } from "react";

import type { Lang } from "@/i18n/config";
import { t } from "@/i18n";
import {
  fetchQuestion,
  QuizError,
  sendAnswer,
  streakMultiplier,
  type QuizFailure,
  type QuizQuestion,
  type QuizVerdict,
} from "@/lib/quiz";
import { BOT_URL } from "@/lib/site";

import styles from "./Quiz.module.css";

type State =
  | { step: "idle" }
  | { step: "loading" }
  | { step: "asking"; question: QuizQuestion; sending: string | null }
  | { step: "answered"; question: QuizQuestion; picked: string; verdict: QuizVerdict };

export function Quiz({ lang }: { lang: Lang }) {
  const dict = t(lang).quiz;
  const [state, setState] = useState<State>({ step: "idle" });
  const [streak, setStreak] = useState(0);
  const [failure, setFailure] = useState<QuizFailure | null>(null);

  function failureText(value: QuizFailure): string {
    if (value.kind === "rate_limited") return dict.rateLimited(value.retryAfter);
    if (value.kind === "busy") return dict.busy(value.retryAfter);
    if (value.kind === "expired") return dict.expired;
    return dict.failed;
  }

  async function ask() {
    setFailure(null);
    setState({ step: "loading" });
    try {
      setState({ step: "asking", question: await fetchQuestion(), sending: null });
    } catch (error) {
      setFailure(error instanceof QuizError ? error.failure : { kind: "failed" });
      setState({ step: "idle" });
    }
  }

  async function answer(question: QuizQuestion, picked: string) {
    setFailure(null);
    setState({ step: "asking", question, sending: picked });
    try {
      const verdict = await sendAnswer(question.token, picked);
      setStreak((current) => (verdict.correct ? current + 1 : 0));
      setState({ step: "answered", question, picked, verdict });
    } catch (error) {
      const value = error instanceof QuizError ? error.failure : ({ kind: "failed" } as const);
      setFailure(value);
      if (value.kind === "expired") await ask();
      else setState({ step: "asking", question, sending: null });
    }
  }

  function label(question: QuizQuestion, option: string): string {
    if (question.kind !== "truefalse") return option;
    return option === "true" ? dict.trueLabel : dict.falseLabel;
  }

  const question = state.step === "asking" || state.step === "answered" ? state.question : null;

  return (
    <div className={styles.quiz}>
      {question ? (
        <div className={styles.card}>
          {question.kind === "truefalse" ? <p className={styles.kind}>{dict.statement}</p> : null}
          <p className={styles.question}>{question.text}</p>
          <div className={styles.options} role="group" aria-label={question.text}>
            {question.options.map((option) => {
              const answered = state.step === "answered" ? state : null;
              const isRight = answered && option === answered.verdict.answer;
              const isWrongPick = answered && option === answered.picked && !answered.verdict.correct;
              return (
                <button
                  key={option}
                  type="button"
                  className={styles.option}
                  data-right={isRight || undefined}
                  data-wrong={isWrongPick || undefined}
                  data-sending={(state.step === "asking" && state.sending === option) || undefined}
                  disabled={state.step !== "asking" || state.sending !== null}
                  onClick={() => answer(question, option)}
                >
                  {label(question, option)}
                </button>
              );
            })}
          </div>

          {state.step === "answered" ? (
            <div className={styles.verdict} role="status">
              <p className={state.verdict.correct ? styles.correct : styles.wrong}>
                {state.verdict.correct ? dict.correct : dict.wrong}
                {!state.verdict.correct ? (
                  <>
                    {" "}
                    {dict.rightAnswer} <strong>{label(question, state.verdict.answer)}</strong>
                  </>
                ) : null}
              </p>
              {streak > 0 ? (
                <p className={styles.streak}>
                  {dict.streak(streak)} · {dict.botReward(String(streakMultiplier(streak)))}
                </p>
              ) : null}
            </div>
          ) : null}

          {question.source === "fallback" ? <p className={styles.note}>{dict.fallback}</p> : null}
        </div>
      ) : null}

      {failure ? (
        <p className={styles.failure} role="alert">
          {failureText(failure)}
        </p>
      ) : null}

      <div className={styles.actions}>
        {state.step === "idle" || state.step === "loading" || state.step === "answered" ? (
          <button type="button" className={styles.primary} onClick={ask} disabled={state.step === "loading"}>
            {state.step === "loading" ? dict.loading : state.step === "answered" ? dict.next : dict.start}
          </button>
        ) : null}
        <a href={BOT_URL} className={styles.secondary}>
          {dict.play}
        </a>
      </div>
    </div>
  );
}
