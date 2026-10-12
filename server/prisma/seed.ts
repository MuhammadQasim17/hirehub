import { PrismaClient, Role, JobType, ApplicationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for HireHub...');

  // 1. Clean slate: Delete in correct referential integrity order
  console.log('🧹 Clearing existing records (Application -> Job -> User)...');
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();

  // 2. Hash default credentials
  const defaultPassword = await bcrypt.hash('Password123!', 10);

  // 3. Create Recruiters
  console.log('👤 Creating recruiters...');
  const recruiterSarah = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'sarah@techcorp.io',
      password: defaultPassword,
      role: Role.RECRUITER,
      headline: 'Senior Technical Recruiter at CloudScale Tech',
      bio: 'Connecting world-class software engineers and tech leaders with high-growth teams.',
    },
  });

  const recruiterAlex = await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: 'alex@fintechpulse.com',
      password: defaultPassword,
      role: Role.RECRUITER,
      headline: 'Talent Acquisition Lead at NovaPay Solutions',
      bio: 'Leading hiring for fintech innovators, payment infrastructure, and distributed systems.',
    },
  });

  // 4. Create Candidates
  console.log('👤 Creating candidates...');
  const candidateJane = await prisma.user.create({
    data: {
      name: 'Jane Doe',
      email: 'jane.candidate@example.com',
      password: defaultPassword,
      role: Role.CANDIDATE,
      headline: 'Full-Stack Developer | React, TypeScript & Node.js',
      bio: 'Passionate full-stack developer with 4+ years of experience building scalable web applications and clean APIs.',
      resumeUrl: 'https://drive.google.com/file/d/sample-jane-doe-resume/view',
    },
  });

  const candidateJohn = await prisma.user.create({
    data: {
      name: 'John Smith',
      email: 'john.candidate@example.com',
      password: defaultPassword,
      role: Role.CANDIDATE,
      headline: 'Junior Frontend Engineer | React & Tailwind CSS',
      bio: 'Aspiring frontend developer passionate about modern design systems, clean code, and responsive user experiences.',
      resumeUrl: 'https://drive.google.com/file/d/sample-john-smith-resume/view',
    },
  });

  // 5. Create 6 Realistic Job Listings
  console.log('💼 Creating realistic job postings...');
  const jobReact = await prisma.job.create({
    data: {
      title: 'Senior React & TypeScript Developer',
      company: 'CloudScale Tech',
      location: 'Remote',
      type: JobType.REMOTE,
      salary: '$110,000 - $135,000',
      description: `CloudScale Tech is looking for an experienced Senior Frontend Engineer with deep TypeScript and React expertise. You will design, build, and optimize web applications for thousands of daily active users.\n\nKey Responsibilities:\n- Architect modular and reusable component systems in React 19.\n- Integrate complex client-side state management and REST APIs.\n- Ensure top-tier performance, accessibility, and responsive aesthetics.\n\nRequirements:\n- 4+ years of professional React and TypeScript development.\n- Experience with Tailwind CSS and Vite.\n- Strong understanding of web standards, HTTP, and browser APIs.`,
      recruiterId: recruiterSarah.id,
    },
  });

  const jobNode = await prisma.job.create({
    data: {
      title: 'Backend Node.js Engineer',
      company: 'NovaPay Solutions',
      location: 'New York, NY',
      type: JobType.FULL_TIME,
      salary: '$95,000 - $120,000',
      description: `NovaPay Solutions is scaling our transaction processing backend. We are seeking a Backend Node.js Engineer to build resilient distributed services handling millions in daily volume.\n\nKey Responsibilities:\n- Develop high-throughput REST APIs and microservices in Node.js and TypeScript.\n- Model relational database schemas and write optimized queries with Prisma and PostgreSQL.\n- Implement secure authentication and token lifecycle validation.\n\nRequirements:\n- 3+ years experience with Node.js and Express.\n- Strong SQL and database modeling fundamentals.\n- Experience with concurrency, security, and automated integration testing.`,
      recruiterId: recruiterAlex.id,
    },
  });

  const jobJunior = await prisma.job.create({
    data: {
      title: 'Junior Full-Stack Engineer',
      company: 'CloudScale Tech',
      location: 'San Francisco, CA',
      type: JobType.INTERNSHIP,
      salary: '$35/hr',
      description: `Join CloudScale Tech for an intensive 6-month software engineering internship. You will pair directly with senior staff engineers across the full stack.\n\nWhat You Will Do:\n- Contribute to production React components and Express API endpoints.\n- Write unit and smoke tests for critical user flows.\n- Participate in design reviews and collaborative code pairing.\n\nRequirements:\n- Familiarity with JavaScript, TypeScript, React, and Git.\n- Foundational computer science or bootcamp training.\n- Growth mindset and enthusiasm for learning modern web stacks.`,
      recruiterId: recruiterSarah.id,
    },
  });

  const jobDevOps = await prisma.job.create({
    data: {
      title: 'DevOps / Cloud Specialist',
      company: 'NovaPay Solutions',
      location: 'Remote',
      type: JobType.REMOTE,
      salary: '$125,000 - $150,000',
      description: `NovaPay Solutions is looking for a DevOps and Cloud Infrastructure Specialist to lead CI/CD automation, cloud deployment observability, and container orchestrations.\n\nResponsibilities:\n- Manage Dockerized deployment pipelines for frontend and backend services.\n- Monitor database performance, automated backups, and zero-downtime migrations.\n- Implement security baselines, SSL configurations, and secret managers.\n\nRequirements:\n- 3+ years in cloud infrastructure (AWS/GCP, Docker, Render, PostgreSQL).\n- Experience with automated GitHub Actions and infrastructure as code.\n- Strong troubleshooting and observability instincts.`,
      recruiterId: recruiterAlex.id,
    },
  });

  await prisma.job.create({
    data: {
      title: 'Frontend UI/UX Developer',
      company: 'CloudScale Tech',
      location: 'Austin, TX',
      type: JobType.PART_TIME,
      salary: '$55 - $70/hr',
      description: `We need a creative Frontend UI/UX Developer to polish our client dashboards, design system, and marketing pages.\n\nResponsibilities:\n- Translate Figma specifications into pixel-perfect Tailwind CSS components.\n- Improve micro-interactions, responsive breakpoints, and animations.\n- Audit and enhance UI accessibility.\n\nRequirements:\n- Strong visual sensibility with React and Tailwind CSS.\n- Portfolio demonstrating modern web aesthetics and clean styling.`,
      recruiterId: recruiterSarah.id,
    },
  });

  await prisma.job.create({
    data: {
      title: 'Mobile App Engineer (React Native)',
      company: 'NovaPay Solutions',
      location: 'Chicago, IL',
      type: JobType.FULL_TIME,
      salary: '$105,000 - $130,000',
      description: `NovaPay Solutions is launching our flagship mobile payment companion app for iOS and Android.\n\nResponsibilities:\n- Build cross-platform mobile experiences with React Native and TypeScript.\n- Implement biometric authentication, push notifications, and offline caching.\n- Collaborate with backend engineers to integrate REST endpoints.\n\nRequirements:\n- 2+ years shipping production React Native applications.\n- Strong TypeScript habits and native mobile debugging skills.`,
      recruiterId: recruiterAlex.id,
    },
  });

  // 6. Create 2 Initial Applications
  console.log('📝 Creating initial applications...');
  await prisma.application.create({
    data: {
      jobId: jobReact.id,
      candidateId: candidateJane.id,
      status: ApplicationStatus.REVIEWED,
      resumeUrl: candidateJane.resumeUrl || 'https://drive.google.com/sample-resume',
      notes: 'I have 4+ years of React experience and have led frontend migrations to TypeScript. Excited about CloudScale Tech mission!',
    },
  });

  await prisma.application.create({
    data: {
      jobId: jobJunior.id,
      candidateId: candidateJohn.id,
      status: ApplicationStatus.PENDING,
      resumeUrl: candidateJohn.resumeUrl || 'https://drive.google.com/sample-resume',
      notes: 'I have built several full-stack TypeScript projects and would love to learn and contribute as an intern at CloudScale Tech.',
    },
  });

  console.log('✅ HireHub database seeding completed successfully!');
  console.log(`   - 2 Recruiters (Sarah Jenkins, Alex Rivera)`);
  console.log(`   - 2 Candidates (Jane Doe, John Smith)`);
  console.log(`   - 6 Job Listings`);
  console.log(`   - 2 Initial Applications`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

