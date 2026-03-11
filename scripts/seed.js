/**
 * scripts/seed.js
 *
 * Seeds MongoDB Atlas with all real DoubleTick default data.
 * Run ONCE after setting up your database:
 *
 *   MONGODB_URI=your_uri node scripts/seed.js
 *
 * Safe to re-run — clears all collections before inserting.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env.local") });

const uri = process.env.MONGODB_URI;
if (!uri) { console.error("❌  MONGODB_URI not set in .env.local"); process.exit(1); }

// ── Schemas (inline for seed script portability) ──────────────
const Documentation = mongoose.models.Documentation || mongoose.model("Documentation", new mongoose.Schema({
  title: String, description: String, fileUrl: { type: String, default: "" },
  category: String,
}, { timestamps: true }));

const PricingPlan = mongoose.models.PricingPlan || mongoose.model("PricingPlan", new mongoose.Schema({
  name: String, price: String, description: { type: String, default: "" },
  features: [String], limits: String, icp: String,
}, { timestamps: true }));

const Addon = mongoose.models.Addon || mongoose.model("Addon", new mongoose.Schema({
  name: String, description: { type: String, default: "" },
  price: String, compatiblePlans: { type: String, default: "" },
}, { timestamps: true }));

const Video = mongoose.models.Video || mongoose.model("Video", new mongoose.Schema({
  title: String, videoUrl: String, description: { type: String, default: "" }, category: String,
}, { timestamps: true }));

const Resource = mongoose.models.Resource || mongoose.model("Resource", new mongoose.Schema({
  title: String, link: String, description: { type: String, default: "" }, category: String,
}, { timestamps: true }));

const FeatureRelease = mongoose.models.FeatureRelease || mongoose.model("FeatureRelease", new mongoose.Schema({
  featureName: String, description: { type: String, default: "" },
  releaseMonth: String, useCase: { type: String, default: "" }, demoLink: { type: String, default: "" },
}, { timestamps: true }));

// ── Seed Data ─────────────────────────────────────────────────
const DOCS = [
  { title: "DoubleTick India Rate Card — Sept 2024", category: "Pricing",    description: "Official pricing for DoubleTick Starter, Pro & Enterprise plans, additional users, WABAs, conversation costs (Marketing/Utility/Service/Auth), consultation, one-time add-ons, integrations, and QuickSell plans. Effective 11th September 2024.", fileUrl: "" },
  { title: "Business Verification Requirements",     category: "Onboarding", description: "Documents required to onboard a business on WhatsApp Business API: 2 of MSME/GST/Bank Statement/Incorporation Certificate. Also covers website compliance requirements — SSL, About Us, Contact, T&C, Privacy Policy, Copyright format.", fileUrl: "" },
  { title: "Proforma Invoice Request Template",      category: "Sales",      description: "Standard fields required to generate a Proforma Invoice: Company name, phone, email, contact person, GST number, address, payment mode, plan, duration, and website.", fileUrl: "" },
  { title: "DoubleTick Official Documentation",      category: "Technical",  description: "Getting started guide, API references, feature walkthroughs, and platform setup instructions. Full docs available at docs.doubletick.io.", fileUrl: "https://docs.doubletick.io" },
  { title: "Website Compliance Checklist",           category: "Onboarding", description: "SSL certificate, About Us page, Contact Us with legal name & address, Terms & Conditions, Privacy Policy, and correct Copyright format. Reference samples: quicksell.co/terms.html and quicksell.co/privacy.html.", fileUrl: "" },
];

const PLANS = [
  {
    name: "Starter", price: "₹5,700/mo",
    features: ["1 WABA number (free onboarding)", "Users: ₹500/user/mo (1–20 users)", "Bulk Broadcasting", "Basic Chatbot Automation", "Core WhatsApp Business API features"],
    limits: "No additional WABAs · Up to 20 users",
    icp: "Small businesses and early-stage teams getting started with WhatsApp Business API.",
  },
  {
    name: "Pro", price: "₹8,300/mo",
    features: ["1 WABA number (free onboarding)", "Users 1–20: ₹600/user/mo", "Users 21–50: ₹500/user/mo", "Users 51–75: ₹400/user/mo", "Additional WABAs supported", "Advanced Chatbot Automation", "Third-party CRM Integrations"],
    limits: "Up to 75 users · Multiple WABAs",
    icp: "Growing SMBs that need multi-agent support, automation, and integrations like Zoho, HubSpot, IndiaMart.",
  },
  {
    name: "Enterprise", price: "₹10,000+/mo",
    features: ["1 WABA number (free onboarding)", "Users 1–20: ₹800/user/mo", "Users 21–50: ₹750/user/mo", "Users 51–75: ₹700/user/mo", "76+ users: Custom pricing", "Unlimited WABAs (custom pricing)", "Dedicated Account Manager", "Full API access & custom integrations", "Priority SLA support"],
    limits: "76+ users · Unlimited WABAs",
    icp: "Large enterprises, jewellers, and high-volume businesses needing custom workflows and dedicated support.",
  },
  {
    name: "QuickSell Premium", price: "₹8,300/quarter",
    features: ["2,000 Products · 50 Catalogues", "Custom Fields Based Catalog Curation", "Mobile & Desktop access", "Domain Integration", "Payment Gateway Integration", "Custom Storefront Setup", "Product Video Support · Product Variants"],
    limits: "2k products · 50 catalogues",
    icp: "B2C businesses wanting to drive WhatsApp commerce with a branded product catalogue.",
  },
  {
    name: "QuickSell Platinum", price: "₹11,700/quarter",
    features: ["Everything in QuickSell Premium", "10,000 Products · 250 Catalogues", "Privacy Protection · Timer Based Catalogs", "Custom Product Variants · MOQ & MOA", "Slab-based Pricing", "Reseller Channel (add-on per reseller)"],
    limits: "10k products · 250 catalogues",
    icp: "B2B businesses and distributors needing bulk ordering, MOQ, slab pricing, and reseller channels.",
  },
  {
    name: "QuickSell Jewellery", price: "₹39,000/quarter",
    features: ["Everything in QuickSell Platinum", "Metal Rate Based Pricing", "Gram Based Selling", "Jewellery-specific catalogue features", "Yearly: ₹1,40,000 (10% off)"],
    limits: "Unlimited products (jewellery vertical)",
    icp: "Jewellery brands and retailers needing live metal-rate pricing and gram-based selling on WhatsApp.",
  },
];

const ADDONS = [
  { name: "VIP Support — WhatsApp Group",   description: "Dedicated WhatsApp support group for priority issue resolution and direct access to the DoubleTick team.", price: "₹8,000/mo",        compatiblePlans: "Pro, Enterprise" },
  { name: "End-to-End Implementation",      description: "Full onboarding, handholding, and setup with a dedicated account manager — from WABA activation to go-live.", price: "₹35,000/mo",  compatiblePlans: "Enterprise" },
  { name: "GreenTick (Meta Verified Badge)",description: "One-time fee to apply and obtain the Meta Green Tick verification for your WhatsApp Business Account.", price: "₹80,000 one-time", compatiblePlans: "Pro, Enterprise" },
  { name: "Bot Building (Up to 15 components)", description: "Custom chatbot built by DoubleTick team — up to 15 bot components covering your key conversation flows.", price: "₹25,000 one-time", compatiblePlans: "Starter, Pro, Enterprise" },
  { name: "Bot Building (16–30 components)",description: "Extended chatbot build for more complex automation — 16 to 30 bot components.", price: "₹45,000 one-time",     compatiblePlans: "Pro, Enterprise" },
  { name: "Bot Building (30+ components)", description: "Large-scale chatbot builds billed per component for highly complex automation workflows.", price: "₹1,500/component",  compatiblePlans: "Enterprise" },
  { name: "Zoho Integration",              description: "Bidirectional sync between DoubleTick and Zoho CRM.", price: "₹18,000/year",                                         compatiblePlans: "Pro, Enterprise" },
  { name: "HubSpot Integration",           description: "Sync leads and conversations between DoubleTick and HubSpot.", price: "₹18,000/year",                               compatiblePlans: "Pro, Enterprise" },
  { name: "IndiaMart Integration",         description: "Auto-import IndiaMart leads into DoubleTick for instant WhatsApp follow-up.", price: "₹18,000/year",                compatiblePlans: "Pro, Enterprise" },
  { name: "LeadSquared Integration",       description: "Push and pull lead data between DoubleTick and LeadSquared CRM.", price: "₹18,000/year",                            compatiblePlans: "Pro, Enterprise" },
  { name: "Bitrix24 Integration",          description: "Connect DoubleTick with Bitrix24 for CRM automation.", price: "₹18,000/year",                                       compatiblePlans: "Pro, Enterprise" },
  { name: "3rd Party CRM Integration",     description: "Custom integration with any CRM that supports Open API.", price: "₹20,000/year",                                    compatiblePlans: "Enterprise" },
  { name: "Additional WABA (1–3 numbers)", description: "Add extra WhatsApp Business Account numbers to your plan.", price: "₹3,000/mo per WABA",                           compatiblePlans: "Pro, Enterprise" },
  { name: "Additional WABA (4–20 numbers)",description: "Volume pricing for teams managing multiple WABAs.", price: "₹2,500/mo per WABA",                                   compatiblePlans: "Enterprise" },
];

const VIDEOS = [
  { title: "DoubleTick Platform Demo",       videoUrl: "https://drive.google.com/file/d/1example",           category: "Demo",    description: "Full walkthrough of the DoubleTick platform — inbox, broadcasting, chatbot builder, and analytics." },
  { title: "DoubleTick YouTube Channel",     videoUrl: "https://www.youtube.com/@DoubleTick",                category: "Feature", description: "Official DoubleTick YouTube channel — product demos, feature launches, and how-to videos." },
  { title: "QuickSell YouTube Channel",      videoUrl: "https://www.youtube.com/@QuickSell",                 category: "Demo",    description: "Product catalogue demos, jewellery vertical walkthroughs, and QuickSell onboarding guides." },
];

const RESOURCES = [
  { title: "DoubleTick Documentation",      link: "https://docs.doubletick.io",                             category: "Documentation", description: "Official technical docs — API references, platform setup, and feature guides." },
  { title: "DoubleTick Learning Centre",    link: "https://learn.doubletick.io",                            category: "Training",      description: "Step-by-step courses and onboarding walkthroughs for new users and admins." },
  { title: "AI Chatbot Builder Guide",      link: "https://docs.doubletick.io/chatbot",                     category: "Training",      description: "Complete guide to building AI chatbots on DoubleTick — flows, components, and best practices." },
  { title: "DoubleTick Website",            link: "https://doubletick.io",                                  category: "Sales",         description: "Main marketing site — overview, pricing, case studies, and contact." },
  { title: "QuickSell Website",             link: "https://quicksell.co",                                   category: "Sales",         description: "Product catalogue commerce platform. B2B and jewellery vertical landing pages." },
  { title: "G2 Reviews — DoubleTick",       link: "https://www.g2.com/products/doubletick",                 category: "Sales",         description: "Customer reviews and ratings on G2. Use for social proof in enterprise deals." },
  { title: "App Store Listing",             link: "https://apps.apple.com/app/doubletick",                  category: "Sales",         description: "DoubleTick iOS app listing on the Apple App Store." },
  { title: "Play Store Listing",            link: "https://play.google.com/store/apps/details?id=com.doubletick", category: "Sales",  description: "DoubleTick Android app on Google Play Store." },
  { title: "Terms & Conditions Sample",     link: "https://quicksell.co/terms.html",                        category: "Documentation", description: "Reference T&C format required for website compliance during WABA onboarding." },
  { title: "Privacy Policy Sample",         link: "https://quicksell.co/privacy.html",                      category: "Documentation", description: "Reference Privacy Policy format required for WABA onboarding compliance." },
  { title: "WhatsApp Business API Training",link: "https://www.youtube.com/@DoubleTick",                    category: "Training",      description: "YouTube playlist covering WABA setup, verification, and best practices." },
  { title: "Support WhatsApp",              link: "https://wa.me/918356849474",                              category: "Sales",         description: "Direct WhatsApp link to DoubleTick support team. Number: +91 83568 49474." },
];

const FEATURES = [
  { featureName: "Meta Emerging Tech Partner 2025", releaseMonth: "Jan 2025", description: "DoubleTick is officially recognised as a Meta Emerging Technology Partner for 2025 — validating platform reliability and compliance.", useCase: "Use in enterprise deals and compliance-sensitive verticals as trust signal.", demoLink: "" },
  { featureName: "EU GDPR & ISO 27001 Compliance",  releaseMonth: "Q1 2025",  description: "DoubleTick is fully GDPR compliant and ISO 27001 certified for information security management.", useCase: "Critical for BFSI, healthcare, and EU-facing enterprise deals.", demoLink: "" },
  { featureName: "AI Chatbot Builder",               releaseMonth: "Q3 2024",  description: "No-code chatbot builder with multi-step flows, conditional logic, and AI fallback. Supports product discovery, lead qualification, and support automation.", useCase: "Demo for any business wanting to automate customer conversations 24/7.", demoLink: "https://wa.me/919321721251" },
  { featureName: "Bulk Broadcasting",                releaseMonth: "Q1 2024",  description: "Send personalised WhatsApp messages to segmented lists at scale. Supports media, buttons, and template messages with delivery analytics.", useCase: "Campaigns, promotions, re-engagement. Works across all plans.", demoLink: "" },
  { featureName: "Multi-Agent Team Inbox",           releaseMonth: "Q2 2024",  description: "Shared team inbox where multiple agents manage WhatsApp conversations with assignment, labelling, and SLA tracking.", useCase: "Support teams, sales teams, key account management.", demoLink: "" },
  { featureName: "QuickSell Catalogue Commerce",     releaseMonth: "Q2 2024",  description: "Full product catalogue on WhatsApp — MOQ, slab pricing, payment gateway, privacy protection, and reseller channels built in.", useCase: "B2B distributors, jewellery brands, D2C product businesses.", demoLink: "https://wa.me/919169169500" },
  { featureName: "Live Chatbot Demo Numbers",        releaseMonth: "Ongoing",  description: "6 live demo numbers across verticals: Education (Mangalayatan Univ), Travel (Travel Live IND), Jewellery (Kenvi Jewels), Real Estate (Godrej Properties), Generic (DT Training), EdTech (Shiksha.com).", useCase: "Show prospects a working chatbot in their own vertical before purchase.", demoLink: "https://wa.me/919321721251" },
];

// ── Runner ────────────────────────────────────────────────────
async function seed() {
  console.log("🔌  Connecting to MongoDB Atlas…");
  await mongoose.connect(uri, { bufferCommands: false });
  console.log("✅  Connected\n");

  // Clear all collections
  await Promise.all([
    Documentation.deleteMany({}),
    PricingPlan.deleteMany({}),
    Addon.deleteMany({}),
    Video.deleteMany({}),
    Resource.deleteMany({}),
    FeatureRelease.deleteMany({}),
  ]);
  console.log("🗑   Cleared all collections");

  // Insert fresh data
  const [docs, plans, addons, videos, resources, features] = await Promise.all([
    Documentation.insertMany(DOCS),
    PricingPlan.insertMany(PLANS),
    Addon.insertMany(ADDONS),
    Video.insertMany(VIDEOS),
    Resource.insertMany(RESOURCES),
    FeatureRelease.insertMany(FEATURES),
  ]);

  console.log(`\n📄  Docs:      ${docs.length}`);
  console.log(`💰  Plans:     ${plans.length}`);
  console.log(`🔌  Add-ons:   ${addons.length}`);
  console.log(`🎬  Videos:    ${videos.length}`);
  console.log(`📚  Resources: ${resources.length}`);
  console.log(`⚡  Features:  ${features.length}`);
  console.log("\n✅  Seed complete — all collections populated\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error("❌  Seed failed:", err.message);
  process.exit(1);
});