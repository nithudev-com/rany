import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const RevalidateSchema = z.object({
  secret: z.string(),
  paths: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional()
});

export async function POST(request: Request) {
  const body = RevalidateSchema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (body.data.secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  for (const path of body.data.paths || []) {
    revalidatePath(path);
  }

  for (const tag of body.data.tags || []) {
    revalidateTag(tag);
  }

  return NextResponse.json({
    ok: true,
    revalidatedPaths: body.data.paths || [],
    revalidatedTags: body.data.tags || []
  });
}
