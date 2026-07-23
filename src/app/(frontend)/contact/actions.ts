'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function submitContactMessage(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const customerIdStr = cookieStore.get('customer_auth')?.value;
    const customerId = customerIdStr ? String(customerIdStr) : null;

    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string | null;
    const category = formData.get('category') as string;
    const orderId = formData.get('orderId') as string | null;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;
    const acceptPolicy = formData.get('acceptPolicy');

    if (!acceptPolicy) return { success: false, error: 'You must accept the privacy policy.' };
    if (!email || !subject || !message || !category) return { success: false, error: 'Please fill in all required fields.' };

    const guestToken = customerId ? null : crypto.randomBytes(32).toString('hex');
    const guestName = customerId ? null : `${firstName} ${lastName}`.trim();

    const conversation = await prisma.contactConversation.create({
      data: {
        customerId,
        guestName,
        guestEmail: customerId ? null : email,
        guestPhone: customerId ? null : phone,
        guestToken,
        category,
        orderId: orderId || null,
        subject,
        messages: {
          create: {
            senderType: customerId ? 'CUSTOMER' : 'GUEST',
            senderCustomerId: customerId,
            body: message
          }
        }
      }
    });

    if (!customerId) {
      // For guests, we return the token so the UI can direct them to the secure guest view.
      return { success: true, guestToken, conversationId: conversation.conversationId };
    }

    return { success: true, conversationId: conversation.conversationId };
  } catch (error: any) {
    return { success: false, error: error.message || 'An error occurred while submitting your message.' };
  }
}

export async function guestReplyMessage(formData: FormData) {
  try {
    const conversationIdStr = formData.get('conversationId') as string;
    const guestToken = formData.get('guestToken') as string;
    const message = formData.get('message') as string;
    
    if (!message) return { success: false, error: 'Message cannot be empty' };

    const conversation = await prisma.contactConversation.findUnique({
      where: { conversationId: conversationIdStr, guestToken }
    });

    if (!conversation) {
      return { success: false, error: 'Conversation not found or unauthorized' };
    }

    await prisma.$transaction([
      prisma.contactMessage.create({
        data: {
          conversationId: conversation.id,
          senderType: 'GUEST',
          body: message
        }
      }),
      prisma.contactConversation.update({
        where: { id: conversation.id },
        data: { 
          isReadByAdmin: false, 
          lastReplyAt: new Date(),
          status: conversation.status === 'CLOSED' || conversation.status === 'RESOLVED' ? 'OPEN' : conversation.status 
        }
      })
    ]);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
