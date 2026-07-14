const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Starting category image matching...");
  const categories = await prisma.category.findMany();
  
  let updatedCount = 0;
  
  for (const category of categories) {
    // Find the first active product in this category that has an image
    const product = await prisma.product.findFirst({
      where: {
        categoryId: category.id,
        mainImage: {
          not: null,
          not: ""
        }
      },
      select: {
        mainImage: true
      }
    });

    if (product && product.mainImage) {
      await prisma.category.update({
        where: { id: category.id },
        data: { image: product.mainImage }
      });
      console.log(`Matched category "${category.name}" with image: ${product.mainImage}`);
      updatedCount++;
    } else {
      console.log(`No product image found for category "${category.name}"`);
    }
  }

  console.log(`Successfully updated ${updatedCount} / ${categories.length} categories.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
