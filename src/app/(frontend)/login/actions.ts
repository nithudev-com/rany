'use server';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { queueEmail } from '@/lib/email/queue';
import { EmailChannel } from '@prisma/client';

export async function customerLogin(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const rememberMe = formData.get('rememberMe') === 'on';

  if (!email || !password) {
    return { success: false, error: 'Email and password are required' };
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!customer) {
      return { success: false, error: 'Invalid email or password' };
    }

    const isMatch = await bcrypt.compare(password, customer.passwordHash);

    if (isMatch) {
      const cookieStore = await cookies();
      
      // If remember me is checked, session lasts 30 days, else session cookie (expires on close)
      const maxAge = rememberMe ? 30 * 24 * 60 * 60 : undefined;
      
      cookieStore.set('customer_auth', customer.id.toString(), {
        path: '/',
        maxAge: maxAge,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
      
      return { success: true };
    }

    return { success: false, error: 'Invalid email or password' };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function customerRegister(formData: FormData) {
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  const phone = formData.get('phone') as string;
  const acceptTerms = formData.get('acceptTerms') === 'on';
  const marketingConsent = formData.get('marketingConsent') === 'on';
  const ageConfirmed = formData.get('ageConfirmed') === 'on';

  if (!email || !password || !firstName) {
    return { success: false, error: 'First name, email, and password are required' };
  }

  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match' };
  }

  if (!acceptTerms) {
    return { success: false, error: 'You must accept the Terms of Service and Privacy Policy' };
  }

  if (!ageConfirmed) {
    return { success: false, error: 'You must confirm that you meet the minimum age requirement' };
  }

  try {
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingCustomer) {
      return { success: false, error: 'An account with this email already exists' };
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const customer = await prisma.customer.create({
      data: {
        firstName,
        lastName,
        phone,
        acceptTerms,
        marketingConsent,
        ageConfirmed,
        email: email.toLowerCase(),
        passwordHash,
        emailPreferences: {
          create: {
            globalUnsubscribe: false,
          }
        }
      },
    });

    try {
      await queueEmail({
        idempotencyKey: `welcome-${customer.id}-${Date.now()}`,
        channel: EmailChannel.TRANSACTIONAL,
        recipientEmail: customer.email,
        templateName: 'welcome_email',
        payload: { firstName: customer.firstName || 'there' },
        customerId: customer.id.toString()
      });
    } catch (e) {
      console.error("Failed to queue welcome email:", e);
    }

    // Automatically log in the new user
    const cookieStore = await cookies();
    cookieStore.set('customer_auth', customer.id.toString(), {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return { success: true };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'An unexpected error occurred during registration' };
  }
}

export async function customerLogout() {
  const cookieStore = await cookies();
  cookieStore.delete('customer_auth');
}
