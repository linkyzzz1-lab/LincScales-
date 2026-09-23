/* eslint-disable @next/next/no-html-link-for-pages */
import { prisma } from "@/lib/prisma";
import { FALLBACK_PACKAGES } from "@/lib/catalog";
import PackageCards from "./PackageCards";

export const dynamic = "force-dynamic";
export default async function PackagesPage() {
  let packages = FALLBACK_PACKAGES;
  try { const rows = await prisma.servicePackage.findMany({ where: { active: true }, orderBy: [{ category: "asc" }, { priceCents: "asc" }] }); packages = rows.map((item) => ({ ...item, features: JSON.parse(item.features) as string[] })); } catch { /* Local fallback keeps the catalog previewable before DATABASE_URL is configured. */ }
  return <main className="min-h-screen"><nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10"><a href="/" className="text-sm font-bold tracking-[.18em] text-white">← LINCSCALES</a><a href="/plan-builder" className="text-sm font-semibold text-[#74b7ff]">Build a custom plan ↗</a></nav><div className="mx-auto max-w-7xl px-6 py-14 lg:px-10"><div className="max-w-2xl"><p className="eyebrow mb-5">Preliminary pricing</p><h1 className="text-5xl font-semibold tracking-[-.06em] text-white">Choose your next growth lever.</h1><p className="mt-6 leading-7 text-slate-400">Compare the current starting points for Meta Ads and AI chatbots. Nothing is charged online. Every selection becomes a request for our team to review.</p></div><PackageCards packages={packages} /></div></main>;
}