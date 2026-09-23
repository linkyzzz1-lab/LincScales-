import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const packages = [
  ["meta-launch", "Launch", "META_ADS", 14900, "ONE_TIME", "A focused campaign setup for your first confident step into paid growth.", ["Account & pixel audit", "Campaign architecture", "Creative direction", "30-day launch map"]],
  ["meta-growth", "Growth", "META_ADS", 29900, "MONTHLY", "A steady performance engine for teams ready to turn attention into action.", ["Everything in Launch", "Weekly optimization", "Audience testing", "Monthly performance report"]],
  ["meta-scale", "Scale", "META_ADS", 49900, "MONTHLY", "Full-funnel momentum with the strategy and rigor to compound results.", ["Everything in Growth", "Multi-channel retargeting", "Creative testing system", "Priority strategy calls"]],
  ["ai-basic", "Basic", "AI_CHATBOT", 2900, "MONTHLY", "One sharp AI assistant for the questions your customers ask most.", ["1 assistant", "Guided setup", "Knowledge base"]],
  ["ai-pro", "Pro", "AI_CHATBOT", 7900, "MONTHLY", "A smarter support layer that qualifies, routes, and converts around the clock.", ["3 assistants", "Conversation insights", "Handoff workflows"]],
  ["ai-elite", "Elite", "AI_CHATBOT", 14900, "MONTHLY", "A custom AI team trained on your business, brand voice, and workflows.", ["Unlimited assistants", "Custom workflows", "Priority support"]],
];

for (const [slug, name, category, priceCents, frequency, description, features] of packages) {
  await prisma.servicePackage.upsert({ where: { slug }, update: { name, category, priceCents, frequency, description, features: JSON.stringify(features), active: true }, create: { slug, name, category, priceCents, frequency, description, features: JSON.stringify(features) } });
}
await prisma.$disconnect();