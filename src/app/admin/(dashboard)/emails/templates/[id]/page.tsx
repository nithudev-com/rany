import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { TemplateForm } from '../components/TemplateForm';

export const dynamic = 'force-dynamic';

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const template = await prisma.emailTemplate.findUnique({
    where: { id: String(id) }
  });

  if (!template) {
    notFound();
  }

  const serialized = { ...template, id: template.id.toString() };

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '24px' }}>Edit Email Template</h1>
      <TemplateForm template={serialized} />
    </div>
  );
}
