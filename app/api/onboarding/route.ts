import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientKey } from "@/lib/security";
const schema = z.object({ name: z.string().trim().min(2).max(100), email: z.string().trim().email().max(160), company: z.string().trim().max(120).optional(), orderReference: z.string().regex(/^LS-[0-9]{8}-[A-Z0-9]{6}$/), goals: z.string().trim().min(10).max(1200), website: z.string().max(0).optional() });
export async function POST(request: Request) {
  if (!checkRateLimit(`onboarding:${getClientKey(request)}`, 4)) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  try { const body = schema.parse(await request.json()); if (body.website) return NextResponse.json({ ok: true }); const order = await prisma.order.findUnique({ where: { reference: body.orderReference } }); if (!order || order.customerId !== (await prisma.customer.findUnique({ where: { email: body.email } }))?.id) return NextResponse.json({ error: "We could not match that order reference to this email." }, { status: 400 }); await prisma.order.update({ where: { id: order.id }, data: { notes: body.goals, status: "IN_PROGRESS" } }); return NextResponse.json({ ok: true }); } catch (error) { if (error instanceof z.ZodError) return NextResponse.json({ error: "Please check the onboarding fields." }, { status: 400 }); console.error("onboarding failed", error); return NextResponse.json({ error: "We could not save onboarding yet." }, { status: 500 }); }
}