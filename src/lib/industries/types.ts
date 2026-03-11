/** 業種ごとの口コミ生成用設定 */
export type IndustryConfig = {
  questions: Array<{
    id: string;
    label: string;
    options: string[];
    /** false のときは単一選択（デフォルトは複数選択可） */
    multiSelect?: boolean;
  }>;
  buildPrompt: (
    answers: Record<string, string[]>,
    otherInputs: Record<string, string>,
    freeText: string
  ) => string;
  systemMessage: string;
};
