import Link from "next/link";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

export default function AppFooter() {
  return (
    <footer className="border-t border-green-100 bg-white/90 py-4 text-center text-sm text-gray-600">
      <div className="space-y-1">
        <p className="font-medium text-primary-dark">
          <Link href="/" className="hover:underline">
            {BRAND_NAME}
          </Link>
        </p>
        <p className="text-xs text-gray-500">{BRAND_TAGLINE}</p>
        <p>by くーままAIラボ</p>
      </div>
    </footer>
  );
}
