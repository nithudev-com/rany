import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function faqJsonLd(faqs: any) {
  if (!faqs || !Array.isArray(faqs) || faqs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq: any) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };
}

const safeParseJSON = (data: any, fallback: any = []) => {
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      return fallback;
    }
  }
  return fallback;
};

async function main() {
  const product = await prisma.product.findUnique({
    where: { slug: 'temptasia-jealousy-peg-red-rouge' },
    select: { faq: true }
  });

  const rawFaq = product?.faq;
  const parsedFaq = safeParseJSON(rawFaq);
  
  console.log("rawFaq is array?", Array.isArray(rawFaq));
  console.log("parsedFaq is array?", Array.isArray(parsedFaq));
  
  console.log("Schema output:");
  console.log(JSON.stringify(faqJsonLd(parsedFaq), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
