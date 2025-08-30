import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link"
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StockInfo",
  description: "주식관련 정보를 제공.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* 상단 네비게이션 */}
        <nav className="bg-gray-800 text-white p-4 flex gap-4">
          <Link href="/">홈</Link>
          <Link href="/stocks/di20">급락 종목</Link>
          <Link href="/markets/nasdaq100/returns">수익률 대시보드</Link>
          <Link href="/stocks/new-high/52w">신고가 종목</Link>
        </nav>

        {/* 페이지 컨텐츠 */}
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
