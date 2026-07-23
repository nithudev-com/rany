import { Worker, Job } from "bullmq";
import { PrismaClient, EmailStatus, EmailChannel } from "@prisma/client";
import { emailProvider } from "../src/lib/email/provider";
import IORedis from "ioredis";

// We use a dedicated Prisma instance for the worker to avoid connection pool issues
const prisma = new PrismaClient();
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });

async function processEmailJob(bullJob: Job) {
  const { dbJobId } = bullJob.data;

  // 1. Fetch DB Job
  const emailJob = await prisma.emailJob.findUnique({
    where: { id: String(dbJobId) },
    include: { template: true, customer: { include: { emailPreferences: true } } }
  });

  if (!emailJob) {
    throw new Error(`EmailJob ${dbJobId} not found in database`);
  }

  if (emailJob.status === EmailStatus.SENT || emailJob.status === EmailStatus.CANCELLED) {
    return { skipped: true, reason: `Job already ${emailJob.status}` };
  }

  if (!emailJob.template) {
    await prisma.emailJob.update({
      where: { id: emailJob.id },
      data: { status: EmailStatus.FAILED, errorLogs: { error: "Template missing" } }
    });
    throw new Error(`Template not found for job ${dbJobId}`);
  }

  // 2. Check Preferences for Marketing
  if (emailJob.channel === EmailChannel.MARKETING && emailJob.customer?.emailPreferences) {
    const prefs = emailJob.customer.emailPreferences;
    if (prefs.globalUnsubscribe || prefs.isBounced || prefs.isSpamComplaint) {
      // Suppress the email
      await prisma.emailJob.update({
        where: { id: emailJob.id },
        data: { status: EmailStatus.CANCELLED, errorLogs: { reason: "User suppressed marketing emails" } }
      });
      return { skipped: true, reason: "Marketing suppression active" };
    }
  }

  // 3. Mark as PROCESSING
  await prisma.emailJob.update({
    where: { id: emailJob.id },
    data: { status: EmailStatus.PROCESSING, attemptCount: { increment: 1 } }
  });

  // 4. Send Email
  const response = await emailProvider.sendEmail(emailJob, emailJob.template, emailJob.recipientEmail);

  // 5. Update Status
  if (response.success) {
    await prisma.emailJob.update({
      where: { id: emailJob.id },
      data: { 
        status: EmailStatus.SENT, 
        sentAt: new Date(),
        providerMsgId: response.messageId
      }
    });
    return { success: true, messageId: response.messageId };
  } else {
    // Determine if we should fail or let BullMQ retry
    const currentAttempt = emailJob.attemptCount + 1;
    const isFinalAttempt = currentAttempt >= emailJob.maxAttempts;

    await prisma.emailJob.update({
      where: { id: emailJob.id },
      data: {
        status: isFinalAttempt ? EmailStatus.FAILED : EmailStatus.PENDING,
        errorLogs: { error: response.error, lastAttempt: new Date() }
      }
    });

    // Throwing an error tells BullMQ to retry the job based on backoff settings
    throw new Error(`Email provider failed: ${JSON.stringify(response.error)}`);
  }
}

export const emailWorker = new Worker("emailQueue", processEmailJob, {
  connection: connection as any,
  concurrency: 5 // Process 5 emails concurrently
});

emailWorker.on("completed", (job) => {
  console.log(`[EmailWorker] Job ${job.id} completed successfully.`);
});

emailWorker.on("failed", (job, err) => {
  console.error(`[EmailWorker] Job ${job?.id} failed:`, err.message);
});

console.log("[EmailWorker] Started listening for email jobs on emailQueue...");
