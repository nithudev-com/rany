import { prisma } from '@/lib/prisma';
import { JobListClient } from './JobListClient';

export const dynamic = 'force-dynamic';

export default async function EmailJobsPage() {
  const jobs = await prisma.emailJob.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100, // Limit to recent 100 for simplicity in this view
  });

  const serializedJobs = jobs.map(j => ({
    ...j,
    id: j.id.toString(),
    customerId: j.customerId?.toString() || null,
    templateId: j.templateId?.toString() || null,
    campaignId: j.campaignId?.toString() || null,
  }));

  return <JobListClient initialJobs={serializedJobs} />;
}
