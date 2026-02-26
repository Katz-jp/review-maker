import { industries, type IndustryKey } from "./industries";

/** 返信ヘルプ用：業種ごとの呼称・表現 */
export type ReplyIndustryTerms = {
  /** 役割説明用ラベル（例: 整骨院・接骨院 / 小売店） */
  roleLabel: string;
  /** 返信文で自店舗を指す語（当院 / 当店） */
  selfRef: string;
  /** ルール説明用の自店舗表現（自院 / 自店） */
  instructionSelf: string;
  /** 再来を促す表現（再来院 / 再来店） */
  visitAgain: string;
  /** 医療系の注意事項ブロックを含めるか */
  hasMedicalNotice: boolean;
};

const REPLY_TERMS: Record<IndustryKey, ReplyIndustryTerms> = {
  seikotsu: {
    roleLabel: "整骨院・接骨院",
    selfRef: "当院",
    instructionSelf: "自院",
    visitAgain: "再来院",
    hasMedicalNotice: true,
  },
  retail: {
    roleLabel: "小売店",
    selfRef: "当店",
    instructionSelf: "自店",
    visitAgain: "再来店",
    hasMedicalNotice: false,
  },
};

/**
 * 業種（と retail の場合は preset）から返信用の呼称を取得する。
 * 不正な industry の場合は整骨院として扱う。
 */
export function getReplyIndustryTerms(
  industry: string | undefined,
  _retailPreset?: string
): ReplyIndustryTerms {
  const key: IndustryKey = Object.hasOwn(industries, industry ?? "")
    ? (industry as IndustryKey)
    : "seikotsu";
  return REPLY_TERMS[key];
}
