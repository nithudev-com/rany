import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: { faq: { not: null } },
    select: { slug: true, faq: true },
    take: 5
  });

  for (const p of products) {
    console.log(`\nProduct: ${p.slug}`);
    console.log(`Type of faq: ${typeof p.faq}`);
    console.log(JSON.stringify(p.faq, null, 2));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
