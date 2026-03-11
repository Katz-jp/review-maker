import { seikotsuConfig } from "./seikotsu";
import { dentalConfig } from "./dental";
import { getRetailConfig, defaultRetailPreset, retailPresets } from "./retail";
import type { IndustryConfig } from "./types";

/** 業種ごとの設定。retail は preset で中身が変わる */
export const industries = {
  seikotsu: seikotsuConfig,
  dental: dentalConfig,
  retail: {
    presets: retailPresets,
    defaultPreset: defaultRetailPreset,
    getConfig: getRetailConfig,
  },
} as const;

export type IndustryKey = keyof typeof industries;

export type { RetailPresetKey } from "./retail";
export type { IndustryConfig } from "./types";

/**
 * 業種と（retail の場合は preset）から実際の設定を取得する
 */
export function getIndustryConfig(industryKey: IndustryKey, retailPreset?: string): IndustryConfig {
  if (industryKey === "seikotsu") {
    return seikotsuConfig;
  }
  if (industryKey === "dental") {
    return dentalConfig;
  }
  return industries.retail.getConfig(retailPreset);
}
