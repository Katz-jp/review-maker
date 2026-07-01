import {
  POSTING_SUPPORT_INCLUSIONS_TITLE,
  POSTING_SUPPORT_INCLUSION_ITEMS,
} from "@/lib/posting-support-inclusions";

type PostingSupportInclusionsSectionProps = {
  /** セクションラッパーに付与するクラス（背景・余白など） */
  className?: string;
};

export default function PostingSupportInclusionsSection({
  className = "px-4 sm:px-6 py-12 sm:py-16 bg-white border-y border-green-100",
}: PostingSupportInclusionsSectionProps) {
  return (
    <section className={className} aria-labelledby="posting-support-inclusions-heading">
      <div className="max-w-3xl mx-auto">
        <h2
          id="posting-support-inclusions-heading"
          className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3 pb-3 border-b-2 border-primary/50"
        >
          {POSTING_SUPPORT_INCLUSIONS_TITLE}
        </h2>
        <p className="text-center text-sm sm:text-base text-gray-600 mb-8">
          月額プランに含まれるサービス
        </p>
        <ul className="space-y-3 text-base sm:text-lg text-gray-700">
          {POSTING_SUPPORT_INCLUSION_ITEMS.map((text) => (
            <li key={text}>・{text}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
