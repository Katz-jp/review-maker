/** 業種ごとの口コミ生成用設定 */
export type IndustryConfig = {
  questions: Array<{ id: string; label: string; options: string[] }>;
  buildPrompt: (
    answers: Record<string, string[]>,
    otherInputs: Record<string, string>,
    freeText: string
  ) => string;
  systemMessage: string;
};
