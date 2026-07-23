import { Queue } from "bullmq";
import { getRedis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { EmailChannel, EmailStatus } from "@prisma/client";
import { z } from "zod";

const redisConnection = getRedis();

export const emailQueue = redisConnection ? new Queue("emailQueue", {
  // @ts-ignore - BullMQ and ioredis types conflict
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: true,
  }
}) : {
  add: async () => { console.warn("Redis not configured, ignoring queue.add"); }
};

export const QueueEmailSchema = z.object({
  idempotencyKey: z.string().min(1),
  channel: z.nativeEnum(EmailChannel),
  recipientEmail: z.string().email(),
  templateName: z.string().min(1),
  payload: z.any().optional(),
  customerId: z.string().optional(),
  campaignId: z.string().optional(),
});

export type QueueEmailInput = z.infer<typeof QueueEmailSchema>;

export async function queueEmail(input: QueueEmailInput) {
  const validated = QueueEmailSchema.parse(input);

  // Get Template
  const template = await prisma.emailTemplate.findUnique({
    where: { name: validated.templateName }
  });

  if (!template) {
    throw new Error(`Email template ${validated.templateName} not found`);
  }

  // Idempotency: Use Prisma to upsert and prevent duplicates safely
  const job = await prisma.emailJob.upsert({
    where: { idempotencyKey: validated.idempotencyKey },
    update: {},
    create: {
      idempotencyKey: validated.idempotencyKey,
      channel: validated.channel,
      status: EmailStatus.PENDING,
      recipientEmail: validated.recipientEmail,
      templateId: template.id,
      customerId: validated.customerId ? String(validated.customerId) : null,
      campaignId: validated.campaignId ? String(validated.campaignId) : null,
      payload: (validated.payload || {}) as any,
      maxAttempts: 3
    }
  });

  // If it was already processed or queued (not newly created), don't enqueue again to prevent duplicates
  // Prisma upsert returns the existing record without changing it if it exists.
  // We can't strictly distinguish create vs update from upsert result without checking timestamps or status
  if (job.status !== EmailStatus.PENDING || job.attemptCount > 0) {
    return { success: true, message: "Job already queued or processed", jobId: job.id.toString() };
  }

  // Push to BullMQ
  await emailQueue.add("processEmail", {
    dbJobId: job.id.toString()
  }, {
    jobId: job.idempotencyKey
  });

  return { success: true, jobId: job.id.toString() };
}
