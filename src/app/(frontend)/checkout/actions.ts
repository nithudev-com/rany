'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { revalidateCartTotals } from './cart-actions';

const addressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  addressLine1: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State or province is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
});

const checkoutSchema = z.object({
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  shippingAddress: addressSchema,
  billingSameAsShipping: z.boolean(),
  billingAddress: addressSchema.optional(),
}).superRefine((data, ctx) => {
  if (!data.billingSameAsShipping && !data.billingAddress) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Billing address is required if not same as shipping",
      path: ["billingAddress"],
    });
  }
});

export type CheckoutActionState = {
  success: boolean;
  errors?: Record<string, string>;
  message?: string;
  data?: any;
};

export async function processCheckout(
  prevState: CheckoutActionState, 
  formData: FormData,
  cartItemsJson: string,
  shippingMethodId: string,
  couponCode?: string
): Promise<CheckoutActionState> {
  // Parse raw form data
  const rawData = {
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    billingSameAsShipping: formData.get('billingSameAsShipping') === 'on',
    shippingAddress: {
      firstName: formData.get('shipping_firstName') as string,
      lastName: formData.get('shipping_lastName') as string,
      addressLine1: formData.get('shipping_addressLine1') as string,
      city: formData.get('shipping_city') as string,
      state: formData.get('shipping_state') as string,
      postalCode: formData.get('shipping_postalCode') as string,
      country: formData.get('shipping_country') as string,
    },
  };

  if (!rawData.billingSameAsShipping) {
    (rawData as any).billingAddress = {
      firstName: formData.get('billing_firstName') as string,
      lastName: formData.get('billing_lastName') as string,
      addressLine1: formData.get('billing_addressLine1') as string,
      city: formData.get('billing_city') as string,
      state: formData.get('billing_state') as string,
      postalCode: formData.get('billing_postalCode') as string,
      country: formData.get('billing_country') as string,
    };
  }

  const validatedFields = checkoutSchema.safeParse(rawData);

  if (!validatedFields.success) {
    const formattedErrors: Record<string, string> = {};
    
    validatedFields.error.issues.forEach(issue => {
      const path = issue.path.join('_');
      formattedErrors[path] = issue.message;
    });

    return {
      success: false,
      errors: formattedErrors,
      message: 'Please fix the errors in the form.',
    };
  }

  // Parse Cart
  let cartItems = [];
  try {
    cartItems = JSON.parse(cartItemsJson);
  } catch (e) {
    return { success: false, message: 'Invalid cart data.' };
  }

  // Revalidate cart totals on the server to prevent tampering
  const validatedCart = await revalidateCartTotals(cartItems, shippingMethodId, couponCode);
  if (!validatedCart.isValid || validatedCart.error) {
    return { success: false, message: validatedCart.error || 'Cart validation failed. Please check your items.' };
  }

  // Fetch Monirize Gateway
  const gateway = await prisma.paymentGateway.findUnique({
    where: { name: 'Monirize' }
  });

  if (!gateway || !gateway.isActive) {
    return { success: false, message: 'Payment gateway is currently unavailable.' };
  }

  if (!gateway.secretKey) {
    console.error('Monirize secret key is missing');
    return { success: false, message: 'Payment gateway configuration error.' };
  }

  const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const totalAmount = validatedCart.totals.grandTotal;
  const currency = 'CAD';
  const status = 'PENDING';

  // Create Order in DB
  let order;
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('customer_auth')?.value;
    let customerId = null;
    if (authCookie) {
       customerId = BigInt(authCookie);
    }

    order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        customerEmail: validatedFields.data.email,
        totalAmount,
        currency,
        status: 'PENDING',
        shippingAddress: validatedFields.data.shippingAddress,
        billingAddress: validatedFields.data.billingSameAsShipping ? validatedFields.data.shippingAddress : validatedFields.data.billingAddress,
        items: {
          create: validatedCart.items.map(item => ({
            productId: BigInt(item.productId),
            variantId: item.variantId ? BigInt(item.variantId) : null,
            title: item.title + (item.variantTitle ? ` - ${item.variantTitle}` : ''),
            quantity: item.quantity,
            unitPrice: item.originalPrice || (item.totalPrice / item.quantity),
            totalPrice: item.totalPrice
          }))
        }
      }
    });
  } catch (error) {
    console.error('Failed to create order:', error);
    return { success: false, message: 'Failed to create order. Please try again.' };
  }

  // Generate Monirize Checksum
  // Our webhook verification uses: dataToSign = `${orderRef}${amount}${currency}${status}`
  // So the frontend should send those fields to the gateway, and the gateway will echo them to our webhook.
  const dataToSign = `${orderNumber}${totalAmount}${currency}${status}`;
  const signature = crypto
    .createHmac('sha256', gateway.secretKey)
    .update(dataToSign)
    .digest('hex');
  
  return {
    success: true,
    data: {
      orderNumber,
      amount: totalAmount,
      currency,
      merchantId: gateway.merchantId,
      signature,
      token: order.secureToken
    },
  };
}

export async function getCustomerAddresses() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('customer_auth')?.value;

  if (!authCookie) return [];

  try {
    const addresses = await prisma.customerAddress.findMany({
      where: { customerId: BigInt(authCookie) },
      orderBy: { isDefaultShipping: 'desc' }
    });

    // Serialize BigInts before returning
    return addresses.map(addr => ({
      ...addr,
      id: addr.id.toString(),
      customerId: addr.customerId.toString(),
    }));
  } catch (error) {
    console.error("Failed to fetch addresses", error);
    return [];
  }
}
