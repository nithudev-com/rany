import { prisma } from '@/lib/prisma';
import { revalidateTag } from 'next/cache';

export async function getStoreSettings() {
  try {
    let settings = await prisma.storeSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {
          id: 1,
          storeName: "SexToys Lovers",
          storeDescription: "Your premium destination for the world's best products. Fast shipping, secure payments, and 24/7 support.",
          facebookUrl: "https://facebook.com",
          twitterUrl: "https://twitter.com",
          instagramUrl: "https://instagram.com",
          taxEnabled: false,
          taxIncludedInPrices: false,
          taxRate: 0
        }
      });
    }
    return settings;
  } catch (error) {
    console.error("Failed to get store settings:", error);
    return {
      storeName: "SexToys Lovers",
      storeDescription: "Your premium destination for the world's best products. Fast shipping, secure payments, and 24/7 support.",
      facebookUrl: "",
      twitterUrl: "",
      instagramUrl: "",
      taxEnabled: false,
      taxIncludedInPrices: false,
      taxRate: 0
    };
  }
}

export async function updateStoreSettings(data: any) {
  try {
    const settings = await prisma.storeSettings.upsert({
      where: { id: 1 },
      update: {
        storeName: data.storeName,
        storeDescription: data.storeDescription,
        facebookUrl: data.facebookUrl,
        twitterUrl: data.twitterUrl,
        instagramUrl: data.instagramUrl,
        taxEnabled: data.taxEnabled !== undefined ? data.taxEnabled : undefined,
        taxIncludedInPrices: data.taxIncludedInPrices !== undefined ? data.taxIncludedInPrices : undefined,
        taxRate: data.taxRate !== undefined ? data.taxRate : undefined,
      },
      create: {
        id: 1,
        storeName: data.storeName,
        storeDescription: data.storeDescription,
        facebookUrl: data.facebookUrl,
        twitterUrl: data.twitterUrl,
        instagramUrl: data.instagramUrl,
        taxEnabled: data.taxEnabled || false,
        taxIncludedInPrices: data.taxIncludedInPrices || false,
        taxRate: data.taxRate || 0,
      }
    });

    // Revalidate frontend layout
    revalidateTag('store-settings');
    return { success: true, settings };
  } catch (error) {
    console.error("Failed to update store settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}
