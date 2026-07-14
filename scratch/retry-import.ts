import { PrismaClient } from "@prisma/client";
import { getProductImportQueue } from "../src/lib/import-queue";

const prisma = new PrismaClient();

async function main() {
  const batches = await prisma.productImportBatch.findMany({
    where: { status: "PROCESSING" }
  });

  console.log(`Found ${batches.length} batches in PROCESSING state.`);
  
  const queue = getProductImportQueue();
  if (!queue) {
    console.error("Queue not configured");
    return;
  }

  for (const batch of batches) {
    console.log(`Queuing batch ${batch.id}...`);
    await queue.add("product-import" as any, { batchId: batch.id } as any, { 
      attempts: 3, 
      backoff: { type: "exponential", delay: 5000 } 
    });
  }

  console.log("Done.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
