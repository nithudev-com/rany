const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const seoTemplates = [
  {
    title: (name) => `Shop ${name} Products | Premium Quality & Best Prices`,
    desc: (name) => `Discover the complete collection of ${name} products. Experience unparalleled quality, innovative designs, and ultimate satisfaction. Shop our exclusive range of ${name} items today.`
  },
  {
    title: (name) => `${name} Official Collection | Fast & Discreet Shipping`,
    desc: (name) => `Explore premium toys and accessories from ${name}. Featuring body-safe materials and cutting-edge technology, ${name} offers everything you need for maximum pleasure. Browse our curated selection now.`
  },
  {
    title: (name) => `Buy ${name} Online | Top Rated Wellness & Novelty`,
    desc: (name) => `Looking for the best from ${name}? Our premium store features the top-rated ${name} products designed for excellence. Enjoy discreet shipping and competitive prices on all ${name} items.`
  },
  {
    title: (name) => `${name} Store | Authentic Products & Exclusive Deals`,
    desc: (name) => `Shop authentic ${name} products with confidence. Renowned for their uncompromising quality and premium feel, ${name} is a top choice for wellness. Find your perfect match in our official collection.`
  },
  {
    title: (name) => `Discover ${name} | Premium Adult Toys & Accessories`,
    desc: (name) => `Elevate your experience with ${name}. From classic bestsellers to the latest innovations, our ${name} catalog has something for everyone. Shop securely with fast, discreet delivery.`
  }
];

async function main() {
  const brands = await prisma.brand.findMany({ select: { id: true, name: true } });
  
  console.log(`Found ${brands.length} brands to update...`);
  
  for (let i = 0; i < brands.length; i++) {
    const brand = brands[i];
    
    // Pick a template based on the index to ensure even distribution and variety
    const template = seoTemplates[i % seoTemplates.length];
    
    const seoTitle = template.title(brand.name);
    const seoDescription = template.desc(brand.name);
    
    await prisma.brand.update({
      where: { id: brand.id },
      data: {
        seoTitle,
        seoDescription
      }
    });
    
    console.log(`Updated [${i + 1}/${brands.length}]: ${brand.name}`);
  }
  
  console.log('Successfully updated all SEO descriptions one-by-one!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
