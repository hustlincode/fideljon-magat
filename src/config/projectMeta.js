// Project metadata without any asset imports.
//
// This file is deliberately free of image imports so it can be loaded directly
// by Node during prerendering. It carries everything needed for SEO (slug,
// title, summary, tags), while projectsData.js adds the screenshots that only
// the browser bundle can import.
//
// Adding a project here automatically gives it a prerendered page, a sitemap
// entry and its own metadata.

export const PROJECT_META = [
  {
    slug: "salesportal",
    title: "Salesportal",
    context: "Banquet Sales Management",
    kind: "Web App",
    year: "2024",
    role: "Full-stack developer",
    employer: "Servo IT Solutions OPC",
    summary:
      "A banquet sales portal for a food and catering company, covering the sales workflow from authentication through to order processing.",
    description:
      "A sales portal for Banquuet, a company that provides food and catering services. Built with Bootstrap, HTML, and JQuery, PHP, and MySQL. Features include user authentication, product management, order processing, and real-time updates.",
    features: [
      "User authentication and role-based access",
      "Product and package management for banquet offerings",
      "Order processing across the sales workflow",
      "Real-time updates"
    ],
    contribution:
      "Contributed across the full stack, from the PHP/MySQL data layer through to the jQuery and Bootstrap interface.",
    tags: ["PHP", "jQuery", "Bootstrap", "MySQL"]
  },
  {
    slug: "xolf",
    title: "XOLF",
    context: "Online Check-in System",
    kind: "Serverless",
    year: "2025",
    role: "Full-stack developer",
    employer: "Servo IT Solutions OPC",
    summary:
      "A serverless online check-in platform, built on AWS Lambda and DynamoDB with a React front end.",
    description:
      "An online check-in system for XOLF, a company that provides online check-in services. Built with React, Node.js, AWS Lambda, and DynamoDB. Features include user authentication, booking management, and real-time updates.",
    features: [
      "User authentication",
      "Booking and check-in management",
      "Serverless architecture on AWS Lambda",
      "Real-time updates"
    ],
    contribution:
      "Built the React front end against a serverless Node.js backend, with DynamoDB as the data store.",
    tags: ["React", "Node.js", "AWS Lambda", "DynamoDB"]
  },
  {
    slug: "slfreemed",
    title: "SLFreemed",
    context: "Medicine Inventory",
    kind: "Capstone Project",
    year: "2024",
    role: "Developer (capstone)",
    employer: "Pampanga State Agricultural University",
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
    tags: ["HTML/CSS/JS", "PHP", "MySQL", "QR Prescriptions"]
  }
];

export const getProjectMeta = (slug) =>
  PROJECT_META.find((project) => project.slug === slug) ?? null;

export const projectPath = (slug) => `/project/${slug}`;
