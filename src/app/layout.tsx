import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "口コミ作成支援 | 整骨院",
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
        {children}
      </body>
    </html>
  );
}
