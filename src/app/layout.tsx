import type { Metadata } from "next";
import AppFooter from "@/components/AppFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: "口コミ投稿サポートAI",
  description: "Googleマップの口コミをAIがサポート。あなたの体験を伝えやすくします。",
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
      </body>
    </html>
  );
}
