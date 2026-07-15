import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const p = await prisma.product.findFirst({ select: { slug: true } });
  console.log("First product slug:", p?.slug);
}
run();
