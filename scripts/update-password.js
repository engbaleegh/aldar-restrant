#!/usr/bin/env node
require("dotenv").config();
const bcrypt = require("bcrypt");
const path = require("path");

// Import the generated Prisma client
const { PrismaClient } = require(path.join(
  __dirname,
  "..",
  "src",
  "generated",
  "prisma"
));

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("Usage: node scripts/update-password.js <email> <newPassword>");
  process.exit(1);
}

(async () => {
  const prisma = new PrismaClient();
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.update({
      where: { email },
      data: { password: hashed },
    });
    console.log(`Updated password for user: ${user.email}`);
  } catch (err) {
    console.error("Failed to update password:", err.message || err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
