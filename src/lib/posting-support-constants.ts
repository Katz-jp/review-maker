import type { IndustryKey } from "@/lib/industries";

/** 口コミ投稿サポート（アンケート〜生成）は歯科・クリニック専用 */
export const POSTING_SUPPORT_INDUSTRY: IndustryKey = "dental";

/** trial の sessionStorage（既存の TRIAL_INDUSTRY_KEY と整合） */
export const TRIAL_POSTING_SESSION_INDUSTRY_ID = "haisha";
