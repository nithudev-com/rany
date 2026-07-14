'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createBlogPost(formData: FormData) {
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const excerpt = formData.get('excerpt') as string;
  const content = formData.get('content') as string;
  const coverImage = formData.get('coverImage') as string;
  const isPublished = formData.get('isPublished') === 'true';

  if (!title || !slug || !content) {
    throw new Error("Missing required fields");
  }

  const post = await prisma.blogPost.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      coverImage: coverImage || null,
      isPublished
    }
  });

  revalidatePath('/blog');
  revalidatePath('/admin/blog');
  redirect('/admin/blog');
}

export async function updateBlogPost(id: bigint, formData: FormData) {
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const excerpt = formData.get('excerpt') as string;
  const content = formData.get('content') as string;
  const coverImage = formData.get('coverImage') as string;
  const isPublished = formData.get('isPublished') === 'true';

  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      title,
      slug,
      excerpt,
      content,
      coverImage: coverImage || null,
      isPublished
    }
  });

  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);
  revalidatePath('/admin/blog');
  redirect('/admin/blog');
}

export async function getBlogPostsList() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return posts.map(p => ({
    ...p,
    id: p.id.toString()
  }));
}

export async function saveBlogPostData(
  id: string,
  data: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage?: string;
    isPublished: boolean;
  }
) {
  const post = await prisma.blogPost.update({
    where: { id: BigInt(id) },
    data: {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      coverImage: data.coverImage || null,
      isPublished: data.isPublished
    }
  });

  revalidatePath('/blog');
  revalidatePath(`/blog/${data.slug}`);
  revalidatePath('/admin/blog');
  
  return {
    ...post,
    id: post.id.toString()
  };
}

export async function deleteBlogPost(id: bigint) {
  await prisma.blogPost.delete({
    where: { id }
  });
  revalidatePath('/blog');
  revalidatePath('/admin/blog');
}
