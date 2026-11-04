// Project metadata without any asset imports.
//
// This file is deliberately free of image imports so it can be loaded directly
// by Node during prerendering. It carries everything needed for SEO (slug,
// title, summary, tags), while projectsData.js adds the screenshots that only
// the browser bundle can import.
//
// Adding a project here automatically gives it a prerendered page, a sitemap
// entry and its own metadata.
//
// `category` splits the portfolio into the two groups the Projects page shows:
//   work     -- client / employer work
//   personal -- independent builds, experiments and school capstones
//
// `tagline` is the one-line description shown on the index, with `year`
// right-aligned in the same row. The longer `summary`/`description` fields
// feed the detail page + SEO.
//
// `clientName`/`clientNote` fill the case-study identity card, `highlights`
// and `stack` feed the Features / Highlights / Built with sections, and
// `heroCaption` captions the first screenshot in the carousel.

export const PROJECT_META = [
  {
    slug: "confidential-work-01",
    title: "Project 1",
    context: "Engineering contributions",
    kind: "Web application",
    category: "work",
    badge: "NDA",
    year: "2024",
    role: "Full-stack developer",
    clientNote: "Identity withheld under NDA",
    heroCaption: "Permanently blurred preview. Interface details withheld under NDA.",
    tagline: "Full-stack development with ownership of backend application work.",
    summary: "Full-stack engineering contributions to a confidential team project, focused on backend development and data handling.",
    description: "Client identities, product features, and interface details are withheld under NDA. This entry describes my general engineering contributions only.",
    contribution: "Took ownership of a defined application module within a team-built product, working across backend logic, database-backed data handling, and browser presentation.",
    highlights: [
      "Backend ownership: implemented the assigned module in PHP, taking responsibility for its application logic within the wider team codebase.",
      "Data processing: worked with MySQL-backed application records to retrieve, organize, and prepare data for use by the application.",
      "Full-stack implementation: connected backend processing with browser presentation using the existing jQuery and Bootstrap interface."
    ],
    stack: [
      { label: "Frontend", items: ["Bootstrap", "jQuery"] },
      { label: "Backend & data", items: ["PHP", "MySQL"] }
    ],
    tags: ["PHP", "jQuery", "Bootstrap", "MySQL"]
  },
  {
    slug: "confidential-work-02",
    title: "Project 2",
    context: "Engineering contributions",
    kind: "Web application",
    category: "work",
    badge: "NDA",
    year: "2025",
    role: "Full-stack developer",
    clientNote: "Identity withheld under NDA",
    heroCaption: "Permanently blurred preview. Interface details withheld under NDA.",
    tagline: "Frontend development and integration with backend services.",
    summary: "Full-stack engineering contributions to a confidential team project, focused on React interfaces and backend integration.",
    description: "Client identities, product features, and interface details are withheld under NDA. This entry describes my general engineering contributions only.",
    contribution: "Built the React frontend for a team-developed application, connecting interface behavior to backend services and carrying that work across the client-service boundary.",
    highlights: [
      "Frontend development: translated assigned application requirements into React interfaces within an existing team project.",
      "Service integration: connected the React frontend to Node.js backend services so interface interactions could exchange application data.",
      "Implementation coordination: aligned frontend behavior with backend integration requirements, contributing across the interface and service layers without exposing the underlying product workflows."
    ],
    stack: [
      { label: "Frontend", items: ["React"] },
      { label: "Technologies", items: ["Node.js", "AWS Lambda", "DynamoDB"] }
    ],
    tags: ["React", "Node.js", "AWS Lambda", "DynamoDB"]
  },
  {
    slug: "aether-dental",
    title: "Aether Dental",
    context: "Clinic Booking & Management",
    kind: "Full-stack App",
    category: "personal",
    year: "2026",
    role: "Designer & full-stack developer",
    employer: "Personal project",
    liveUrl: "https://aether-dental-clinic.vercel.app/",
    clientName: "Aether Dental",
    clientNote: "Dental clinic platform",
    heroCaption: "Public homepage with the appointment booking entry point.",
    tagline:
      "Dental clinic booking and management for patients and staff.",
    summary:
      "A full-stack dental clinic platform with a mobile-first booking flow and a role-based staff dashboard for appointments, patients, services, and daily clinic operations.",
    description:
      "Aether Dental is a clinic booking and management system built as a personal portfolio project. Patients book appointments through a multi-step flow with live availability, server-side double-booking prevention, and instant email confirmation. Staff manage the clinic through a role-based dashboard covering appointments, calendars, patients, dentists, services, notifications, and activity logs.",
    features: [
      "Multi-step public booking: service, dentist, date, time, details, review, confirm",
      "Dynamic availability that honors clinic hours, dentist schedules, breaks, and blocked dates",
      "Server-side double-booking prevention with transactional re-checks",
      "Role-based staff access for admins, receptionists, and dentists",
      "Dashboard, appointment calendar, patient CRM, services, and notifications",
      "Instant booking confirmation emails with an appointment reference"
    ],
    contribution:
      "Designed and built the full application: data model, booking engine, authenticated staff workflows, REST API, and the public and admin interfaces.",
    highlights: [
      "Designed the data model and built the booking engine with transactional double-booking checks.",
      "Implemented role-based staff access for admins, receptionists, and dentists.",
      "Shipped a validated REST API with centralized errors and auth/role middleware.",
      "Decoupled confirmation emails so SMTP failures never roll back a booking.",
      "Added a read-only demo mode that blocks every mutating API route.",
      "Built a custom design system with Tailwind CSS v4, shadcn/ui, and Radix UI, enforced by local token guardrails."
    ],
    stack: [
      {
        label: "Frontend",
        items: ["Next.js", "React", "TypeScript"]
      },
      {
        label: "Styling & design system",
        items: [
          "Tailwind CSS v4",
          "shadcn/ui",
          "Radix UI",
          "CVA",
          "lucide-react",
          "tw-animate-css",
          "Custom cn engine",
          "Custom theme provider"
        ]
      },
      {
        label: "Backend & data",
        items: [
          "Next.js Route Handlers",
          "Prisma",
          "PostgreSQL (Supabase)",
          "NextAuth / Auth.js",
          "Zod",
          "Nodemailer",
          "bcryptjs"
        ]
      },
      {
        label: "Client/UI libraries",
        items: ["TanStack Table", "Recharts", "react-hook-form", "sonner", "date-fns"]
      },
      {
        label: "Tooling",
        items: ["ESLint 9", "Custom token guardrails", "tsx", "npm"]
      }
    ],
    tags: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS v4",
      "shadcn/ui",
      "Prisma",
      "PostgreSQL",
      "Supabase",
      "NextAuth",
      "Zod"
    ]
  },
  {
    slug: "code-review-assistant",
    title: "Code Review Assistant",
    context: "AI-assisted Code Review",
    kind: "Developer Tool",
    category: "personal",
    badge: "Mini project",
    year: "2026",
    role: "Designer & developer",
    employer: "Personal project",
    liveUrl: "https://aether-code-review.vercel.app/",
    clientName: "Code Review Assistant",
    clientNote: "Developer tool",
    heroCaption:
      "Review workspace with syntax-highlighted code and scored feedback.",
    tagline:
      "Hybrid static and AI-assisted code review with scored feedback.",
    summary:
      "A Next.js code review workspace that combines static rules with an AI review provider, syntax-highlighted previews, and scored feedback.",
    description:
      "A code review assistant that lets developers paste or upload a file, choose a language, and inspect a syntax-highlighted preview before running a review. The review engine is a framework-agnostic TypeScript core built around rules and pluggable AI providers, with severity scoring for errors, warnings, and style suggestions.",
    features: [
      "Multi-language editor with PrismJS syntax highlighting",
      "Hybrid review engine: static rules plus a pluggable AI provider",
      "Scored feedback grouped by errors, warnings, and information",
      "Light and dark themes with an in-app toggle",
      "File upload and sample-code shortcuts"
    ],
    contribution:
      "Built the product end to end: the TypeScript review core, API route, editor UI, and review results panel.",
    highlights: [
      "Built a framework-agnostic TypeScript review core around rules and pluggable AI providers.",
      "Wrapped PrismJS behind a highlighting adapter with a central language registry.",
      "Added a Next.js API route that returns scored feedback grouped by severity.",
      "Shipped light and dark themes with a persisted in-app toggle."
    ],
    stack: [
      {
        label: "Frontend",
        items: ["Next.js", "React", "TypeScript", "Tailwind CSS"]
      },
      { label: "Editor", items: ["PrismJS", "Language registry"] },
      { label: "Review engine", items: ["TypeScript rules", "Pluggable AI provider"] }
    ],
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "PrismJS"]
  },
  {
    slug: "slfreemed",
    title: "SLFreemed",
    context: "Medicine Inventory",
    kind: "Capstone Project",
    category: "personal",
    badge: "Capstone",
    year: "2024",
    role: "Developer (capstone)",
    employer: "Pampanga State Agricultural University",
    clientName: "Pampanga State Agricultural University",
    clientNote: "BS Information Technology capstone",
    heroCaption: "Medicine inventory and QR prescription system.",
    tagline: "Medicine inventory with QR-based prescriptions and report generation.",
    summary:
      "A school capstone project: an inventory system for managing medicine stock, with QR-based prescriptions and report generation.",
    description:
      "A school capstone project: an inventory system to manage the stocks of medicines. Built with HTML, CSS, JavaScript, PHP, and MySQL (XAMPP). Features include stock management, record management, QR prescriptions, report generation.",
    features: [
      "Stock management for medicines",
      "Record management",
      "QR-based prescriptions",
      "Report generation"
    ],
    contribution:
      "Designed and built the system as the capstone project for a BS in Information Technology.",
    highlights: [
      "Built the PHP/MySQL data layer for medicine stock and records.",
      "Generated inventory reports from live stock data.",
      "Added QR-based prescriptions to speed up dispensing and tracking."
    ],
    stack: [
      { label: "Frontend", items: ["HTML", "CSS", "JavaScript"] },
      { label: "Backend & data", items: ["PHP", "MySQL", "XAMPP"] },
      { label: "Capstone features", items: ["QR prescriptions", "Report generation"] }
    ],
    tags: ["HTML/CSS/JS", "PHP", "MySQL", "QR Prescriptions"]
  }
];

export const getProjectMeta = (slug) =>
  PROJECT_META.find((project) => project.slug === slug) ?? null;

export const projectPath = (slug) => `/project/${slug}`;
