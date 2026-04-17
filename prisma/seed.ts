import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL } },
});

async function main() {
  // ── Auth user ──────────────────────────────────────────────────
  const password = await bcrypt.hash("changeme123", 12);
  const user = await prisma.user.upsert({
    where: { email: "michaelogclarke@gmail.com" },
    update: {},
    create: {
      name: "Michael Clarke",
      email: "michaelogclarke@gmail.com",
      password,
    },
  });
  console.log("User seeded:", user.email);

  // ── Clients ────────────────────────────────────────────────────
  const justCakesClient = await prisma.client.upsert({
    where: { id: "client-just-cakes" },
    update: {},
    create: {
      id: "client-just-cakes",
      name: "Just Cakes",
      company: "Just Cakes",
      status: "ACTIVE",
      notes: "Cake e-commerce client. Full storefront + admin panel.",
    },
  });

  const fitconnectClient = await prisma.client.upsert({
    where: { id: "client-fitconnect" },
    update: {},
    create: {
      id: "client-fitconnect",
      name: "Fitconnect",
      company: "Fitconnect",
      status: "ACTIVE",
      notes: "Fitness app for personal trainers and their clients.",
    },
  });

  const littleStarsClient = await prisma.client.upsert({
    where: { id: "client-little-stars" },
    update: {},
    create: {
      id: "client-little-stars",
      name: "Little Stars Nursery",
      company: "Little Stars",
      status: "ACTIVE",
      notes: "Nursery management desktop app.",
    },
  });

  // ── Projects ───────────────────────────────────────────────────
  const justCakesProject = await prisma.project.upsert({
    where: { id: "proj-just-cakes" },
    update: {},
    create: {
      id: "proj-just-cakes",
      name: "Just Cakes",
      description:
        "Full e-commerce storefront for a cake business. Customers can browse products, request quotes, purchase via Stripe, and sign up to a newsletter. Full admin panel.",
      status: "ACTIVE",
      techStack: ["Next.js", "TypeScript", "Stripe", "Brevo", "CSS Modules"],
      repoUrl: "https://github.com/Michaelogclarke/Just-Cakes",
      clientId: justCakesClient.id,
    },
  });

  const fitconnectProject = await prisma.project.upsert({
    where: { id: "proj-fitconnect" },
    update: {},
    create: {
      id: "proj-fitconnect",
      name: "Fitconnect",
      description:
        "Mobile app (iOS/Android) for personal trainers and their clients. Trainers manage clients, set availability, create workout and meal plans, and handle bookings. Clients can find trainers, book sessions, track workouts, and monitor progress.",
      status: "ACTIVE",
      techStack: ["React Native", "Expo", "TypeScript", "Supabase", "Spotify API"],
      repoUrl: "https://github.com/Michaelogclarke/Fitconnect",
      clientId: fitconnectClient.id,
    },
  });

  const nurseryProject = await prisma.project.upsert({
    where: { id: "proj-nursery" },
    update: {},
    create: {
      id: "proj-nursery",
      name: "Little Stars — Nursery App",
      description:
        "Desktop management app for Little Stars nursery. Handles children's records, staff management, room allocation, attendance, rotas, and scheduling. Built as an Electron app.",
      status: "ACTIVE",
      techStack: ["Electron", "React", "Vite", "PostgreSQL", "Docker"],
      repoUrl: "https://github.com/Michaelogclarke/nursery-app",
      clientId: littleStarsClient.id,
    },
  });

  // ── Sample milestones ──────────────────────────────────────────
  await prisma.milestone.createMany({
    skipDuplicates: true,
    data: [
      { id: "ms-jc-1", title: "Storefront launch", status: "COMPLETE", projectId: justCakesProject.id },
      { id: "ms-jc-2", title: "Stripe checkout", status: "COMPLETE", projectId: justCakesProject.id },
      { id: "ms-jc-3", title: "Admin panel v1", status: "COMPLETE", projectId: justCakesProject.id },
      { id: "ms-jc-4", title: "SEO optimisation", status: "IN_PROGRESS", projectId: justCakesProject.id },
      { id: "ms-fc-1", title: "Core MVP (auth, profiles)", status: "COMPLETE", projectId: fitconnectProject.id },
      { id: "ms-fc-2", title: "Bookings & scheduling", status: "COMPLETE", projectId: fitconnectProject.id },
      { id: "ms-fc-3", title: "Workout + nutrition tracking", status: "COMPLETE", projectId: fitconnectProject.id },
      { id: "ms-fc-4", title: "Trainer marketplace", status: "COMPLETE", projectId: fitconnectProject.id },
      { id: "ms-fc-5", title: "TestFlight / public beta", status: "IN_PROGRESS", projectId: fitconnectProject.id },
      { id: "ms-ns-1", title: "Core modules (children, staff, rooms)", status: "COMPLETE", projectId: nurseryProject.id },
      { id: "ms-ns-2", title: "Scheduling system", status: "COMPLETE", projectId: nurseryProject.id },
      { id: "ms-ns-3", title: "Reporting & data export", status: "PENDING", projectId: nurseryProject.id },
    ],
  });

  // ── Sample tasks ───────────────────────────────────────────────
  await prisma.task.createMany({
    skipDuplicates: true,
    data: [
      { id: "task-jc-1", title: "Email delivery fixes", status: "DONE", priority: "HIGH", projectId: justCakesProject.id },
      { id: "task-jc-2", title: "SEO meta tags review", status: "IN_PROGRESS", priority: "MEDIUM", projectId: justCakesProject.id },
      { id: "task-jc-3", title: "Admin UX polish", status: "TODO", priority: "LOW", projectId: justCakesProject.id },
      { id: "task-fc-1", title: "Spotify mini player bug fix", status: "TODO", priority: "MEDIUM", projectId: fitconnectProject.id },
      { id: "task-fc-2", title: "Trainer marketplace real user test", status: "IN_PROGRESS", priority: "HIGH", projectId: fitconnectProject.id },
      { id: "task-fc-3", title: "Delete account edge cases", status: "DONE", priority: "HIGH", projectId: fitconnectProject.id },
      { id: "task-ns-1", title: "Capacity logic tests", status: "DONE", priority: "HIGH", projectId: nurseryProject.id },
      { id: "task-ns-2", title: "Reporting module", status: "TODO", priority: "MEDIUM", projectId: nurseryProject.id },
      { id: "task-ns-3", title: "Parent-facing features scoping", status: "TODO", priority: "LOW", projectId: nurseryProject.id },
    ],
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
