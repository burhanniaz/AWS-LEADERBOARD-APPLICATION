-- Reference snapshot of the current database schema (public schema on Supabase).
-- This is documentation only — it is NOT run automatically. The tables already
-- exist in the database exactly as described here (originally created by
-- `prisma db push`). Prisma is no longer used at runtime or for migrations;
-- make future schema changes by hand (e.g. via the Supabase SQL editor or
-- `psql "$DATABASE_URL"`) and update this file to match.

CREATE TYPE "AdminRole" AS ENUM ('OWNER', 'EVALUATOR');
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ALUMNI');
CREATE TYPE "Department" AS ENUM (
  'COMPUTER_SCIENCE',
  'SOFTWARE_ENGINEERING',
  'COMPUTER_ENGINEERING',
  'TELECOM_ENGINEERING'
);

CREATE TABLE "AdminUser" (
  id            text PRIMARY KEY,
  email         text UNIQUE NOT NULL,
  name          text NOT NULL,
  "passwordHash" text NOT NULL,
  role          "AdminRole" NOT NULL DEFAULT 'EVALUATOR',
  "isActive"    boolean NOT NULL DEFAULT true,
  "createdAt"   timestamp NOT NULL DEFAULT now(),
  "updatedAt"   timestamp NOT NULL
);

-- A time-boxed program session (e.g. "2026 Cohort"). All evaluations belong to
-- exactly one cycle so each year's record stays intact instead of being overwritten.
CREATE TABLE "Cycle" (
  id         text PRIMARY KEY,
  name       text UNIQUE NOT NULL,
  slug       text UNIQUE NOT NULL,
  "startDate" timestamp NOT NULL,
  "endDate"   timestamp,
  "isActive"  boolean NOT NULL DEFAULT false,
  notes      text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL
);
CREATE INDEX ON "Cycle" ("isActive");

-- A position within the builder group. Editable from the admin panel.
CREATE TABLE "Role" (
  id          text PRIMARY KEY,
  name        text UNIQUE NOT NULL,
  slug        text UNIQUE NOT NULL,
  description text,
  color       text NOT NULL DEFAULT '#FF9900',
  rank        integer NOT NULL DEFAULT 100,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL
);
CREATE INDEX ON "Role" (rank);

CREATE TABLE "Student" (
  id             text PRIMARY KEY,
  "fullName"     text NOT NULL,
  email          text UNIQUE NOT NULL,
  "whatsappNumber" text,
  "rollNumber"   text,
  department     "Department",
  bio            text,
  "linkedinUrl"  text,
  status         "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
  "joinedAt"     timestamp NOT NULL DEFAULT now(),
  "createdAt"    timestamp NOT NULL DEFAULT now(),
  "updatedAt"    timestamp NOT NULL
);
CREATE INDEX ON "Student" (status);
CREATE INDEX ON "Student" ("fullName");

-- Role history: a student can hold different roles across cycles.
CREATE TABLE "RoleAssignment" (
  id         text PRIMARY KEY,
  "studentId" text NOT NULL REFERENCES "Student"(id) ON DELETE CASCADE,
  "roleId"    text NOT NULL REFERENCES "Role"(id) ON DELETE RESTRICT,
  "cycleId"   text NOT NULL REFERENCES "Cycle"(id) ON DELETE CASCADE,
  "startedAt" timestamp NOT NULL DEFAULT now(),
  "endedAt"   timestamp,
  note       text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  UNIQUE ("studentId", "roleId", "cycleId")
);
CREATE INDEX ON "RoleAssignment" ("cycleId");
CREATE INDEX ON "RoleAssignment" ("studentId");

-- A scoring dimension (Skills, Training, Workshops, Leadership, Contributions...).
-- `weight` multiplies raw scores when computing the leaderboard total.
CREATE TABLE "Category" (
  id          text PRIMARY KEY,
  name        text UNIQUE NOT NULL,
  slug        text UNIQUE NOT NULL,
  description text,
  weight      double precision NOT NULL DEFAULT 1,
  "maxScore"  integer NOT NULL DEFAULT 10,
  color       text NOT NULL DEFAULT '#0972D3',
  icon        text NOT NULL DEFAULT 'star',
  "order"     integer NOT NULL DEFAULT 100,
  "isActive"  boolean NOT NULL DEFAULT true,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL
);
CREATE INDEX ON "Category" ("order");

-- A single scored, justified, timestamped judgement of one student.
-- `reason` is required by design — a score with no justification cannot be
-- defended later when this data becomes the selection guideline.
CREATE TABLE "Evaluation" (
  id          text PRIMARY KEY,
  "studentId"  text NOT NULL REFERENCES "Student"(id) ON DELETE CASCADE,
  "categoryId" text NOT NULL REFERENCES "Category"(id) ON DELETE RESTRICT,
  "cycleId"    text NOT NULL REFERENCES "Cycle"(id) ON DELETE CASCADE,
  "evaluatorId" text REFERENCES "AdminUser"(id) ON DELETE SET NULL,
  title       text NOT NULL,
  score       double precision NOT NULL,
  "maxScore"  double precision NOT NULL DEFAULT 10,
  reason      text NOT NULL,
  "evidenceUrl" text,
  "occurredAt" timestamp NOT NULL DEFAULT now(),
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL
);
CREATE INDEX ON "Evaluation" ("studentId", "cycleId");
CREATE INDEX ON "Evaluation" ("cycleId", "categoryId");
CREATE INDEX ON "Evaluation" ("occurredAt");

CREATE TABLE "Skill" (
  id         text PRIMARY KEY,
  name       text UNIQUE NOT NULL,
  slug       text UNIQUE NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE "StudentSkill" (
  "studentId" text NOT NULL REFERENCES "Student"(id) ON DELETE CASCADE,
  "skillId"   text NOT NULL REFERENCES "Skill"(id) ON DELETE CASCADE,
  level      integer NOT NULL DEFAULT 1,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY ("studentId", "skillId")
);

-- Audit trail — who changed what, so scores stay defensible.
CREATE TABLE "ActivityLog" (
  id        text PRIMARY KEY,
  "actorId" text REFERENCES "AdminUser"(id) ON DELETE SET NULL,
  action    text NOT NULL,
  entity    text NOT NULL,
  "entityId" text,
  summary   text NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX ON "ActivityLog" ("createdAt");
