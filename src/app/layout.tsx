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
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Toaster 
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '8px',
              padding: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            },
          }} 
        />
        {children}
      </body>
    </html>
  );
}
