import type { Metadata } from "next";
import Link from "next/link";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "@/styles/ko-sans.css";
import "./globals.css";

const fallbackArabic = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "700"], variable: "--font-fallback-arabic" });

export const metadata: Metadata = { title: "الصفحة غير موجودة", robots: { index: false } };

export default function GlobalNotFound() {
  return (
    <html lang="ar" dir="rtl" className={fallbackArabic.variable}>
      <body>
        <main className="grid min-h-svh place-items-center bg-paper px-6 text-center">
          <div>
            <p className="font-latin text-sm tracking-[0.3em] text-muted">404</p>
            <h1 className="mt-4 text-3xl font-bold text-ink">الصفحة غير موجودة</h1>
            <Link href="/" className="btn btn-dark mt-8">
              العودة إلى الصفحة الرئيسية
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
