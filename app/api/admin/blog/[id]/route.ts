import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/middleware/requireAdmin";
import { blogPostSchema } from "@/lib/validations/blog-post";
import BlogPost from "@/models/BlogPost";

function refreshBlog(slugs: string[]) {
  revalidatePath("/");
  revalidatePath("/blog");
  slugs.filter(Boolean).forEach((slug) => revalidatePath(`/blog/${slug}`));
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ error: "Article not found" }, { status: 404 });
  try {
    await connectDB();
    const parsed = blogPostSchema.safeParse(await req.json());
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = issue?.path?.length ? `${issue.path.join(" → ")}: ` : "";
      return NextResponse.json({ error: `${field}${issue?.message || "Please check the form"}` }, { status: 400 });
    }
    const existing = await BlogPost.findById(params.id);
    if (!existing) return NextResponse.json({ error: "Article not found" }, { status: 404 });
    const previousSlug = existing.slug;
    const nextSlug = parsed.data.slug || previousSlug;
    if (await BlogPost.exists({ slug: nextSlug, _id: { $ne: params.id } })) {
      return NextResponse.json({ error: "That URL slug is already in use" }, { status: 409 });
    }
    Object.assign(existing, parsed.data, { slug: nextSlug });
    await existing.save();
    refreshBlog([previousSlug, nextSlug]);
    return NextResponse.json({ post: existing });
  } catch (error) {
    console.error("PATCH /api/admin/blog/[id] failed:", error);
    return NextResponse.json({ error: "Could not save this article. Check the database connection and try again." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ error: "Article not found" }, { status: 404 });
  try {
    await connectDB();
    const deleted = await BlogPost.findByIdAndDelete(params.id);
    if (!deleted) return NextResponse.json({ error: "Article not found" }, { status: 404 });
    refreshBlog([deleted.slug]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admin/blog/[id] failed:", error);
    return NextResponse.json({ error: "Could not delete this article. Please try again." }, { status: 500 });
  }
}
