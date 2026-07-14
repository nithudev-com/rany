import type { Metadata } from "next";
// @ts-ignore
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SexToys Lovers",
    template: "%s | SexToys Lovers"
  },
  description: "Next.js ecommerce starter optimized for ISR, speed, SEO, PostgreSQL, Redis, and product imports."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
