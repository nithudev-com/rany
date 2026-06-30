'use server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import DOMPurify from 'isomorphic-dompurify';
import { EmailChannel } from '@prisma/client';

export async function saveTemplate(formData: FormData) {
  const id = formData.get('id') as string | null;
  const name = formData.get('name') as string;
  const subject = formData.get('subject') as string;
  const rawHtml = formData.get('htmlBody') as string;
  const textBody = formData.get('textBody') as string;
  const channel = formData.get('channel') as EmailChannel;

  if (!name || !subject || !rawHtml) {
    return { success: false, error: 'Name, subject, and HTML body are required.' };
  }

  // Security: Sanitize HTML to prevent stored XSS
  const sanitizedHtml = DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true }, // allow standard HTML
  });

  try {
    if (id) {
      await prisma.emailTemplate.update({
        where: { id: BigInt(id) },
        data: { name, subject, htmlBody: sanitizedHtml, textBody, channel }
      });
    } else {
      await prisma.emailTemplate.create({
        data: { name, subject, htmlBody: sanitizedHtml, textBody, channel }
      });
    }
    
    revalidatePath('/admin/emails/templates');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: 'A template with this name already exists.' };
    return { success: false, error: 'Failed to save template.' };
  }
}

export async function deleteTemplate(id: string) {
  try {
    await prisma.emailTemplate.delete({
      where: { id: BigInt(id) }
    });
    revalidatePath('/admin/emails/templates');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete template.' };
  }
}
