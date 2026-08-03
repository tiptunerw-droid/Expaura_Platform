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

const PLANS = [
  {
    name: "Basic",
    priceMonthly: "15000",
    maxBranches: 1,
    maxStaff: 3,
    analyticsEnabled: false,
    aiSummaryEnabled: false,
    complaintsEnabled: true,
    employeeTrackingEnabled: false,
  },
  {
    name: "Standard",
    priceMonthly: "45000",
    maxBranches: 3,
    maxStaff: 10,
    analyticsEnabled: true,
    aiSummaryEnabled: true,
    complaintsEnabled: true,
    employeeTrackingEnabled: true,
  },
  {
    name: "Premium",
    priceMonthly: "95000",
    maxBranches: 10,
    maxStaff: 25,
    analyticsEnabled: true,
    aiSummaryEnabled: true,
    complaintsEnabled: true,
    employeeTrackingEnabled: true,
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
      console.log(`  - ${plan.name} (exists)`);
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
