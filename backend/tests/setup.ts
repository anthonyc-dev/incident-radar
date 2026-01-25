import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Global setup (runs once before all tests)
beforeAll(async () => {
  // Optional: Run migrations or seed data
  await prisma.$connect();
});

// Global teardown (runs once after all tests)
afterAll(async () => {
  await prisma.user.deleteMany(); // Clean up test data
  await prisma.$disconnect();
});

// Reset database before each test
beforeEach(async () => {
  await prisma.user.deleteMany();
});