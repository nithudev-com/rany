import { prisma } from '@/lib/prisma';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getStoreSettings } from "@/services/settings";
import { CartProvider } from "@/context/CartContext";
import { SlideOutCart } from "@/components/SlideOutCart";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { LiveChatWidget } from "@/components/LiveChatWidget";
export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeSettings = await getStoreSettings();
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: { children: { include: { children: true } } },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    take: 20
  });

  const safeSettings = JSON.parse(JSON.stringify(storeSettings, (k, v) => typeof v === 'bigint' ? v.toString() : v));
  const safeCategories = JSON.parse(JSON.stringify(categories, (k, v) => typeof v === 'bigint' ? v.toString() : v));

  return (
    <CartProvider>
      <Header settings={safeSettings} categories={safeCategories} />
      {children}
      <Footer settings={safeSettings} />
      <SlideOutCart />
      <MobileBottomNav />
      <LiveChatWidget />
    </CartProvider>
  );
}
