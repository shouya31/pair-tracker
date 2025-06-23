import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ペアトラッカー",
  description: "チームとペアの管理アプリケーション",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <nav className="bg-gray-800 text-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="text-xl font-bold">
                ペアトラッカー
              </Link>
              <div className="flex space-x-4">
                <Link
                  href="/teams"
                  className="px-3 py-2 rounded-md hover:bg-gray-700"
                >
                  チーム一覧
                </Link>
                <Link
                  href="/teams/create"
                  className="px-3 py-2 rounded-md hover:bg-gray-700"
                >
                  チーム作成
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
