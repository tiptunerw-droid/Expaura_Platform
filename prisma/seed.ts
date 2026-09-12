import { prisma } from "../lib/prisma";

const CITIES = [
  { name: "Kigali", region: "Kigali", country: "Rwanda" },
  { name: "Butare", region: "Southern", country: "Rwanda" },
  { name: "Gisenyi", region: "Western", country: "Rwanda" },
  { name: "Musanze", region: "Northern", country: "Rwanda" },
  { name: "Ruhengeri", region: "Northern", country: "Rwanda" },
  { name: "Muhanga", region: "Southern", country: "Rwanda" },
  { name: "Nyagatare", region: "Eastern", country: "Rwanda" },
  { name: "Rusizi", region: "Western", country: "Rwanda" },
  { name: "Nyamata", region: "Eastern", country: "Rwanda" },
  { name: "Rwamagana", region: "Eastern", country: "Rwanda" },
];

const COMPLAINT_CATEGORIES = [
  { name: "Service", icon: "Smile" },
  { name: "Food quality", icon: "UtensilsCrossed" },
  { name: "Hygiene & cleanliness", icon: "Sparkles" },
  { name: "Pricing / billing", icon: "Receipt" },
  { name: "Wait time", icon: "Clock" },
  { name: "Staff behavior", icon: "Handshake" },
  { name: "Ambience", icon: "Music" },
];

const ALL_FEATURES = {
  analyticsEnabled: true,
  aiSummaryEnabled: true,
  complaintsEnabled: true,
  employeeTrackingEnabled: true,
};

const PLANS = [
  {
    name: "Trial",
    priceMonthly: "0",
    maxBranches: 10,
    maxStaff: 25,
    ...ALL_FEATURES,
  },
  {
    name: "Monthly",
    priceMonthly: "20000",
    maxBranches: 10,
    maxStaff: 25,
    ...ALL_FEATURES,
  },
];

async function main() {
  console.log("Seeding cities...");
  for (const city of CITIES) {
    const existing = await prisma.city.findFirst({ where: { name: city.name } });
    if (!existing) {
      await prisma.city.create({ data: city });
      console.log(`  ✓ ${city.name}`);
    } else {
      console.log(`  - ${city.name} (exists)`);
    }
  }
  console.log("Seeding complaint categories...");
  for (const category of COMPLAINT_CATEGORIES) {
    const existing = await prisma.complaintCategory.findFirst({
      where: { name: category.name },
    });
    if (!existing) {
      await prisma.complaintCategory.create({ data: category });
      console.log(`  ✓ ${category.name}`);
    } else {
      console.log(`  - ${category.name} (exists)`);
    }
  }

  console.log("Seeding plans...");
  for (const plan of PLANS) {
    const existing = await prisma.plan.findFirst({
      where: { name: plan.name },
    });
    if (!existing) {
      await prisma.plan.create({ data: plan });
      console.log(`  ✓ ${plan.name}`);
    } else {
      await prisma.plan.update({ where: { id: existing.id }, data: plan });
      console.log(`  ~ ${plan.name} (updated)`);
    }
  }

  await prisma.plan.updateMany({ data: ALL_FEATURES });
  console.log("  ~ all plans: features enabled (flat pricing)");

  const legacyPlans = await prisma.plan.findMany({
    where: { name: { notIn: ["Trial", "Monthly"] } },
    include: { _count: { select: { subscriptions: true } } },
  });
  for (const plan of legacyPlans) {
    if (plan._count.subscriptions > 0) {
      console.log(`  ! ${plan.name} kept — ${plan._count.subscriptions} subscription(s) still reference it`);
    } else {
      await prisma.plan.delete({ where: { id: plan.id } });
      console.log(`  ✗ ${plan.name} (legacy plan, deleted)`);
    }
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
