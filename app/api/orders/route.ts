import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientKey } from "@/lib/security";

const schema = z.object({
  customer: z.object({ name: z.string().trim().min(2).max(100), email: z.string().trim().email().max(160), company: z.string().trim().max(120).optional(), phone: z.string().trim().max(40).optional() }),
  items: z.array(z.string().regex(/^[a-z0-9-]+$/)).min(1).max(6),
  notes: z.string().trim().max(2000).optional(),
  website: z.string().max(0).optional(),
});

function reference() { return `LS-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`; }

export async function POST(request: Request) {
  if (!checkRateLimit(`orders:${getClientKey(request)}`, 5)) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  try {
    const body = schema.parse(await request.json());
    if (body.website) return NextResponse.json({ reference: "received" }, { status: 201 });
    const packages = await prisma.servicePackage.findMany({ where: { slug: { in: body.items }, active: true } });
    if (packages.length !== new Set(body.items).size) return NextResponse.json({ error: "One or more selected packages are unavailable." }, { status: 400 });
    const order = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.upsert({ where: { email: body.customer.email }, update: { name: body.customer.name, company: body.customer.company, phone: body.customer.phone }, create: body.customer });
      const total = packages.reduce((sum, item) => sum + item.priceCents, 0);
      return tx.order.create({ data: { reference: reference(), customerId: customer.id, estimatedCents: total, billingSummary: packages.map((item) => `${item.name} (${item.frequency})`).join(", "), notes: body.notes, items: { create: packages.map((item) => ({ packageId: item.id, priceCents: item.priceCents })) } } });
    });
    return NextResponse.json({ reference: order.reference }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Please check the required fields and try again." }, { status: 400 });
    console.error("order creation failed", error);
    return NextResponse.json({ error: "We could not save this request. Please try again." }, { status: 500 });
  }
}