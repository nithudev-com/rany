const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const seoTemplates = [
  {
    title: (name) => `Shop Premium ${name} | Best Selection & Prices Online`,
    desc: (name) => `Explore our massive collection of top-rated ${name}. Find exactly what you are looking for with our premium selection of ${name}, featuring high-quality options, unmatched variety, and fast shipping.`
  },
  {
    title: (name) => `${name} Store | Authentic Products & Exclusive Deals`,
    desc: (name) => `Browse our curated selection of ${name} from the world's most trusted brands. Whether you're upgrading or trying something new, our ${name} collection guarantees exceptional quality and performance.`
  },
  {
    title: (name) => `Buy ${name} Online | Top Rated & Fast Delivery`,
    desc: (name) => `Looking for the absolute best in ${name}? Discover our exclusive ${name} catalog designed for premium experiences. Enjoy 100% authentic products, competitive pricing, and ultra-discreet delivery.`
  },
  {
    title: (name) => `Discover ${name} | Highest Quality & Best Sellers`,
    desc: (name) => `Elevate your lifestyle with our premium range of ${name}. We handpick the finest ${name} on the market to ensure ultimate satisfaction. Compare prices, read reviews, and shop securely today.`
  },
  {
    title: (name) => `${name} Collection | Explore New Arrivals & Classics`,
    desc: (name) => `Find your perfect match in our extensive ${name} department. We offer a wide variety of ${name} built for reliability and enjoyment. Shop with confidence knowing every product meets our strict quality standards.`
  },
  {
    title: (name) => `The Ultimate ${name} Selection | Shop Now`,
    desc: (name) => `Dive into our exclusive selection of ${name}. As a trusted retailer, we provide access to the best ${name} available. Experience top-tier customer service and seamless online ordering.`
  }
];

async function main() {
  const categories = await prisma.category.findMany({ select: { id: true, name: true } });
  
  console.log(`Found ${categories.length} categories to update...`);
  
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    
    // Pick a template based on the index to ensure even distribution and variety
    const template = seoTemplates[i % seoTemplates.length];
    
    const seoTitle = template.title(category.name);
    const seoDescription = template.desc(category.name);
    
    await prisma.category.update({
      where: { id: category.id },
      data: {
        seoTitle,
        seoDescription
      }
    });
    
    console.log(`Updated [${i + 1}/${categories.length}]: ${category.name}`);
  }
  
  console.log('Successfully updated all SEO descriptions for categories one-by-one!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
