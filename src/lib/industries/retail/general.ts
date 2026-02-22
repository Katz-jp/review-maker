import type { IndustryConfig } from "../types";
import { retailMeatConfig } from "./meat";

/** 汎用小売店プリセット（現状は精肉店と同じ。製菓店・八百屋など追加時に差し替え可能） */
export const retailGeneralConfig: IndustryConfig = retailMeatConfig;
