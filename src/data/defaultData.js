export const DEFAULT_DATA = {
  docs: [
    { id: 1, title: "Platform Overview", category: "Overview", description: "Complete platform capabilities and architecture overview for new reps and prospects.", timestamp: "2026-01-15", size: "2.4 MB" },
    { id: 2, title: "Feature Capabilities Guide", category: "Features", description: "Deep dive into all platform features with real-world use cases and screenshots.", timestamp: "2026-02-01", size: "1.8 MB" },
    { id: 3, title: "Technical Integration Docs", category: "Technical", description: "API references, webhooks, integration patterns, and developer-facing documentation.", timestamp: "2026-02-20", size: "3.1 MB" },
    { id: 4, title: "Enterprise Use Case Playbook", category: "Use Cases", description: "Industry-specific use cases for enterprise prospects across verticals.", timestamp: "2026-03-01", size: "1.2 MB" },
  ],
  plans: [
    {
      id: 1, name: "Starter", price: "$49/mo",
      features: ["Up to 5 users", "10GB Storage", "Basic Analytics", "Email Support", "Core Integrations"],
      limits: "5 users · 10GB", icp: "Early-stage startups and small teams getting started.",
    },
    {
      id: 2, name: "Growth", price: "$149/mo",
      features: ["Up to 25 users", "100GB Storage", "Advanced Analytics", "Priority Support", "API Access", "Custom Workflows"],
      limits: "25 users · 100GB", icp: "Scaling SMBs with growing teams and advanced needs.",
    },
    {
      id: 3, name: "Enterprise", price: "Custom",
      features: ["Unlimited users", "Unlimited Storage", "Custom Analytics", "Dedicated CSM", "Full API Access", "SSO & SAML", "Audit Logs"],
      limits: "Unlimited", icp: "Large organizations with complex security and compliance requirements.",
    },
  ],
  addons: [
    { id: 1, name: "Advanced Reporting Suite", description: "Custom dashboards, scheduled reports, and multi-format data exports.", price: "$29/mo", plans: "Growth, Enterprise" },
    { id: 2, name: "White-label Branding", description: "Remove platform branding, apply your own logo, colors, and domain.", price: "$49/mo", plans: "Enterprise" },
    { id: 3, name: "Dedicated Account Manager", description: "A dedicated CSM for onboarding, quarterly business reviews, and strategic growth guidance.", price: "$199/mo", plans: "Enterprise" },
    { id: 4, name: "Priority SLA", description: "Guaranteed 1-hour response SLA with 24/7 on-call support access.", price: "$79/mo", plans: "Growth, Enterprise" },
  ],
  videos: [
    { id: 1, title: "Full Platform Walkthrough", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", category: "Demo", description: "End-to-end product demo covering all core modules — ideal for new prospects." },
    { id: 2, title: "Analytics Deep Dive", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", category: "Feature", description: "In-depth showcase of the analytics module with live data and custom dashboards." },
    { id: 3, title: "Integration Setup Guide", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", category: "Technical", description: "Step-by-step walkthrough for setting up integrations with Salesforce, HubSpot, and Slack." },
    { id: 4, title: "Enterprise Security Overview", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", category: "Security", description: "SSO, SAML, audit logging, and data residency controls for enterprise buyers." },
  ],
  resources: [
    { id: 1, title: "Sales Playbook 2026", link: "#", category: "Sales", description: "Complete sales methodology, discovery frameworks, objection handling, and battle cards." },
    { id: 2, title: "Product Training Course", link: "#", category: "Training", description: "Self-paced product training for new sales reps — certification included." },
    { id: 3, title: "Competitor Analysis Deck", link: "#", category: "Strategy", description: "Detailed competitor positioning, differentiation points, and how to win against each." },
    { id: 4, title: "Pricing & Negotiation Guide", link: "#", category: "Sales", description: "Discount thresholds, negotiation tactics, and approval workflows for non-standard deals." },
  ],
  features: [
    { id: 1, name: "AI-Powered Insights", month: "January 2026", description: "Automated insights and recommendations using machine learning on your platform data.", useCase: "Reduces manual analysis time by 60% for operations and analytics teams.", demo: "" },
    { id: 2, name: "Bulk Data Import", month: "February 2026", description: "Import thousands of records via CSV with smart field mapping and validation.", useCase: "Perfect for enterprise migrations and large dataset onboarding workflows.", demo: "" },
    { id: 3, name: "Real-time Collaboration", month: "March 2026", description: "Live multi-user editing with presence indicators, comments, and change history.", useCase: "Enables distributed teams to work simultaneously without merge conflicts.", demo: "" },
  ],
};

export const STORAGE_KEYS = {
  docs: "sip:docs",
  plans: "sip:plans",
  addons: "sip:addons",
  videos: "sip:videos",
  resources: "sip:resources",
  features: "sip:features",
};

export const ACCENT_COLORS = [
  "var(--accent)",
  "var(--accent-blue)",
  "var(--accent-purple)",
  "var(--accent-orange)",
  "var(--accent-green)",
  "var(--accent-pink)",
];

export const CATEGORY_COLORS = {
  Overview: "var(--accent)",
  Features: "var(--accent-blue)",
  Technical: "var(--accent-orange)",
  "Use Cases": "var(--accent-purple)",
  Demo: "var(--accent-blue)",
  Feature: "var(--accent-purple)",
  Security: "var(--accent-green)",
  Sales: "var(--accent)",
  Training: "var(--accent-blue)",
  Strategy: "var(--accent-orange)",
  Documentation: "var(--accent-purple)",
  External: "var(--accent-green)",
};
