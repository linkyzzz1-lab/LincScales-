import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin";
const schema = z.object({ priceCents: z.number().int().min(0).max(10000000), active: z.boolean().optional() });
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) { if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); try { const body = schema.parse(await request.json()); const { id } = await params; const item = await prisma.servicePackage.update({ where: { id }, data: body }); return NextResponse.json({ item }); } catch { return NextResponse.json({ error: "Could not update package." }, { status: 400 }); } }