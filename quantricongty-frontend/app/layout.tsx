import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "Đông Hải - Hệ Thống Quản Trị Doanh Nghiệp",
  description: "Cổng điều hành và quản trị nhân sự nội bộ Công ty Đông Hải",
  icons: {
    icon: "/donghai-logo.png",
    shortcut: "/donghai-logo.png",
    apple: "/donghai-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${plusJakarta.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50/60 text-slate-900 font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
