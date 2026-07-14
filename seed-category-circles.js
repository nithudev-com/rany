const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clear existing category circles
  await prisma.categoryCircle.deleteMany({});
  console.log('Cleared existing Category Circles');

  const items = [
    {
      name: 'Dealspot',
      image: 'https://cdn.shopify.com/s/files/1/0280/7598/2985/products/XRAH028.jpg?v=1669855754',
      url: '/category/vibrators',
      sortOrder: 1
    },
    {
      name: 'Vibrators',
      image: 'https://cdn.shopify.com/s/files/1/0420/7699/5750/files/cbeb408e-f316-4244-a990-b17e1417b339.jpg?v=1776636555',
      url: '/category/vibrators',
      sortOrder: 2
    },
    {
      name: 'Furniture',
      image: 'https://cdn.shopify.com/s/files/1/0420/7699/5750/files/9ef155e5-ca13-457d-943a-82e3d21e3f28.png?v=1759037011',
      url: '/category/furniture',
      sortOrder: 3
    },
    {
      name: 'Lubes & Lotions',
      image: 'https://cdn.shopify.com/s/files/1/0420/7699/5750/files/eb290--a_1d120d1a-50f8-4631-9548-0196707d9e3e.jpg?v=1729726587',
      url: '/category/lubes',
      sortOrder: 4
    },
    {
      name: 'BDSM',
      image: 'https://cdn.shopify.com/s/files/1/0420/7699/5750/products/bl-ramp.jpg?v=1668474950',
      url: '/category/bdsm',
      sortOrder: 5
    },
    {
      name: 'Bundles',
      image: 'https://cdn.shopify.com/s/files/1/0420/7699/5750/files/c4c8c06a-ca51-4f09-b28f-c3c4e402963c.jpg?v=1738805038',
      url: '/category/gift-sets',
      sortOrder: 6
    },
    {
      name: 'Cock Rings',
      image: 'https://cdn.shopify.com/s/files/1/0280/7598/2985/files/GX-RS-3151-2c.jpg?v=1694561475',
      url: '/category/anal',
      sortOrder: 7
    },
    {
      name: 'Quiz',
      image: 'https://cdn.shopify.com/s/files/1/0280/7598/2985/products/rf078.jpg?v=1655420605',
      url: '/quiz',
      sortOrder: 8
    }
  ];

  for (const item of items) {
    await prisma.categoryCircle.create({
      data: item
    });
  }

  console.log('Seeded Category Circles successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
