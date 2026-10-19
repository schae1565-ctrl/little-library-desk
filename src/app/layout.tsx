import type { Metadata } from "next";
import "./globals.css";
import { BottomTabs, Sidebar } from "@/components/nav";
import { StatusBanner } from "@/components/status-banner";

export const metadata: Metadata = {
  title: "Little Library Desk",
  description: "작은도서관 통합 운영관리툴",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-full flex">
        <Sidebar />
        <div className="flex-1 min-w-0 pb-20 md:pb-0">
          <StatusBanner />
          <main className="mx-auto max-w-[1280px] px-4 py-8 md:px-12">{children}</main>
        </div>
        <BottomTabs />
      </body>
    </html>
  );
}
