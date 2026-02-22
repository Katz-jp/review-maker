import { retailMeatConfig } from "./meat";
import { retailGeneralConfig } from "./general";
import type { IndustryConfig } from "../types";

export const retailPresets = {
  meat: retailMeatConfig,
  general: retailGeneralConfig,
} as const;

export type RetailPresetKey = keyof typeof retailPresets;

export const defaultRetailPreset: RetailPresetKey = "meat";

export function getRetailConfig(preset: string | undefined): IndustryConfig {
  const key: RetailPresetKey =
    preset && Object.hasOwn(retailPresets, preset) ? (preset as RetailPresetKey) : defaultRetailPreset;
  return retailPresets[key];
}
