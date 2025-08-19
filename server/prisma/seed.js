import {prisma } from "../prisma/prismaClient.js";

const prisma = new prisma();

async function main() {
  // Insert fake clients
  await prisma.client.createMany({
    data: [
      {
        name: "John Doe",
        email: "john@example.com",
        status: "Active",
        score: 98,
        syntax_valid: true,
        domain_valid: true,
        mailbox_exists: true,
        catch_all: false,
        disposable: false,
        role_based: false,
        greylisted: false,
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        status: "Inactive",
        score: 45,
        syntax_valid: true,
        domain_valid: false,
        mailbox_exists: false,
        catch_all: false,
        disposable: true,
        role_based: false,
        greylisted: true,
      },
    ],
  });

  // Insert fake activities
  await prisma.activity.createMany({
    data: [
      { action: "Verified 200 emails", time: "2 hours ago" },
      { action: "Added new client - Sarah Lee", time: "4 hours ago" },
    ],
  });

  // Insert fake verification history
  await prisma.verificationHistory.createMany({
    data: [
      {
        email: "john@example.com",
        status: "valid",
        score: 98,
        verifiedAt: new Date("2025-08-16T10:30:00Z"),
      },
      {
        email: "jane@example.com",
        status: "invalid",
        score: 45,
        verifiedAt: new Date("2025-08-15T20:15:00Z"),
      },
    ],
  });
}

main()
  .then(() => {
    console.log("✅ Database seeded successfully");
  })
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
