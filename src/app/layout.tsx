import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
// @ts-ignore
import { globalCss } from "./globalsStyles";
import { Toaster } from "react-hot-toast";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "optional",
  variable: "--font-plus-jakarta",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "optional",
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rany.uk"),
  title: {
    default: "Rani Fashions Design & Tailoring | Rany.uk",
    template: "%s | Rany.uk"
  },
  description: "Discover Rani Fashions Design & Tailoring at Rany.uk. Premium fashion, design, and tailoring services.",
  keywords: ["fashion", "tailoring", "design", "rany", "rani fashions"],
  openGraph: {
    title: "Rani Fashions Design & Tailoring | Rany.uk",
    description: "Discover Rani Fashions Design & Tailoring at Rany.uk. Premium fashion, design, and tailoring services.",
    url: "https://rany.uk",
    siteName: "Rany.uk",
    images: [
      {
        url: "/fashion-bg.png",
        width: 1200,
        height: 630,
        alt: "Rani Fashions Design & Tailoring",
      },
      {
        url: "/logo.png",
        width: 500,
        height: 500,
        alt: "Rany.uk Logo",
      }
    ],
    locale: "en_GB",
    type: "website",
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${playfair.variable}`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: globalCss }} />
        <link rel="preconnect" href="https://cdn.shopify.com" />
        <link rel="dns-prefetch" href="https://cdn.shopify.com" />
      </head>
      <body style={{ fontFamily: 'var(--font-plus-jakarta), Arial, sans-serif' }}>
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
