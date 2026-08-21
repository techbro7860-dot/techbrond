import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/middleware/requireAdmin";
import { faqSchema } from "@/lib/validations/faq";
import Faq from "@/models/Faq";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
  try {
    await connectDB();
    const parsed = faqSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Check the FAQ details" }, { status: 400 });
    const faq = await Faq.findByIdAndUpdate(params.id, parsed.data, { new: true, runValidators: true });
    if (!faq) return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    revalidatePath("/faq");
    return NextResponse.json({ faq });
  } catch (error) {
    console.error("PATCH /api/admin/faqs/[id] failed:", error);
    return NextResponse.json({ error: "Could not update FAQ" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
  try {
    await connectDB();
    const faq = await Faq.findByIdAndDelete(params.id);
    if (!faq) return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    revalidatePath("/faq");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admin/faqs/[id] failed:", error);
    return NextResponse.json({ error: "Could not delete FAQ" }, { status: 500 });
  }
}
