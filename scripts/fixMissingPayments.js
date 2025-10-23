// scripts/fixMissingPayments.js
// Run this once to fix existing users without payment records

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixMissingPayments() {
  console.log("🔍 Checking for users without payment records...\n");

  try {
    // 1️⃣ Get all users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        plan: true,
        contactLimit: true,
        emailLimit: true,
        createdAt: true,
      },
    });

    console.log(`📊 Total users in database: ${allUsers.length}`);

    // 2️⃣ Get all user IDs that have payment records
    const usersWithPayments = await prisma.payment.findMany({
      select: { userId: true },
      distinct: ["userId"],
    });

    const userIdsWithPayments = new Set(
      usersWithPayments.map((p) => p.userId)
    );

    // 3️⃣ Find users without payment records
    const usersWithoutPayments = allUsers.filter(
      (user) => !userIdsWithPayments.has(user.id)
    );

    console.log(`❌ Users without payment records: ${usersWithoutPayments.length}\n`);

    if (usersWithoutPayments.length === 0) {
      console.log("✅ All users have payment records. Nothing to fix!");
      return;
    }

    // 4️⃣ Create payment records for users without them
    let fixedCount = 0;
    let failedCount = 0;

    for (const user of usersWithoutPayments) {
      try {
        // Determine credits based on user's current plan
        let emailVerificationCredits = 50;
        let emailSendCredits = 50;
        let amount = 0;
        let planPrice = 0;

        // If user has a paid plan, use their current limits
        if (user.plan && user.plan.toLowerCase() !== "free") {
          emailVerificationCredits = user.contactLimit || 0;
          emailSendCredits = user.emailLimit || 0;
        } else {
          // For free plan, ensure 50/50 credits
          emailVerificationCredits = 50;
          emailSendCredits = 50;

          // Update user table to ensure consistency
          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan: "free",
              contactLimit: 50,
              emailLimit: 50,
            },
          });
        }

        // Create payment record
        const payment = await prisma.payment.create({
          data: {
            userId: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            transactionId: `RESTORE-${Date.now()}-${user.id}`,
            planName: user.plan?.toLowerCase() || "free",
            planType: user.plan?.toLowerCase() || "free",
            provider: "system",
            emailVerificationCredits,
            emailSendCredits,
            amount,
            currency: "usd",
            planPrice,
            discount: 0,
            paymentMethod: "none",
            cardLast4: "",
            billingAddress: "",
            paymentDate: user.createdAt || new Date(),
            nextPaymentDate: new Date(
              new Date().setFullYear(new Date().getFullYear() + 100)
            ),
            status: "succeeded",
          },
        });

        console.log(
          `✅ Fixed user ID ${user.id} (${user.email}): ${emailVerificationCredits} verification / ${emailSendCredits} send credits`
        );
        fixedCount++;
      } catch (error) {
        console.error(`❌ Failed to fix user ID ${user.id}:`, error.message);
        failedCount++;
      }
    }

    console.log("\n📈 Summary:");
    console.log(`   ✅ Successfully fixed: ${fixedCount} users`);
    console.log(`   ❌ Failed to fix: ${failedCount} users`);
    console.log(`   📊 Total processed: ${usersWithoutPayments.length} users`);
  } catch (error) {
    console.error("❌ Error in migration:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
fixMissingPayments()
  .then(() => {
    console.log("\n🎉 Migration completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Migration failed:", error);
    process.exit(1);
  });