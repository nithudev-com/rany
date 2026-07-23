import { prisma } from '@/lib/prisma';
import { revalidateTag } from 'next/cache';

export async function getStoreSettings() {
  try {
    let settings = await prisma.storeSettings.findFirst();

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {
          storeName: "Rany.uk",
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
      storeName: "Rany.uk",
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
    const existing = await prisma.storeSettings.findFirst();
    let settings;
    if (existing) {
      settings = await prisma.storeSettings.update({
        where: { id: existing.id },
        data: {
          storeName: data.storeName,
          storeDescription: data.storeDescription,
          facebookUrl: data.facebookUrl,
          twitterUrl: data.twitterUrl,
          instagramUrl: data.instagramUrl,
          taxEnabled: data.taxEnabled !== undefined ? data.taxEnabled : undefined,
          taxIncludedInPrices: data.taxIncludedInPrices !== undefined ? data.taxIncludedInPrices : undefined,
          taxRate: data.taxRate !== undefined ? data.taxRate : undefined,
        }
      });
    } else {
      settings = await prisma.storeSettings.create({
        data: {
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
    }

    // Revalidate frontend layout
    revalidateTag('store-settings');
    return { success: true, settings };
  } catch (error) {
    console.error("Failed to update store settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}
