'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

async function getAuthCustomerId() {
  const cookieStore = await cookies();
  const customerIdStr = cookieStore.get('customer_auth')?.value;
  if (!customerIdStr) return null;
  return String(customerIdStr);
}

export async function saveAddress(formData: FormData) {
  const customerId = await getAuthCustomerId();
  if (!customerId) return { error: "Not authenticated" };

  const addressIdStr = formData.get('id') as string | null;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const company = formData.get('company') as string | null;
  const addressLine1 = formData.get('addressLine1') as string;
  const addressLine2 = formData.get('addressLine2') as string | null;
  const city = formData.get('city') as string;
  const state = formData.get('state') as string;
  const postalCode = formData.get('postalCode') as string;
  const country = formData.get('country') as string;
  const isDefaultShipping = formData.get('isDefaultShipping') === 'on';
  const isDefaultBilling = formData.get('isDefaultBilling') === 'on';

  if (!firstName || !lastName || !addressLine1 || !city || !state || !postalCode || !country) {
    return { error: "Missing required fields" };
  }

  try {
    // Handle default flags logic: if setting as default, unset others first
    if (isDefaultShipping) {
      await prisma.customerAddress.updateMany({
        where: { customerId, isDefaultShipping: true },
        data: { isDefaultShipping: false }
      });
    }
    if (isDefaultBilling) {
      await prisma.customerAddress.updateMany({
        where: { customerId, isDefaultBilling: true },
        data: { isDefaultBilling: false }
      });
    }

    if (addressIdStr) {
      // Update existing
      const addressId = String(addressIdStr);
      const existing = await prisma.customerAddress.findUnique({ where: { id: addressId } });
      if (!existing || existing.customerId !== customerId) {
        return { error: "Address not found or unauthorized" };
      }

      await prisma.customerAddress.update({
        where: { id: addressId },
        data: {
          firstName, lastName, company: company || null, addressLine1, addressLine2: addressLine2 || null, city, state, postalCode, country, isDefaultShipping, isDefaultBilling
        }
      });
    } else {
      // Create new
      await prisma.customerAddress.create({
        data: {
          customerId, firstName, lastName, company: company || null, addressLine1, addressLine2: addressLine2 || null, city, state, postalCode, country, isDefaultShipping, isDefaultBilling
        }
      });
    }

    revalidatePath('/account/addresses');
    revalidatePath('/checkout');
    return { success: true };
  } catch (error: any) {
    console.error("Address save error:", error);
    return { error: "Failed to save address" };
  }
}

export async function deleteAddress(addressIdStr: string) {
  const customerId = await getAuthCustomerId();
  if (!customerId) return { error: "Not authenticated" };

  try {
    const addressId = String(addressIdStr);
    const existing = await prisma.customerAddress.findUnique({ where: { id: addressId } });
    if (!existing || existing.customerId !== customerId) {
      return { error: "Address not found or unauthorized" };
    }

    await prisma.customerAddress.delete({ where: { id: addressId } });
    revalidatePath('/account/addresses');
    revalidatePath('/checkout');
    return { success: true };
  } catch (error: any) {
    return { error: "Failed to delete address" };
  }
}

export async function setDefaultAddress(addressIdStr: string, type: 'shipping' | 'billing') {
  const customerId = await getAuthCustomerId();
  if (!customerId) return { error: "Not authenticated" };

  try {
    const addressId = String(addressIdStr);
    const existing = await prisma.customerAddress.findUnique({ where: { id: addressId } });
    if (!existing || existing.customerId !== customerId) {
      return { error: "Address not found or unauthorized" };
    }

    if (type === 'shipping') {
      await prisma.customerAddress.updateMany({
        where: { customerId, isDefaultShipping: true },
        data: { isDefaultShipping: false }
      });
      await prisma.customerAddress.update({
        where: { id: addressId },
        data: { isDefaultShipping: true }
      });
    } else {
      await prisma.customerAddress.updateMany({
        where: { customerId, isDefaultBilling: true },
        data: { isDefaultBilling: false }
      });
      await prisma.customerAddress.update({
        where: { id: addressId },
        data: { isDefaultBilling: true }
      });
    }

    revalidatePath('/account/addresses');
    revalidatePath('/checkout');
    return { success: true };
  } catch (error: any) {
    return { error: "Failed to update default address" };
  }
}
