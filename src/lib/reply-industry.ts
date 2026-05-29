/** 返信ヘルプ用：歯科クリニック向けの呼称・表現 */
export type ReplyIndustryTerms = {
  roleLabel: string;
  selfRef: string;
  instructionSelf: string;
  visitAgain: string;
  hasMedicalNotice: boolean;
};

const DENTAL_REPLY_TERMS: ReplyIndustryTerms = {
  roleLabel: "歯科クリニック",
  selfRef: "当院",
  instructionSelf: "自院",
  visitAgain: "再来院",
  hasMedicalNotice: true,
};

/** 返信用の呼称を取得する（歯科専用） */
export function getReplyIndustryTerms(): ReplyIndustryTerms {
  return DENTAL_REPLY_TERMS;
}
