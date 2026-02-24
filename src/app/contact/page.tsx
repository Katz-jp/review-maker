"use client";

import { useState } from "react";
import Link from "next/link";

const industryOptions = [
  { value: "", label: "選択してください" },
  { value: "seikotsuin", label: "整骨院" },
  { value: "biyoshi", label: "美容室" },
  { value: "inshokuten", label: "飲食店" },
  { value: "other", label: "その他" },
];

export default function ContactPage() {
  const [storeName, setStoreName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [industry, setIndustry] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: storeName.trim(),
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          industry: industry || undefined,
          message: message.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "送信に失敗しました。");
        return;
      }
      setSuccess(true);
    } catch {
      setError("送信に失敗しました。しばらくしてからお試しください。");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-green-50 text-gray-800 antialiased">
        <header className="bg-white border-b border-green-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
            <Link
              href="/"
              className="text-lg font-bold text-gray-800 hover:text-primary-dark transition-colors"
            >
              口コミ作成AIアプリ
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-green-100 shadow-sm max-w-lg w-full text-center">
            <p className="text-green-600 font-semibold text-lg mb-2">送信完了</p>
            <p className="text-gray-700">
              お問い合わせありがとうございます。2営業日以内にご返信いたします。
            </p>
            <Link
              href="/"
              className="mt-6 inline-block px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-gray-900 font-medium transition-colors"
            >
              トップへ戻る
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-green-50 text-gray-800 antialiased">
      <header className="bg-white border-b border-green-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-bold text-gray-800 hover:text-primary-dark transition-colors"
          >
            口コミ作成AIアプリ
          </Link>
          <Link
            href="/#contact"
            className="text-sm font-medium text-gray-600 hover:text-primary-dark transition-colors"
          >
            トップへ
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 sm:py-12">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            お問い合わせ
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            無料トライアルやご質問はこちらからどうぞ。
          </p>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-6 sm:p-8 border border-green-100 shadow-sm space-y-5"
          >
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-1">
                店舗名 <span className="text-red-500">*</span>
              </label>
              <input
                id="storeName"
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="例: 〇〇整骨院"
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                お名前 <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="例: 山田 太郎"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="例: example@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                電話番号 <span className="text-gray-400 text-xs">（任意）</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="例: 03-1234-5678"
              />
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                業種
              </label>
              <select
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                {industryOptions.map((opt) => (
                  <option key={opt.value || "none"} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                お問い合わせ内容 <span className="text-gray-400 text-xs">（任意）</span>
              </label>
              <textarea
                id="message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
                placeholder="ご質問やご要望をご記入ください"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-dark text-gray-900 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {submitting ? "送信中…" : "送信する"}
            </button>
          </form>
        </div>
        <footer className="mt-12 py-6 text-center text-sm text-gray-500 border-t border-green-100">
          ©2026 くーままAIラボ
        </footer>
      </main>
    </div>
  );
}
