"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronRight, AlertCircle } from "lucide-react";
import { industries, getIndustryConfig, type IndustryKey } from "@/lib/industries";
import { OTHER_OPTION_LABEL } from "@/lib/other-option-label";
import { RESTAURANT_ORDERED_MENU_QUESTION_ID } from "@/lib/industries/restaurant";
import { useTenant } from "@/components/TenantProvider";
import { getRemainingGenerations, canGenerate, incrementGenerationCount, MAX_DEMO_GENERATIONS } from "@/lib/demo-limit";
import { TRIAL_INDUSTRY_KEY } from "@/lib/demo-limit";
import { MultiSelectBadge } from "@/components/MultiSelectBadge";

type Answers = Record<string, string[]>;
type OtherInputs = Record<string, string>;
type CustomOptionsByQuestion = Record<string, string[]>;

const HIDDEN_OPTIONS = ["パーソナルトレーニング"];

/** trial かつメニュー未登録のときのデモ用（店舗はオーナー画面で実メニューを登録） */
const TRIAL_DEMO_MENU_ITEMS = [
  "日替わりランチ",
  "季節のパスタ",
  "カフェラテ",
  "本日のスープ",
  "デザートプレート",
  "おつまみ盛り合わせ",
  "コース料理",
  "単品ドリンク",
];

function mergeOptions(
  baseOptions: string[],
  customOptions: string[] = []
): string[] {
  const hasOther = baseOptions.includes(OTHER_OPTION_LABEL);
  const withoutOther = hasOther
    ? baseOptions.filter((o) => o !== OTHER_OPTION_LABEL)
    : baseOptions;
  const merged = hasOther
    ? [...customOptions, ...withoutOther, OTHER_OPTION_LABEL]
    : [...customOptions, ...withoutOther];
  return merged.filter((o) => !HIDDEN_OPTIONS.includes(o));
}

export default function TenantQuestionnairePage() {
  const router = useRouter();
  const params = useParams();
  const tenantId = (params.tenantId as string) || "demo";
  const tenant = useTenant();
  // trialの場合は契約チェックをスキップ（制限のみ適用）
  const canUseQuestionnaire = tenantId === "trial" || tenant.subscriptionStatus === "active" || tenant.subscriptionStatus === "trialing";

  // hydration mismatch 回避のため、初回描画はサーバーと同じ値に揃え、マウント後に sessionStorage を反映する
  const [industryKey, setIndustryKey] = useState<IndustryKey>(() => {
    const fromTenant = tenant?.industry;
    const fromTenantId = tenantId === "retail-demo" ? "retail" : tenantId === "demo-test" ? "seikotsu" : undefined;
    const raw = fromTenant ?? fromTenantId ?? "seikotsu";
    return Object.hasOwn(industries, raw) ? (raw as IndustryKey) : "seikotsu";
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [otherInputs, setOtherInputs] = useState<OtherInputs>({});
  const [freeText, setFreeText] = useState("");
  const [customOptions, setCustomOptions] = useState<CustomOptionsByQuestion>({});
  const [remainingGenerations, setRemainingGenerations] = useState<number | null>(null);
  const [satisfaction, setSatisfaction] = useState<number | null>(null); // 満足度（1〜5）
  const [stepError, setStepError] = useState<string | null>(null);

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
    // trial で業種未選択の場合は業種選択へ
    if (tenantId === "trial" && typeof window !== "undefined" && !sessionStorage.getItem(TRIAL_INDUSTRY_KEY)) {
      router.replace("/trial/create");
      return;
    }
    // デモ制限チェック（trialのみ）
    if (tenantId === "trial") {
      const remaining = getRemainingGenerations(tenantId, "generate");
      setRemainingGenerations(remaining);
    } else {
      setRemainingGenerations(null);
    }
    fetchCustomOptions();

    // ページがフォーカスされた時に再取得
    const handleFocus = () => {
      fetchCustomOptions();
      // trialの場合は残り回数も再取得
      if (tenantId === "trial") {
        const remaining = getRemainingGenerations(tenantId, "generate");
        setRemainingGenerations(remaining);
      }
    };
    window.addEventListener("focus", handleFocus);

    // 定期的に再取得（30秒ごと）
    const interval = setInterval(fetchCustomOptions, 30000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, [tenantId, fetchCustomOptions, router]);

  useEffect(() => {
    // trial の場合のみ sessionStorage の業種を反映（マウント後）
    if (tenantId !== "trial") {
      const fromTenant = tenant?.industry;
      const fromTenantId = tenantId === "retail-demo" ? "retail" : tenantId === "demo-test" ? "seikotsu" : undefined;
      const raw = fromTenant ?? fromTenantId ?? "seikotsu";
      setIndustryKey(Object.hasOwn(industries, raw) ? (raw as IndustryKey) : "seikotsu");
      return;
    }
    if (typeof window === "undefined") return;
    const v = sessionStorage.getItem(TRIAL_INDUSTRY_KEY);
    const next =
      v === "kouri" ? "retail" :
      v === "seikotsuin" ? "seikotsu" :
      v === "haisha" ? "dental" :
      v === "inshoku" ? "restaurant" :
      undefined;
    if (next && Object.hasOwn(industries, next)) setIndustryKey(next as IndustryKey);
  }, [tenantId, tenant?.industry]);

  const retailPreset =
    industryKey === "retail"
      ? tenant?.retailPreset ??
        (tenantId === "retail-demo" || tenantId === "trial" ? "meat" : undefined)
      : undefined;
  const industryConfig = getIndustryConfig(industryKey, retailPreset);
  const baseQuestions = useMemo(() => {
    const all = industryConfig.questions;
    if (industryKey !== "restaurant") return all;
    return all.filter((q) => {
      if (q.id === "goodPoints") return satisfaction !== null && satisfaction >= 4;
      if (q.id === "concerns") return satisfaction !== null && satisfaction <= 3;
      return true;
    });
  }, [industryConfig.questions, industryKey, satisfaction]);

  useEffect(() => {
    if (industryKey !== "restaurant" || satisfaction === null) return;
    setAnswers((prev) => {
      const next = { ...prev };
      if (satisfaction >= 4) delete next.concerns;
      else delete next.goodPoints;
      return next;
    });
  }, [industryKey, satisfaction]);

  const questions = useMemo(() => {
    return baseQuestions.map((q) => {
      let opts = mergeOptions(q.options, customOptions[q.id]);
      if (
        industryKey === "restaurant" &&
        q.id === RESTAURANT_ORDERED_MENU_QUESTION_ID &&
        tenantId === "trial" &&
        opts.filter((o) => o !== OTHER_OPTION_LABEL).length === 0
      ) {
        opts = [...TRIAL_DEMO_MENU_ITEMS, OTHER_OPTION_LABEL];
      }
      return {
        ...q,
        options: opts,
      };
    });
  }, [baseQuestions, customOptions, industryKey, tenantId]);
  type Step =
    | { type: "question"; questionIndex: number }
    | { type: "freeText" }
    | { type: "rating" };

  const steps: Step[] = useMemo(() => {
    // 全業種「星評価（必須）→ 設問 → 自由記入」
    const base: Step[] = [{ type: "rating" as const }];
    for (let i = 0; i < questions.length; i += 1) {
      base.push({ type: "question" as const, questionIndex: i });
    }
    base.push({ type: "freeText" as const });
    return base;
  }, [questions]);

  const TOTAL_STEPS = steps.length;
  const current = steps[currentStep];
  const isRatingStep = current?.type === "rating";
  const isFreeTextStep = current?.type === "freeText";
  const currentQuestion =
    current?.type === "question" ? questions[current.questionIndex] : null;

  useEffect(() => {
    setStepError(null);
  }, [currentStep]);

  const validateCurrentStep = (): boolean => {
    setStepError(null);
    if (isRatingStep) {
      if (satisfaction === null) {
        setStepError("満足度を選んでください");
        return false;
      }
      return true;
    }
    if (isFreeTextStep) return true;
    if (!currentQuestion) return true;
    const qid = currentQuestion.id;
    const selected = answers[qid] || [];
    if (industryKey === "restaurant") {
      if (qid === RESTAURANT_ORDERED_MENU_QUESTION_ID) {
        const onlyOther =
          currentQuestion.options.length === 1 && currentQuestion.options[0] === OTHER_OPTION_LABEL;
        if (onlyOther && tenantId !== "trial") {
          setStepError("店舗にメニューが登録されていません。お店にご確認ください。");
          return false;
        }
        if (selected.length === 0) {
          setStepError("メニューを1つ以上選んでください");
          return false;
        }
        if (selected.includes(OTHER_OPTION_LABEL) && !(otherInputs[qid]?.trim())) {
          setStepError(`「${OTHER_OPTION_LABEL}」を選んだ場合は内容を入力してください`);
          return false;
        }
        return true;
      }
      if (qid === "scene") {
        if (selected.length === 0) {
          setStepError("ご利用シーンを選んでください");
          return false;
        }
        if (selected.includes(OTHER_OPTION_LABEL) && !(otherInputs[qid]?.trim())) {
          setStepError(`「${OTHER_OPTION_LABEL}」を選んだ場合は内容を入力してください`);
          return false;
        }
        return true;
      }
      if (qid === "goodPoints" || qid === "concerns") {
        if (selected.length === 0) {
          setStepError("1つ以上選んでください");
          return false;
        }
        if (selected.includes(OTHER_OPTION_LABEL) && !(otherInputs[qid]?.trim())) {
          setStepError(`「${OTHER_OPTION_LABEL}」を選んだ場合は内容を入力してください`);
          return false;
        }
        return true;
      }
      if (qid === "returnIntent") {
        if (selected.length !== 1) {
          setStepError("いずれか1つを選んでください");
          return false;
        }
        return true;
      }
    }
    return true;
  };

  const toggleOption = (questionId: string, option: string) => {
    const question = questions.find((q) => q.id === questionId);
    const isMultiSelect = question?.multiSelect !== false;

    setAnswers((prev) => {
      const current = prev[questionId] || [];
      if (!isMultiSelect) {
        // 単一選択の場合は常に1つだけ保持
        return { ...prev, [questionId]: [option] };
      }

      const exists = current.includes(option);
      const next = exists ? current.filter((o) => o !== option) : [...current, option];
      return {
        ...prev,
        [questionId]: next,
      };
    });
    if (option !== OTHER_OPTION_LABEL) {
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
    if (!validateCurrentStep()) return;
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      // デモ制限チェック（trialのみ）
      if (tenantId === "trial" && !canGenerate(tenantId, "generate")) {
        return; // ボタンは無効化されているのでここには来ないはずだが念のため
      }
      if (satisfaction === null) return;
      const payload = {
        answers,
        otherInputs,
        freeText,
        tenantId,
        industry: industryKey,
        satisfaction,
        ...(industryKey === "retail" && { retailPreset: retailPreset ?? "meat" }),
        answeredAt: new Date().toISOString(),
      };
      sessionStorage.setItem("questionnaireAnswers", JSON.stringify(payload));
      router.push(`/${tenantId}/generate`);
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      // 2ページ目以降はアンケート内の1つ前のステップへ
      setCurrentStep((prev) => prev - 1);
    } else {
      // 1ページ目のときはブラウザの1つ前のページへ（履歴がなければテナントトップへ）
      if (typeof window !== "undefined" && window.history.length > 1) {
        router.back();
      } else {
        router.push(tenantId === "trial" ? "/trial/create" : `/${tenantId}`);
      }
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
            <h3 className="font-semibold text-gray-800 mb-2 text-lg leading-snug">
              {currentQuestion.label}
            </h3>
            {currentQuestion.id === "treatment" && industryKey === "dental" ? (
              <p className="text-sm text-gray-500 mb-4">
                今回ご来院された理由を教えてください
              </p>
            ) : currentQuestion.id === RESTAURANT_ORDERED_MENU_QUESTION_ID &&
              industryKey === "restaurant" ? (
              <p className="text-sm text-gray-500 mb-4">複数選べます</p>
            ) : currentQuestion.id === "recommend" && industryKey === "dental" ? null : currentQuestion.multiSelect === false ? null : (
              <div className="mb-4">
                <MultiSelectBadge />
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {currentQuestion.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleOption(currentQuestion.id, opt)}
                  className={`
                    ${
                      industryKey === "restaurant" &&
                      currentQuestion.id === RESTAURANT_ORDERED_MENU_QUESTION_ID
                        ? "min-h-[52px] px-3 py-2.5 text-sm"
                        : "min-h-[56px] px-4 py-3 text-2xl"
                    }
                    rounded-xl text-center font-medium
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

            {isSelected(currentQuestion.id, OTHER_OPTION_LABEL) && (
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
        ) : isRatingStep ? (
          <div>
            <h3 className="font-semibold text-gray-800 mb-2 text-lg leading-snug">
              満足度
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {industryKey === "retail" || industryKey === "restaurant"
                ? "今回のご来店の満足度を教えてください（必須）"
                : "今回のご来院の満足度を教えてください（必須）"}
            </p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setSatisfaction(score)}
                  className={`w-10 h-10 flex items-center justify-center rounded-full border-2 text-xl transition-all active:scale-[0.96] ${
                    satisfaction !== null && satisfaction >= score
                      ? "border-yellow-400 bg-yellow-300/80 text-yellow-900"
                      : "border-gray-200 bg-white text-gray-400 hover:border-yellow-300 hover:bg-yellow-50"
                  }`}
                  aria-label={`満足度${score}`}
                >
                  ⭐
                </button>
              ))}
            </div>
            {satisfaction === null && (
              <p className="mt-3 text-xs text-red-500 text-center">
                星をタップして満足度を選んでください。
              </p>
            )}
          </div>
        ) : (
          <div>
            {industryKey === "dental" ? (
              <>
                <h3 className="font-semibold text-gray-800 mb-2 text-lg leading-snug">
                  よろしければご感想を一言お願いします（任意）
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  来院前に困っていたことや、実際に治療を受けてみて感じたことなど、自由にご記入ください。（１行でもOKです）
                </p>
              </>
            ) : industryKey === "restaurant" ? (
              <>
                <h3 className="font-semibold text-gray-800 mb-2 text-lg leading-snug">
                  よろしければご感想を一言お願いします（任意）
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  料理の感想や、店内のことなど、伝えたいことがあれば自由にご記入ください。（１行でもOKです）
                </p>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-gray-800 mb-2 text-lg leading-snug">
                  よろしければご感想を一言お願いします（任意）
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  その他 印象に残ったこと、伝えたいことがあれば自由にご記入ください。（１行でもOKです）
                </p>
              </>
            )}
            <textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder={
                industryKey === "dental"
                  ? ""
                  : industryKey === "restaurant"
                    ? "「パスタの塩加減がちょうどよかった」\n「ランチの提供が早くて助かった」\n「カフェでゆっくりできた」"
                    : '「LINEで予約や連絡ができて便利」\n「また利用したい」\n「思っていたよりよかった」'
              }
              rows={5}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-800 placeholder-gray-400 text-sm resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}
      </section>

      <div className="mt-auto pt-8 space-y-3">
        {/* デモ制限表示（trialのみ） */}
        {tenantId === "trial" && remainingGenerations !== null && remainingGenerations < MAX_DEMO_GENERATIONS && (
          <div className="bg-green-50 rounded-xl p-3 border border-green-200">
            <p className="text-sm text-center text-gray-700">
              <span className="font-semibold text-primary">無料お試し：残り{remainingGenerations}回</span>
            </p>
          </div>
        )}
        
        {/* 制限に達した場合の案内（trialのみ） */}
        {tenantId === "trial" && remainingGenerations === 0 && currentStep === TOTAL_STEPS - 1 && (
          <div className="bg-green-50 rounded-xl p-5 border border-green-200 mb-3">
            <p className="text-base font-bold text-gray-900 mb-3 text-center">
              5回のお試し、いかがでしたか？
            </p>
            <p className="text-sm text-gray-700 mb-4 text-center leading-relaxed">
              実際のクチコミの質を実感いただけたでしょうか？
            </p>
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-700">
                「もっと多くのメニューで試したい」
              </p>
              <p className="text-sm text-gray-700">
                「実際に店舗で運用してみたい」
              </p>
            </div>
            <p className="text-sm text-gray-700 mb-4 leading-relaxed">
              そんなオーナー様のために、今なら全ての機能を1ヶ月間無料でお試しいただけるトライアルをご用意しています。
            </p>
            <a
              href="https://docs.google.com/forms/d/11ikD7LepY89LQ3pCg28Ahk3BEgXR3cGLzf7FDNGn82k/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 px-6 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-sm text-center transition-colors mb-2"
            >
              1ヶ月無料トライアルに申し込む
            </a>
            <p className="text-xs text-gray-600 text-center">
              ※トライアル期間中に解約すれば費用は一切かかりません。
            </p>
          </div>
        )}

        {stepError && (
          <p className="text-sm text-red-600 text-center" role="alert">
            {stepError}
          </p>
        )}

        <button
          type="button"
          onClick={goNext}
          disabled={
            (tenantId === "trial" && remainingGenerations === 0 && currentStep === TOTAL_STEPS - 1) ||
            (isRatingStep && satisfaction === null)
          }
          className="block w-full py-4 px-6 rounded-2xl bg-primary hover:bg-primary-dark text-white font-semibold text-base text-center shadow-md active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
        >
          {currentStep === TOTAL_STEPS - 1
            ? "口コミを生成する"
            : "次へ"}
        </button>

        {/* 左下: 業種ページに戻る（trialのみ） */}
        {tenantId === "trial" && (
          <div className="pt-2 text-left">
            <Link
              href={
                industryKey === "seikotsu"
                  ? "/industries/seikotsu"
                  : industryKey === "retail"
                    ? "/industries/retail"
                    : industryKey === "dental"
                      ? "/industries/dentist"
                      : industryKey === "restaurant"
                        ? "/industries/restaurant"
                        : "/industries"
              }
              className="text-sm text-gray-500 hover:text-primary-dark transition-colors"
            >
              {industryKey === "seikotsu"
                ? "整骨院のページに戻る"
                : industryKey === "retail"
                  ? "小売店のページに戻る"
                  : industryKey === "dental"
                    ? "歯医者・クリニックのページに戻る"
                    : industryKey === "restaurant"
                      ? "飲食店のページに戻る"
                      : "対応業種一覧に戻る"}
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
