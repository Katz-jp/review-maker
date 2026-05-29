import { dentalConfig } from "./dental";
import type { IndustryConfig } from "./types";

export const DENTAL_INDUSTRY_KEY = "dental" as const;
export type IndustryKey = typeof DENTAL_INDUSTRY_KEY;

export type { IndustryConfig } from "./types";

/** 歯科クリニック向けの口コミ生成・アンケート設定 */
export function getIndustryConfig(): IndustryConfig {
  return dentalConfig;
}
