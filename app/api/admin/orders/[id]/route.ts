import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin";
const schema = z.object({ status: z.enum(["PENDING", "REVIEWING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]) });
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) { if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); try { const body = schema.parse(await request.json()); const { id } = await params; const order = await prisma.order.update({ where: { id }, data: { status: body.status } }); return NextResponse.json({ order }); } catch { return NextResponse.json({ error: "Could not update order." }, { status: 400 }); } }