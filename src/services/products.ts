import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sanitizePrismaData } from "@/lib/prisma-utils";

export const productListSelect = {
  id: true,
  sku: true,
  title: true,
  slug: true,
  basePrice: true,
  salePrice: true,
  stockStatus: true,
  mainImage: true,
  category: { select: { name: true, slug: true } },
  brand: { select: { name: true, slug: true } },
  _count: { select: { variants: true } }
} as const;

export async function getHomeProducts() {
  return unstable_cache(
    async () => {
      const data = await prisma.product.findMany({
        where: { status: "ACTIVE" },
        select: productListSelect,
        orderBy: { updatedAt: "desc" },
        take: 24
      });
      return sanitizePrismaData(data);
    },
    ["home-products"],
    { revalidate: 900, tags: ["home-products", "products"] }
  )();
}

export async function getProductBySlug(slug: string) {
  const decodedSlug = decodeURIComponent(slug);
  return unstable_cache(
    async () => {
      const data = await prisma.product.findFirst({
        where: { slug: decodedSlug, status: "ACTIVE" },
        include: {
          category: true,
          brand: true,
          images: { orderBy: { sortOrder: "asc" } },
          variants: true,
          reviews: { where: { approved: true }, take: 10, orderBy: { createdAt: "desc" } },
          blogs: { 
            where: { isPublished: true }, 
            select: { id: true, title: true, slug: true, coverImage: true, excerpt: true },
            take: 4,
            orderBy: { createdAt: "desc" }
          }
        }
      });
      return sanitizePrismaData(data);
    },
    [`product-${slug}`],
    { revalidate: 3600, tags: [`product:${slug}`, "products"] }
  )();
}

export async function getCategoryBySlug(slug: string) {
  const decodedSlug = decodeURIComponent(slug);
  return unstable_cache(
    async () => {
      const data = await prisma.category.findUnique({ where: { slug: decodedSlug } });
      return sanitizePrismaData(data);
    },
    [`category-${slug}`],
    { revalidate: 1800, tags: [`category:${slug}`, "categories"] }
  )();
}

export async function getCategoryProducts(slug: string, page = 1, limit = 24) {
  const skip = Math.max(page - 1, 0) * limit;
  const decodedSlug = decodeURIComponent(slug);

  return unstable_cache(
    async () => {
      const category = await prisma.category.findUnique({ where: { slug: decodedSlug } });
      if (!category) return { category: null, products: [], total: 0 };

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where: { status: "ACTIVE", categoryId: category.id },
          select: productListSelect,
          orderBy: { updatedAt: "desc" },
          skip,
          take: limit
        }),
        prisma.product.count({ where: { status: "ACTIVE", categoryId: category.id } })
      ]);

      return sanitizePrismaData({ category, products, total });
    },
    [`category-products-${slug}-${page}-${limit}`],
    { revalidate: 1800, tags: [`category:${slug}`, "products"] }
  )();
}

export async function getFilteredProducts(params: { slug?: string, brandSlug?: string, search?: string, sort?: string, minPrice?: number, maxPrice?: number, page?: number, limit?: number }) {
  const page = params.page || 1;
  const limit = params.limit || 24;
  const skip = Math.max(page - 1, 0) * limit;

  let whereClause: any = { status: "ACTIVE" };

  if (params.slug) {
    const decodedCategorySlug = decodeURIComponent(params.slug);
    const category = await prisma.category.findUnique({ where: { slug: decodedCategorySlug } });
    if (category) {
      whereClause.categoryId = category.id;
    } else {
      return { products: [], total: 0, category: null, brand: null };
    }
  }

  if (params.brandSlug) {
    const decodedBrandSlug = decodeURIComponent(params.brandSlug);
    const brand = await prisma.brand.findUnique({ where: { slug: decodedBrandSlug } });
    if (brand) {
      whereClause.brandId = brand.id;
    } else {
      return { products: [], total: 0, category: null, brand: null };
    }
  }

  if (params.search) {
    whereClause.OR = [
      { title: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } }
    ];
  }

  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    whereClause.basePrice = {};
    if (params.minPrice !== undefined) whereClause.basePrice.gte = params.minPrice;
    if (params.maxPrice !== undefined) whereClause.basePrice.lte = params.maxPrice;
  }

  let orderBy: any = { updatedAt: "desc" };
  if (params.sort === 'price_asc') orderBy = { basePrice: "asc" };
  if (params.sort === 'price_desc') orderBy = { basePrice: "desc" };
  if (params.sort === 'newest') orderBy = { createdAt: "desc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      select: productListSelect,
      orderBy,
      skip,
      take: limit
    }),
    prisma.product.count({ where: whereClause })
  ]);

  let category = null;
  if (params.slug) {
    const decodedCategorySlug = decodeURIComponent(params.slug);
    category = await prisma.category.findUnique({ where: { slug: decodedCategorySlug } });
  }

  let brand = null;
  if (params.brandSlug) {
    const decodedBrandSlug = decodeURIComponent(params.brandSlug);
    brand = await prisma.brand.findUnique({ where: { slug: decodedBrandSlug } });
  }

  return sanitizePrismaData({ products, total, category, brand });
}

export async function getTopProductSlugs(limit = 1000) {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    select: { slug: true },
    orderBy: { updatedAt: "desc" },
    take: limit
  });

  return products.map((product) => ({ slug: product.slug }));
}

export async function getSitemapProducts(skip: number, take: number) {
  return prisma.product.findMany({
    where: { status: "ACTIVE" },
    select: { slug: true, updatedAt: true },
    orderBy: { id: "asc" },
    skip,
    take
  });
}

export async function getSitemapCategories() {
  return prisma.category.findMany({
    select: { slug: true, updatedAt: true },
    orderBy: { id: "asc" }
  });
}

export async function getProductCount() {
  return prisma.product.count({ where: { status: "ACTIVE" } });
}
