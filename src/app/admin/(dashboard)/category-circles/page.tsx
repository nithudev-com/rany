import { prisma } from "@/lib/prisma";
import CategoryCirclesManager, { CategoryCircleData } from "./CategoryCirclesManager";

export const dynamic = "force-dynamic";

export default async function AdminCategoryCirclesPage() {
  const circles = await prisma.categoryCircle.findMany({
    orderBy: { sortOrder: 'asc' }
  });

  // Convert BigInt IDs to string for the client component
  const formattedCircles: CategoryCircleData[] = circles.map(c => ({
    id: c.id.toString(),
    name: c.name,
    image: c.image,
    url: c.url,
    sortOrder: c.sortOrder
  }));

  return <CategoryCirclesManager initialItems={formattedCircles} />;
}
