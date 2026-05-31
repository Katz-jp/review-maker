"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

const SCROLL_THRESHOLD = 300;

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-4 sm:right-6 z-40 inline-flex items-center gap-1.5 rounded-full bg-white border border-green-200 px-4 py-2.5 text-sm font-medium text-gray-700 shadow-md hover:bg-green-50 hover:border-primary/40 hover:text-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      aria-label="ページ上部に戻る"
    >
      <ChevronUp className="w-4 h-4 shrink-0" aria-hidden />
      ページ上部へ
    </button>
  );
}
