'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function getCustomerOrders() {
  try {
    const cookieStore = await cookies();
    const customerIdStr = cookieStore.get('customer_auth')?.value;
    if (!customerIdStr) return { success: false, orders: [] };

    const orders = await prisma.order.findMany({
      where: { customerId: String(customerIdStr) },
      orderBy: { createdAt: 'desc' },
      select: { orderNumber: true, createdAt: true }
    });
    
    return { 
      success: true, 
      orders: orders.map(o => ({
        orderNumber: o.orderNumber,
        createdAt: o.createdAt.toISOString()
      }))
    };
  } catch (error) {
    return { success: false, orders: [] };
  }
}

export async function getConversation(guestToken: string) {
  try {
    const conversation = await prisma.contactConversation.findUnique({
      where: { guestToken },
      include: { messages: true }
    });

    if (!conversation) {
      return { success: true, conversation: null };
    }

    // Serialize bigints and dates for client components
    return {
      success: true,
      conversation: {
        ...conversation,
        id: conversation.id.toString(),
        customerId: conversation.customerId?.toString(),
        assignedAdminId: conversation.assignedAdminId?.toString(),
        messages: conversation.messages.map(m => ({
          ...m,
          id: m.id.toString(),
          conversationId: m.conversationId.toString(),
          senderCustomerId: m.senderCustomerId?.toString(),
          senderAdminId: m.senderAdminId?.toString(),
        }))
      }
    };
  } catch (error: any) {
    console.error("Chat Error (getConversation):", error);
    return { success: false, error: error.message };
  }
}

export async function startConversation(guestToken: string, data: { category: string, orderId: string, subject: string }) {
  try {
    const cookieStore = await cookies();
    const customerIdStr = cookieStore.get('customer_auth')?.value;
    const customerId = customerIdStr ? String(customerIdStr) : null;

    let conversation = await prisma.contactConversation.findUnique({
      where: { guestToken }
    });

    if (!conversation) {
      conversation = await prisma.contactConversation.create({
        data: {
          guestToken,
          customerId,
          guestName: 'Dashboard User',
          guestEmail: '',
          subject: data.subject || 'Live Chat Support',
          category: data.category || 'SUPPORT',
          orderId: data.orderId || null,
          source: 'LIVE_CHAT',
          status: 'NEW',
          priority: 'NORMAL',
        }
      });
      revalidatePath('/admin/messages');
    }
    return { success: true, conversationId: conversation.id.toString() };
  } catch (error: any) {
    console.error("Chat Error (startConversation):", error);
    return { success: false, error: error.message };
  }
}

export async function sendChatMessage(guestToken: string, messageBody: string) {
  try {
    if (!messageBody.trim()) return { success: false, error: 'Message cannot be empty' };

    const conversation = await prisma.contactConversation.findUnique({
      where: { guestToken }
    });

    if (!conversation) return { success: false, error: 'Conversation not found' };

    const cookieStore = await cookies();
    const customerIdStr = cookieStore.get('customer_auth')?.value;

    const message = await prisma.contactMessage.create({
      data: {
        conversationId: conversation.id,
        senderType: customerIdStr ? 'CUSTOMER' : 'GUEST',
        senderCustomerId: customerIdStr ? String(customerIdStr) : null,
        body: messageBody,
      }
    });

    await prisma.contactConversation.update({
      where: { id: conversation.id },
      data: {
        status: 'AWAITING_ADMIN',
        lastReplyAt: new Date(),
        isReadByAdmin: false,
      }
    });

    revalidatePath('/admin/messages');

    return { 
      success: true, 
      message: {
        ...message,
        id: message.id.toString(),
        conversationId: message.conversationId.toString(),
      }
    };
  } catch (error: any) {
    console.error("Chat Error (sendMessage):", error);
    return { success: false, error: error.message };
  }
}

export async function pollChatMessages(guestToken: string) {
  try {
    const conversation = await prisma.contactConversation.findUnique({
      where: { guestToken },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!conversation) return { success: false, messages: [] };

    return {
      success: true,
      messages: conversation.messages.map(m => ({
        ...m,
        id: m.id.toString(),
        conversationId: m.conversationId.toString(),
        senderCustomerId: m.senderCustomerId?.toString(),
        senderAdminId: m.senderAdminId?.toString(),
      }))
    };
  } catch (error: any) {
    return { success: false, messages: [] };
  }
}
