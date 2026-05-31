import { BRAND_NAME } from "@/lib/brand";

/** 料金に含まれる主な内容（LP・料金周りで共有） */
export const POSTING_SUPPORT_INCLUSIONS_TITLE = `${BRAND_NAME}に含まれているもの` as const;

export const POSTING_SUPPORT_INCLUSION_ITEMS: readonly string[] = [
  "患者さまに渡す口コミ依頼のQRコード付きカード（100枚〜）",
  "名前入りオリジナルのウェブサイト（トップページに「〇〇歯科医院」のように医院名が入ります）",
  "無制限で使えるAI文章作成機能",
  "口コミ返信ヘルプAI（受け取った口コミ文を貼り付けるだけで、適切な返信文を瞬時に作成します）",
  "オリジナル選択肢の追加・削除機能（オリジナルのメニューや検索で引っかかって欲しいキーワードを選択肢に追加できます）",
  "年中無休のメールサポート（使い方がわからない、Webサイトの調子がおかしい、QRカードを追加で欲しい、などお気軽にお知らせください）",
];
