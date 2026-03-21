import type { IndustryKey, RetailPresetKey } from "@/lib/industries";

export type SelectOption<T extends string> = {
  value: T;
  label: string;
};

/** 管理画面用：業種の選択肢（増える前提でここに集約） */
export const INDUSTRY_OPTIONS: Array<SelectOption<"" | IndustryKey>> = [
  { value: "", label: "未設定（整骨院として表示）" },
  { value: "seikotsu", label: "整骨院" },
  { value: "dental", label: "歯医者・クリニック" },
  { value: "retail", label: "小売店" },
  { value: "restaurant", label: "飲食店" },
];

/** 管理画面用：小売プリセットの選択肢（増える前提でここに集約） */
export const RETAIL_PRESET_OPTIONS: Array<SelectOption<RetailPresetKey>> = [
  { value: "meat", label: "精肉店" },
  { value: "general", label: "汎用" },
];

