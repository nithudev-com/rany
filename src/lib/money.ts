import { prisma } from "@/lib/prisma";
import { cache } from "react";

export const getDefaultCurrency = cache(async () => {
  try {
    return await prisma.currency.findFirst({
      where: { isDefault: true, isActive: true }
    });
  } catch (e) {
    return null;
  }
});

export async function formatPrice(value: number | string | null | undefined, currency?: string) {
  const amount = Number(value ?? 0);
  
  let code = currency;
  if (!code) {
    const defaultCurrency = await getDefaultCurrency();
    code = defaultCurrency?.code || "CAD";
  }

  let locale = "en-US";
  if (code === "INR") locale = "en-IN";
  else if (code === "EUR") locale = "de-DE";
  else if (code === "GBP") locale = "en-GB";
  else if (code === "CAD") locale = "en-CA";

  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    maximumFractionDigits: 0
  }).format(amount);

  return `${formatted} ${code}`;
}
