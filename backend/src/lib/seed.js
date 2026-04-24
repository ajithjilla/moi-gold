require("dotenv").config();
const bcrypt = require("bcryptjs");
const prisma = require("./prisma");
const env = require("./env");

const defaultSettings = {
  app_name: "Moi Tech",
  brand_title: "Moi Tech",
  brand_subtitle: "Moi Management System",
  support_email: "admin@moitech.in",
  welcome_message_ta: "வாழ்த்துக்கள்! உங்கள் மொய் பட்டியல் புதுப்பிக்கப்பட்டது.",
  footer_note: "Powered by Moi Tech",
};

async function main() {
  console.log("Seeding database...");

  for (const [key, value] of Object.entries(defaultSettings)) {
    await prisma.setting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }

  const adminHash = await bcrypt.hash("admin123", env.BCRYPT_ROUNDS);
  const admin = await prisma.user.upsert({
    where: { phone: "9000000000" },
    update: {},
    create: {
      name: "Super Admin",
      phone: "9000000000",
      email: "admin@moitech.in",
      password_hash: adminHash,
      role: "ADMIN",
    },
  });
  console.log("Admin:", admin.email);

  const aff1Hash = await bcrypt.hash("ravi123", env.BCRYPT_ROUNDS);
  const affUser1 = await prisma.user.upsert({
    where: { phone: "9811234567" },
    update: {},
    create: {
      name: "Ravi Kumar",
      phone: "9811234567",
      email: "ravi@gmail.com",
      password_hash: aff1Hash,
      role: "AFFILIATE",
    },
  });
  const affiliate1 = await prisma.affiliate.upsert({
    where: { user_id: affUser1.id },
    update: {},
    create: { user_id: affUser1.id, plan: "PRO", status: "ACTIVE", revenue: 3600 },
  });

  const aff2Hash = await bcrypt.hash("prabha123", env.BCRYPT_ROUNDS);
  const affUser2 = await prisma.user.upsert({
    where: { phone: "9822345678" },
    update: {},
    create: {
      name: "Prabhakaran S",
      phone: "9822345678",
      email: "prabha@gmail.com",
      password_hash: aff2Hash,
      role: "AFFILIATE",
    },
  });
  await prisma.affiliate.upsert({
    where: { user_id: affUser2.id },
    update: {},
    create: { user_id: affUser2.id, plan: "BASIC", status: "ACTIVE", revenue: 1500 },
  });

  const writerHash = await bcrypt.hash("writer123", env.BCRYPT_ROUNDS);
  const writer1 = await prisma.user.upsert({
    where: { phone: "9876500001" },
    update: {},
    create: { name: "Senthil M", phone: "9876500001", password_hash: writerHash, role: "USER" },
  });
  const writer2 = await prisma.user.upsert({
    where: { phone: "9876500002" },
    update: {},
    create: { name: "Priya D", phone: "9876500002", password_hash: writerHash, role: "USER" },
  });

  const event1 = await prisma.event.upsert({
    where: { id: "event-seed-1" },
    update: {},
    create: {
      id: "event-seed-1",
      name: "Murugan & Kavitha Wedding",
      type: "WEDDING",
      date: new Date("2025-02-10"),
      venue: "Madurai Palace",
      owner_name: "Murugan S",
      owner_phone: "9876543210",
      owner_email: "murugan@gmail.com",
      affiliate_id: affiliate1.id,
      status: "COMPLETED",
      writer_access_enabled: true,
      share_enabled: true,
    },
  });
  const event2 = await prisma.event.upsert({
    where: { id: "event-seed-2" },
    update: {},
    create: {
      id: "event-seed-2",
      name: "Priya's Ear Piercing Ceremony",
      type: "EAR",
      date: new Date("2025-02-18"),
      venue: "Chennai Community Hall",
      owner_name: "Rajesh P",
      owner_phone: "9865432100",
      owner_email: "rajesh@gmail.com",
      affiliate_id: affiliate1.id,
      status: "ACTIVE",
      writer_access_enabled: true,
      share_enabled: false,
    },
  });

  await prisma.eventWriter.upsert({
    where: { event_id_user_id: { event_id: event1.id, user_id: writer1.id } },
    update: {},
    create: { event_id: event1.id, user_id: writer1.id, assigned_by: affUser1.id },
  });
  await prisma.eventWriter.upsert({
    where: { event_id_user_id: { event_id: event1.id, user_id: writer2.id } },
    update: {},
    create: { event_id: event1.id, user_id: writer2.id, assigned_by: affUser1.id },
  });
  await prisma.eventWriter.upsert({
    where: { event_id_user_id: { event_id: event2.id, user_id: writer2.id } },
    update: {},
    create: { event_id: event2.id, user_id: writer2.id, assigned_by: affUser1.id },
  });

  const moiData = [
    { id: "moi-seed-1", event_id: event1.id, giver_name: "Anbu Selvan", amount: 2000, phone: "9876501234", address: "12, Anna Nagar, Chennai", relation: "Uncle", method: "CASH", note: "Blessings", denoms: { "500": 4 }, written_by_id: writer1.id },
    { id: "moi-seed-2", event_id: event1.id, giver_name: "Muthu Lakshmi", amount: 5000, phone: "9865430012", address: "5, Gandhi St, Madurai", relation: "Friend", method: "GPAY", written_by_id: writer2.id },
    { id: "moi-seed-3", event_id: event1.id, giver_name: "Subramanian K", amount: 1500, phone: "9812345678", address: "78, Nehru Road, Trichy", relation: "Colleague", method: "CASH", note: "With love", denoms: { "500": 3 }, written_by_id: writer1.id },
    { id: "moi-seed-4", event_id: event2.id, giver_name: "Viji Ramasamy", amount: 3000, phone: "9800123456", address: "3, Temple St, Thanjavur", relation: "Aunt", method: "CASH", denoms: { "500": 6 }, written_by_id: writer2.id },
  ];
  for (const m of moiData) {
    await prisma.moiEntry.upsert({
      where: { id: m.id },
      update: {},
      create: m,
    });
  }

  console.log("Seed complete.");
  console.log("\nLogin credentials:");
  console.log("  Admin:      phone=9000000000  pass=admin123");
  console.log("  Affiliate:  phone=9811234567  pass=ravi123");
  console.log("  Writer 1:   phone=9876500001  pass=writer123");
  console.log("  Writer 2:   phone=9876500002  pass=writer123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
