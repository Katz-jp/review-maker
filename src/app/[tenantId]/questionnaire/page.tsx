"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronRight, AlertCircle } from "lucide-react";
import { questionnaireData } from "@/lib/questionnaire-data";
import { useTenant } from "@/components/TenantProvider";

type Answers = Record<string, string[]>;
type OtherInputs = Record<string, string>;
type CustomOptionsByQuestion = Record<string, string[]>;

const TOTAL_STEPS = 6;

function mergeOptions(
  baseOptions: string[],
  customOptions: string[] = []
): string[] {
  const withoutOther = baseOptions.filter((o) => o !== "その他");
  return [...withoutOther, ...customOptions, "その他"];
}

export default function TenantQuestionnairePage() {
  const router = useRouter();
  const params = useParams();
  const tenantId = (params.tenantId as string) || "demo";
  const tenant = useTenant();
  const canUseQuestionnaire = tenant.subscriptionStatus === "active" || tenant.subscriptionStatus === "trialing";

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [otherInputs, setOtherInputs] = useState<OtherInputs>({});
  const [freeText, setFreeText] = useState("");
  const [customOptions, setCustomOptions] = useState<CustomOptionsByQuestion>({});

  const fetchCustomOptions = useCallback(() => {
    if (!tenantId) return;
    fetch(`/api/tenant/${tenantId}/custom-options`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => setCustomOptions(data.customOptions ?? {}))
      .catch(() => setCustomOptions({}));
  }, [tenantId]);

  useEffect(() => {
    fetchCustomOptions();

    // ページがフォーカスされた時に再取得
    const handleFocus = () => {
      fetchCustomOptions();
    };
    window.addEventListener("focus", handleFocus);

    // 定期的に再取得（30秒ごと）
    const interval = setInterval(fetchCustomOptions, 30000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, [tenantId, fetchCustomOptions]);

  const questions = useMemo(() => {
    return questionnaireData.questions.map((q) => ({
      ...q,
      options: mergeOptions(q.options, customOptions[q.id]),
    }));
  }, [customOptions]);
  const isFreeTextStep = currentStep === questions.length;
  const currentQuestion = !isFreeTextStep ? questions[currentStep] : null;

  const toggleOption = (questionId: string, option: string) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      const exists = current.includes(option);
      const next = exists
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [questionId]: next };
    });
    if (option !== "その他") {
      setOtherInputs((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
  };

  const setOtherInput = (questionId: string, value: string) => {
    setOtherInputs((prev) => ({ ...prev, [questionId]: value }));
  };

  const isSelected = (questionId: string, option: string) =>
    (answers[questionId] || []).includes(option);

  const goNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      const payload = {
        answers,
        otherInputs,
        freeText,
        tenantId,
        answeredAt: new Date().toISOString(),
      };
      sessionStorage.setItem("questionnaireAnswers", JSON.stringify(payload));
      router.push(`/${tenantId}/generate`);
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    } else {
      router.push(`/${tenantId}`);
    }
  };

  if (!canUseQuestionnaire) {
    return (
      <main className="min-h-screen flex flex-col px-5 pt-6 pb-12 max-w-lg mx-auto">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">この店舗は現在ご利用いただけません</h2>
          <p className="text-sm text-gray-600 mb-6">
            お客様アンケートは、店舗の契約が有効な場合のみご利用いただけます。
          </p>
          <Link
            href={`/${tenantId}`}
            className="py-3 px-6 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold"
          >
            トップへ戻る
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col px-5 pt-6 pb-12 max-w-lg mx-auto">
      <header className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={goPrev}
          className="flex items-center gap-1 text-gray-600 text-sm py-2 -ml-1"
        >
          <ArrowLeft className="w-4 h-4" />
          戻る
        </button>
        <span className="text-sm text-gray-500">お客様アンケート</span>
      </header>

      <div className="mb-6">
        <div className="h-1.5 bg-green-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{
              width: `${((currentStep + 1) / TOTAL_STEPS) * 100}%`,
            }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {currentStep + 1} / {TOTAL_STEPS}
        </p>
      </div>

      <section className="flex-1">
        {currentQuestion ? (
          <div>
            <h3 className="font-semibold text-gray-800 mb-2 text-base">
              {currentQuestion.label}
            </h3>
            <p className="text-sm text-primary-dark font-medium mb-4">
              複数選択OK
            </p>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {currentQuestion.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleOption(currentQuestion.id, opt)}
                  className={`
                    min-h-[56px] px-4 py-3 rounded-xl text-center text-2xl font-medium
                    border-2 transition-all active:scale-[0.98]
                    ${
                      isSelected(currentQuestion.id, opt)
                        ? "border-primary bg-primary/15 text-primary-dark"
                        : "border-gray-200 bg-white text-gray-700 hover:border-primary/50"
                    }
                  `}
                >
                  <span className="flex items-center justify-center gap-2">
                    {opt}
                    {isSelected(currentQuestion.id, opt) && (
                      <ChevronRight className="w-4 h-4 text-primary shrink-0" />
                    )}
                  </span>
                </button>
              ))}
            </div>

            {isSelected(currentQuestion.id, "その他") && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ご記入ください
                </label>
                <input
                  type="text"
                  value={otherInputs[currentQuestion.id] ?? ""}
                  onChange={(e) =>
                    setOtherInput(currentQuestion.id, e.target.value)
                  }
                  placeholder="自由にご入力ください"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}
          </div>
        ) : (
          <div>
            <h3 className="font-semibold text-gray-800 mb-2 text-base">
              最後にひとこと（任意）
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              1行でもOK。予約や待ち時間、初回の安心感、通いやすさなど、施術以外で感じたことを自由にどうぞ。
            </p>
            <textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder="LINEで予約できて楽／人気なので希望日時は早めに予約したほうが良さそう／初回の説明が丁寧で、不安がなくなった／少し寒く感じることがあった／家でできるストレッチや姿勢のコツも教えてもらえた／待ち時間が短くてスムーズ"
              rows={5}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-800 placeholder-gray-400 text-sm resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}
      </section>

      <div className="mt-auto pt-8">
        <button
          type="button"
          onClick={goNext}
          className="block w-full py-4 px-6 rounded-2xl bg-primary hover:bg-primary-dark text-white font-semibold text-base text-center shadow-md active:scale-[0.98] transition-transform"
        >
          {currentStep === TOTAL_STEPS - 1
            ? "口コミを生成する"
            : "次へ"}
        </button>
      </div>
    </main>
  );
}
