import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const ROLES = [
  { name: 'Logistics', slug: 'captain', rank: 10, color: '#FF9900', description: 'Leads the chapter and owns overall direction.' },
  { name: 'HR', slug: 'co-captain', rank: 20, color: '#EC7211', description: 'Supports the captain and deputises when needed.' },
  { name: 'Event Management', slug: 'team-lead', rank: 30, color: '#0972D3', description: 'Owns a track (cloud, web, AI/ML, community).' },
  { name: 'Skills & Training', slug: 'mentor', rank: 40, color: '#00A1C9', description: 'Guides and evaluates junior members.' },
  { name: 'Core Member', slug: 'core-member', rank: 50, color: '#037F0C', description: 'Consistently delivers on assigned work.' },
  { name: 'Operational', slug: 'member', rank: 60, color: '#5F6B7A', description: 'Active participant in the builder group.' },
]

const CATEGORIES = [
  { name: 'Skills', slug: 'skills', weight: 1.5, maxScore: 10, order: 10, color: '#0972D3', icon: 'skills', description: 'Demonstrated technical ability on AWS and general engineering.' },
  { name: 'Training', slug: 'training', weight: 1.2, maxScore: 10, order: 20, color: '#00A1C9', icon: 'training', description: 'Courses, certifications and learning paths completed.' },
  { name: 'Workshops', slug: 'workshops', weight: 1.0, maxScore: 10, order: 30, color: '#FF9900', icon: 'workshop', description: 'Attendance, delivery and hands-on lab performance.' },
  { name: 'Contribution', slug: 'contribution', weight: 1.3, maxScore: 10, order: 40, color: '#037F0C', icon: 'contribution', description: 'Pull requests, projects, docs and other shipped work.' },
  { name: 'Leadership', slug: 'leadership', weight: 1.4, maxScore: 10, order: 50, color: '#8C4FFF', icon: 'leadership', description: 'Ownership, initiative and support for other members.' },
]

const SKILLS = [
  'AWS EC2', 'AWS S3', 'AWS Lambda', 'Amazon DynamoDB', 'Amazon RDS', 'AWS IAM',
  'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Python', 'JavaScript',
  'TypeScript', 'React', 'Node.js', 'Machine Learning', 'Data Analytics',
  'Public Speaking', 'Technical Writing', 'Event Management',
]

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'aws@gmail.com'
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'aws@1234'
  const name = process.env.SEED_ADMIN_NAME ?? 'Zakwan Mustafa'

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name,
      role: 'OWNER',
      passwordHash: await bcrypt.hash(password, 12),
    },
  })
  console.log(`Admin ready: ${admin.email}`)

  for (const role of ROLES) {
    await prisma.role.upsert({ where: { slug: role.slug }, update: {}, create: role })
  }
  console.log(`Roles ready: ${ROLES.length}`)

  for (const category of CATEGORIES) {
    await prisma.category.upsert({ where: { slug: category.slug }, update: {}, create: category })
  }
  console.log(`Categories ready: ${CATEGORIES.length}`)

  for (const skillName of SKILLS) {
    await prisma.skill.upsert({
      where: { slug: slugify(skillName) },
      update: {},
      create: { name: skillName, slug: slugify(skillName) },
    })
  }
  console.log(`Skills ready: ${SKILLS.length}`)

  const year = new Date().getFullYear()
  const cycle = await prisma.cycle.upsert({
    where: { slug: `cohort-${year}` },
    update: {},
    create: {
      name: `Cohort ${year}`,
      slug: `cohort-${year}`,
      startDate: new Date(`${year}-01-01`),
      isActive: true,
      notes: 'Auto-created starting cycle.',
    },
  })
  console.log(`Cycle ready: ${cycle.name}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
