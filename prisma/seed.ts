import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const hash = await bcrypt.hash('test1234', 12);
  const user = await prisma.user.upsert({
    where: { email: 'test@megaai.uz' },
    update: {},
    create: {
      username: 'testuser',
      email: 'test@megaai.uz',
      passwordHash: hash,
    },
  });

  // Give them a monthly subscription
  const now = new Date();
  const end = new Date(now);
  end.setMonth(end.getMonth() + 1);

  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      planType: 'monthly',
      startDate: now,
      endDate: end,
      status: 'active',
    },
  });

  console.log('✅ Seed complete — test user created: testuser / test1234');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
