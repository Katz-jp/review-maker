const TOP_PAGE_URL = "https://review-maker-sable.vercel.app/";

export default function AppFooter() {
  return (
    <footer className="border-t border-green-100 bg-white/90 py-4 text-center text-sm text-gray-600">
      <div className="space-y-1">
        <p>
          <a
            href={TOP_PAGE_URL}
            className="font-medium text-primary-dark underline decoration-primary-dark/70 underline-offset-2 hover:decoration-primary-dark"
            target="_blank"
            rel="noopener noreferrer"
          >
            口コミ投稿サポートAI
          </a>
        </p>
        <p>by くーママAIラボ</p>
      </div>
    </footer>
  );
}
