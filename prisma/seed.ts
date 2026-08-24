import 'dotenv/config'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL as string, { prepare: false })

const ROLES = [
  { name: 'Logistics', slug: 'captain', rank: 100, color: '#FF9900', description: 'Leads the chapter and owns overall direction.' },
  { name: 'HR', slug: 'co-captain', rank: 100, color: '#EC7211', description: 'Supports the captain and deputises when needed.' },
  { name: 'Event Management', slug: 'team-lead', rank: 100, color: '#0972D3', description: 'Owns a track (cloud, web, AI/ML, community).' },
  { name: 'Skills & Training', slug: 'mentor', rank: 100, color: '#00A1C9', description: 'Guides and evaluates junior members.' },
  { name: 'Core Member', slug: 'core-member', rank: 100, color: '#037F0C', description: 'Consistently delivers on assigned work.' },
  { name: 'Operational', slug: 'member', rank: 100, color: '#5F6B7A', description: 'Active participant in the builder group.' },
]

const CATEGORIES = [
  { name: 'Skills', slug: 'skills', weight: 1.5, maxScore: 10, order: 10, color: '#2E72B5', icon: 'skills', description: 'Demonstrated technical ability on AWS and general engineering.' },
  { name: 'Training', slug: 'training', weight: 1.2, maxScore: 10, order: 20, color: '#1F8F76', icon: 'training', description: 'Courses, certifications and learning paths completed.' },
  { name: 'Workshops', slug: 'workshops', weight: 1.0, maxScore: 10, order: 30, color: '#B98A1E', icon: 'workshop', description: 'Attendance, delivery and hands-on lab performance.' },
  { name: 'Contribution', slug: 'contribution', weight: 1.3, maxScore: 10, order: 40, color: '#2E8F55', icon: 'contribution', description: 'Pull requests, projects, docs and other shipped work.' },
  { name: 'Leadership', slug: 'leadership', weight: 1.4, maxScore: 10, order: 50, color: '#7C5FC4', icon: 'leadership', description: 'Ownership, initiative and support for other members.' },
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
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  const name = process.env.SEED_ADMIN_NAME ?? 'Program Lead'

  if (!email || !password) {
    throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set — refusing to create an admin with a default password.')
  }
  if (password.length < 8) {
    throw new Error('SEED_ADMIN_PASSWORD must be at least 8 characters.')
  }

  const [admin] = await sql`
    INSERT INTO "AdminUser" (id, email, name, role, "passwordHash", "isActive", "createdAt", "updatedAt")
    VALUES (${randomUUID()}, ${email}, ${name}, 'OWNER', ${await bcrypt.hash(password, 12)}, true, now(), now())
    ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
    RETURNING email
  `
  console.log(`Admin ready: ${admin.email}`)

  for (const role of ROLES) {
    await sql`
      INSERT INTO "Role" (id, name, slug, description, color, rank, "createdAt", "updatedAt")
      VALUES (${randomUUID()}, ${role.name}, ${role.slug}, ${role.description}, ${role.color}, ${role.rank}, now(), now())
      ON CONFLICT (slug) DO NOTHING
    `
  }
  console.log(`Roles ready: ${ROLES.length}`)

  for (const category of CATEGORIES) {
    await sql`
      INSERT INTO "Category" (id, name, slug, description, weight, "maxScore", "order", color, icon, "isActive", "createdAt", "updatedAt")
      VALUES (${randomUUID()}, ${category.name}, ${category.slug}, ${category.description}, ${category.weight}, ${category.maxScore}, ${category.order}, ${category.color}, ${category.icon}, true, now(), now())
      ON CONFLICT (slug) DO NOTHING
    `
  }
  console.log(`Categories ready: ${CATEGORIES.length}`)

  for (const skillName of SKILLS) {
    const slug = slugify(skillName)
    await sql`
      INSERT INTO "Skill" (id, name, slug, "createdAt")
      VALUES (${randomUUID()}, ${skillName}, ${slug}, now())
      ON CONFLICT (slug) DO NOTHING
    `
  }
  console.log(`Skills ready: ${SKILLS.length}`)

  const year = new Date().getFullYear()
  const [cycle] = await sql`
    INSERT INTO "Cycle" (id, name, slug, "startDate", "isActive", notes, "createdAt", "updatedAt")
    VALUES (${randomUUID()}, ${`Cohort ${year}`}, ${`cohort-${year}`}, ${new Date(`${year}-01-01`)}, true, 'Auto-created starting cycle.', now(), now())
    ON CONFLICT (slug) DO UPDATE SET slug = EXCLUDED.slug
    RETURNING name
  `
  console.log(`Cycle ready: ${cycle.name}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await sql.end()
  })
