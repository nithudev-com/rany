'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

async function getCustomerId() {
  const cookieStore = await cookies();
  const customerIdStr = cookieStore.get('customer_auth')?.value;
  if (!customerIdStr) throw new Error('Not authenticated');
  return String(customerIdStr);
}

export async function customerReplyMessage(formData: FormData) {
  try {
    const customerId = await getCustomerId();
    const conversationIdStr = formData.get('conversationId') as string;
    const message = formData.get('message') as string;
    
    if (!message) return { success: false, error: 'Message cannot be empty' };

    const conversation = await prisma.contactConversation.findUnique({
      where: { conversationId: conversationIdStr }
    });

    if (!conversation || conversation.customerId !== customerId) {
      return { success: false, error: 'Conversation not found or unauthorized' };
    }

    await prisma.$transaction([
      prisma.contactMessage.create({
        data: {
          conversationId: conversation.id,
          senderType: 'CUSTOMER',
          senderCustomerId: customerId,
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

    revalidatePath(`/account/messages/${conversationIdStr}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
