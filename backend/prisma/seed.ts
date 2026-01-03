import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ephrathahstream?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Hash for password: 'password123'
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = [
    {
      username: 'admin',
      password: hashedPassword,
      contactNumber: '+1234567890',
      liveMode: 'video',
    },
    {
      username: 'john_doe',
      password: hashedPassword,
      contactNumber: '+1234567891',
      liveMode: 'audio',
    },
    {
      username: 'jane_smith',
      password: hashedPassword,
      contactNumber: '+1234567892',
      liveMode: 'video',
    },
    {
      username: 'bob_audio',
      password: hashedPassword,
      contactNumber: '+1234567893',
      liveMode: 'audio',
    },
    {
      username: 'alice_video',
      password: hashedPassword,
      contactNumber: '+1234567894',
      liveMode: 'video',
    },
  ];

  for (const user of users) {
    try {
      const created = await prisma.users.create({
        data: user,
      });
      console.log(`✓ Created user: ${created.username}`);
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`⊘ User already exists: ${user.username}`);
      } else {
        console.error(`✗ Error creating user ${user.username}:`, error.message);
      }
    }
  }

  // Get total user count
  const count = await prisma.users.count();
  console.log(`\n✅ Seed completed!`);
  console.log(`Total users in database: ${count}`);
  console.log(`\n📝 Test Credentials:`);
  console.log(`  Username: admin      | Password: password123 | Mode: video`);
  console.log(`  Username: john_doe   | Password: password123 | Mode: audio`);
  console.log(`  Username: jane_smith | Password: password123 | Mode: video`);
  console.log(`  Username: bob_audio  | Password: password123 | Mode: audio`);
  console.log(`  Username: alice_video| Password: password123 | Mode: video`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
