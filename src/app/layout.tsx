import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import AppFooter from "@/components/AppFooter";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";
import "./globals.css";

const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const metadata: Metadata = {
  title: BRAND_NAME,
  description: `${BRAND_TAGLINE}。Googleマップの口コミをAIがサポート。あなたの体験を伝えやすくします。`,
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-green-50 text-gray-800 antialiased">
        <div className="flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
          <AppFooter />
        </div>
        {process.env.NODE_ENV === "production" && gaId ? (
          <GoogleAnalytics gaId={gaId} />
        ) : null}
      </body>
    </html>
  );
}
