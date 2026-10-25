import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "إدارة المحتوى",
  robots: { index: false, follow: false, nocache: true },
};

/** Separate root layout: the Studio is a left-to-right app and must not inherit the site's RTL shell, fonts or smooth scrolling. */
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
