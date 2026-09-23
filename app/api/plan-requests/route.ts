import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientKey } from "@/lib/security";

const schema = z.object({ name: z.string().trim().min(2).max(100), email: z.string().trim().email().max(160), company: z.string().trim().max(120).optional(), businessType: z.string().trim().min(2).max(80), goals: z.string().trim().min(10).max(1200), budget: z.string().trim().min(2).max(80), desiredServices: z.array(z.string().trim().min(2).max(80)).min(1).max(8), website: z.string().max(0).optional() });
function reference() { return `LS-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`; }
export async function POST(request: Request) {
  if (!checkRateLimit(`plans:${getClientKey(request)}`, 4)) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  try {
    const body = schema.parse(await request.json());
    if (body.website) return NextResponse.json({ reference: "received" }, { status: 201 });
    const result = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.upsert({ where: { email: body.email }, update: { name: body.name, company: body.company }, create: { name: body.name, email: body.email, company: body.company } });
      const order = await tx.order.create({ data: { reference: reference(), customerId: customer.id, estimatedCents: 0, billingSummary: "Custom plan request", notes: "Preliminary estimate requested", status: "REVIEWING" } });
      await tx.customPlanRequest.create({ data: { customerId: customer.id, businessType: body.businessType, goals: body.goals, budget: body.budget, desiredServices: JSON.stringify(body.desiredServices) } });
      return order;
    });
    return NextResponse.json({ reference: result.reference }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Please complete the required fields and try again." }, { status: 400 });
    console.error("plan request failed", error);
    return NextResponse.json({ error: "We could not save this request. Please try again." }, { status: 500 });
  }
}