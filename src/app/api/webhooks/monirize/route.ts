import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus, EmailChannel } from '@prisma/client';
import crypto from 'crypto';
import { queueEmail } from '@/lib/email/queue';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    
    const {
      signature,
      merchantId,
      orderRef,
      transactionRef,
      amount,
      currency,
      status
    } = payload;

    // 1. Fetch Monirize config from DB
    const gateway = await prisma.paymentGateway.findUnique({
      where: { name: 'Monirize' }
    });

    if (!gateway || !gateway.isActive) {
      console.error('[Monirize Webhook] Gateway not found or inactive');
      return NextResponse.json({ error: 'Gateway unavailable' }, { status: 400 });
    }

    if (gateway.merchantId !== merchantId) {
      console.error('[Monirize Webhook] Merchant ID mismatch');
      return NextResponse.json({ error: 'Invalid merchant' }, { status: 400 });
    }

    if (!gateway.secretKey) {
      console.error('[Monirize Webhook] Secret key not configured');
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
    }

    // 2. Verify signature/checksum
    // A typical checksum includes orderRef, amount, currency, and status
    const dataToSign = `${orderRef}${amount}${currency}${status}`;
    const calculatedSignature = crypto
      .createHmac('sha256', gateway.secretKey)
      .update(dataToSign)
      .digest('hex');

    if (calculatedSignature !== signature) {
      console.error('[Monirize Webhook] Signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 3. Find the Order
    const order = await prisma.order.findUnique({
      where: { orderNumber: orderRef }
    });

    if (!order) {
      console.error(`[Monirize Webhook] Order not found: ${orderRef}`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 4. Idempotency Check
    if (order.status === 'PAID' || order.status === 'FAILED' || order.status === 'CANCELLED') {
      console.log(`[Monirize Webhook] Order ${orderRef} is already processed (${order.status}). Acknowledging.`);
      return NextResponse.json({ message: 'Already processed' }, { status: 200 });
    }

    // 5. Verify Amount and Currency Match
    // In Prisma, totalAmount is a Decimal. Convert to Number for safe comparison.
    const dbAmount = Number(order.totalAmount);
    const payloadAmount = Number(amount);

    // Allowing small floating point differences, e.g. 149.00 vs 149
    if (Math.abs(dbAmount - payloadAmount) > 0.01) {
      console.error(`[Monirize Webhook] Amount mismatch. DB: ${dbAmount}, Payload: ${payloadAmount}`);
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
    }

    if (order.currency.toUpperCase() !== currency.toUpperCase()) {
      console.error(`[Monirize Webhook] Currency mismatch. DB: ${order.currency}, Payload: ${currency}`);
      return NextResponse.json({ error: 'Currency mismatch' }, { status: 400 });
    }

    // 6. Update Order Status
    let newStatus: OrderStatus = order.status;
    if (status === 'SUCCESS' || status === 'PAID') {
      newStatus = OrderStatus.PAID;
    } else if (status === 'FAILED') {
      newStatus = OrderStatus.FAILED;
    } else if (status === 'CANCELLED') {
      newStatus = OrderStatus.CANCELLED;
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: newStatus,
        paymentRef: transactionRef,
      }
    });

    if (newStatus === OrderStatus.PAID) {
      try {
        await queueEmail({
          idempotencyKey: `order-conf-${order.id}-${Date.now()}`,
          channel: EmailChannel.TRANSACTIONAL,
          recipientEmail: order.customerEmail,
          templateName: 'order_confirmation',
          payload: { orderNumber: order.orderNumber, totalAmount: order.totalAmount.toString() },
          customerId: order.customerId?.toString()
        });
      } catch (e) {
        console.error("Failed to queue order confirmation email:", e);
      }
    }

    console.log(`[Monirize Webhook] Successfully updated order ${orderRef} to ${newStatus}`);
    
    // Store only safe metadata, protect secrets -> we only saved paymentRef
    return NextResponse.json({ message: 'OK' }, { status: 200 });

  } catch (error) {
    console.error('[Monirize Webhook] Internal error handling webhook:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
