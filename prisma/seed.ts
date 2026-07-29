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
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
