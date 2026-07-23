'use server';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

async function getCustomerId(): Promise<string | null> {
  const cookieStore = await cookies();
  const val = cookieStore.get('customer_auth')?.value;
  return val ? String(val) : null;
}

export async function updateProfile(formData: FormData) {
  const customerId = await getCustomerId();
  if (!customerId) return { success: false, error: 'Unauthorized' };

  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const phone = formData.get('phone') as string;

  if (!firstName || !lastName) {
    return { success: false, error: 'First name and last name are required.' };
  }

  try {
    await prisma.customer.update({
      where: { id: customerId },
      data: { firstName, lastName, phone: phone || null }
    });
    
    revalidatePath('/account/profile');
    revalidatePath('/account');
    return { success: true, message: 'Profile updated successfully.' };
  } catch (error) {
    return { success: false, error: 'Failed to update profile.' };
  }
}

export async function updateSecurity(formData: FormData) {
  const customerId = await getCustomerId();
  if (!customerId) return { success: false, error: 'Unauthorized' };

  const currentPassword = formData.get('currentPassword') as string;
  const newEmail = formData.get('email') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmNewPassword = formData.get('confirmNewPassword') as string;

  if (!currentPassword) {
    return { success: false, error: 'Current password is required to make security changes.' };
  }

  if (newPassword && newPassword !== confirmNewPassword) {
    return { success: false, error: 'New passwords do not match.' };
  }

  try {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) return { success: false, error: 'Customer not found.' };

    const isMatch = await bcrypt.compare(currentPassword, customer.passwordHash);
    if (!isMatch) {
      return { success: false, error: 'Incorrect current password.' };
    }

    const updateData: any = {};
    
    if (newEmail && newEmail.toLowerCase() !== customer.email.toLowerCase()) {
      // Check if email is already taken
      const existing = await prisma.customer.findUnique({ where: { email: newEmail.toLowerCase() } });
      if (existing) {
        return { success: false, error: 'This email is already in use by another account.' };
      }
      updateData.email = newEmail.toLowerCase();
    }

    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    if (Object.keys(updateData).length === 0) {
      return { success: false, error: 'No new changes provided.' };
    }

    await prisma.customer.update({
      where: { id: customerId },
      data: updateData
    });

    revalidatePath('/account/profile');
    return { success: true, message: 'Security settings updated successfully.' };
  } catch (error) {
    console.error('Security update error:', error);
    return { success: false, error: 'Failed to update security settings.' };
  }
}
