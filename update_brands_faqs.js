const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// High-converting, SEO-focused FAQ templates
const faqTemplates = [
  {
    q: (brand) => `Are ${brand} products safe to use?`,
    a: (brand) => `Yes! All ${brand} products are manufactured using ultra-premium, body-safe materials. They undergo rigorous quality control testing to ensure maximum safety, durability, and comfort during use.`
  },
  {
    q: (brand) => `How fast is shipping for ${brand} items?`,
    a: (brand) => `We offer lightning-fast, 100% discreet shipping on all ${brand} orders. Your privacy is our top priority, so every package arrives in plain, unmarked packaging with no identifying labels.`
  },
  {
    q: (brand) => `Why should I buy ${brand} from your store?`,
    a: (brand) => `We are an official, authorized retailer for ${brand}. When you buy from us, you are guaranteed to receive authentic products, full manufacturer warranties, and access to our dedicated customer support team.`
  },
  {
    q: (brand) => `Are ${brand} toys completely waterproof?`,
    a: (brand) => `Many top-tier ${brand} items feature fully waterproof designs (IPX7 rated), making them perfect for the bath or shower and incredibly easy to clean. Always check the specific product manual to confirm water resistance.`
  },
  {
    q: (brand) => `What makes ${brand} different from other brands?`,
    a: (brand) => `${brand} stands out for its unmatched commitment to innovative technology and luxurious design. Their products are internationally recognized for providing deeper, more targeted stimulation compared to traditional alternatives.`
  },
  {
    q: (brand) => `How do I clean and maintain my ${brand} product?`,
    a: (brand) => `To ensure longevity, we recommend cleaning your ${brand} item before and after every use with warm water and a specialized, mild toy cleaner. Never use silicone-based lubricants with silicone toys.`
  }
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

async function main() {
  const brands = await prisma.brand.findMany({ select: { id: true, name: true } });
  console.log(`Generating unique FAQs for ${brands.length} brands...`);
  
  for (let i = 0; i < brands.length; i++) {
    const brand = brands[i];
    const hash = hashString(brand.name + brand.id.toString());
    
    // Select 3 unique FAQs out of the 6 templates for this brand
    const selectedFaqs = [];
    let templateIndices = [0, 1, 2, 3, 4, 5];
    
    // Shuffle based on hash
    for (let j = templateIndices.length - 1; j > 0; j--) {
      const k = (hash + j) % (j + 1);
      [templateIndices[j], templateIndices[k]] = [templateIndices[k], templateIndices[j]];
    }
    
    // Take the first 3
    for (let j = 0; j < 3; j++) {
      const template = faqTemplates[templateIndices[j]];
      selectedFaqs.push({
        question: template.q(brand.name),
        answer: template.a(brand.name)
      });
    }
    
    // Convert to JSON
    await prisma.brand.update({
      where: { id: brand.id },
      data: {
        faqs: selectedFaqs
      }
    });
    
    console.log(`[${i + 1}/${brands.length}] Generated FAQs for: ${brand.name}`);
  }
  
  console.log('\\nSuccessfully completed FAQ generation for all brands!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
