/**
 * The directory's vocabulary. Every resource has exactly one category and one
 * type, plus one or more topics. Order here is display order.
 */

export const CATEGORY_GROUPS = [
  { id: "learn", label: "Learn & grow" },
  { id: "companies", label: "Company engineering blogs" },
];

export const CATEGORIES = [
  {
    id: "system-design",
    group: "learn",
    label: "System Design",
    description:
      "Alex Xu's System Design Interview series, ByteByteGo, and the best guides to designing large-scale systems.",
  },
  {
    id: "lld",
    group: "learn",
    label: "Low-Level Design",
    description:
      "Object-oriented design, SOLID, design patterns, UML, and machine-coding rounds — the code-level half of system design.",
  },
  {
    id: "interviews",
    group: "learn",
    label: "Interview Prep",
    description: "Coding patterns, study plans, behavioral prep, and mock interviews — plus how to negotiate the offer.",
  },
  {
    id: "fundamentals",
    group: "learn",
    label: "CS Fundamentals",
    description:
      "Free courses and books on operating systems, networks, databases, algorithms, and distributed systems.",
  },
  {
    id: "papers",
    group: "learn",
    label: "Papers & Essays",
    description:
      "The classic papers and essays behind modern infrastructure. Decades old, still the best explanations.",
  },
  {
    id: "engineers",
    group: "learn",
    label: "Engineers & Writers",
    description: "Independent engineers whose writing consistently teaches something new.",
  },
  {
    id: "career",
    group: "learn",
    label: "Craft & Career",
    description:
      "Become a better engineer and teammate: code review, writing, staff+ growth, focus, habits, and negotiation.",
  },
  {
    id: "ai",
    group: "learn",
    label: "AI & ML",
    description: "Frontier labs, courses, and books for building with machine learning and LLMs.",
  },
  {
    id: "security",
    group: "learn",
    label: "Security",
    description: "Vulnerability research, secure-coding references, and hands-on hacking labs.",
  },
  {
    id: "languages",
    group: "learn",
    label: "Languages & Web",
    description: "Official language blogs, web platform docs, and the best ecosystem tutorials.",
  },
  {
    id: "media",
    group: "learn",
    label: "News, Podcasts & Talks",
    description: "Communities, podcasts, and conference talks for learning between projects.",
  },
  {
    id: "big-tech",
    group: "companies",
    label: "Big Tech",
    description:
      "Engineering and research from Google, Meta, Amazon, Microsoft, Apple, Netflix, LinkedIn, and NVIDIA.",
  },
  {
    id: "consumer",
    group: "companies",
    label: "Consumer & Social",
    description: "Chat, social, music, media, and games — real-time systems for hundreds of millions of people.",
  },
  {
    id: "marketplaces",
    group: "companies",
    label: "Marketplaces & Commerce",
    description: "Ride-hailing, delivery, travel, and e-commerce: logistics, search, and pricing at scale.",
  },
  {
    id: "saas",
    group: "companies",
    label: "SaaS & Productivity",
    description: "Collaboration and productivity tools: multiplayer editing, sync engines, and sharded Postgres.",
  },
  {
    id: "fintech",
    group: "companies",
    label: "FinTech & Trading",
    description: "Payments, banking, and trading — where correctness, idempotency, and latency really matter.",
  },
  {
    id: "infra",
    group: "companies",
    label: "Cloud & DevTools",
    description: "Networking, edge, observability, and developer platforms from the teams that run the internet.",
  },
  {
    id: "data",
    group: "companies",
    label: "Data & Databases",
    description: "Database and streaming companies explaining storage engines, query execution, and replication.",
  },
];

export const TYPES = [
  { id: "blog", label: "Blog" },
  { id: "newsletter", label: "Newsletter" },
  { id: "book", label: "Book" },
  { id: "course", label: "Course" },
  { id: "guide", label: "Guide" },
  { id: "repo", label: "GitHub repo" },
  { id: "paper", label: "Paper" },
  { id: "article", label: "Essay" },
  { id: "video", label: "Video" },
  { id: "podcast", label: "Podcast" },
  { id: "practice", label: "Practice" },
  { id: "community", label: "Community" },
];

export const TOPICS = [
  { id: "system-design", label: "System Design" },
  { id: "distributed-systems", label: "Distributed Systems" },
  { id: "architecture", label: "Architecture" },
  { id: "backend", label: "Backend" },
  { id: "databases", label: "Databases" },
  { id: "data-engineering", label: "Data Engineering" },
  { id: "infrastructure", label: "Infrastructure & Cloud" },
  { id: "reliability", label: "Reliability & SRE" },
  { id: "performance", label: "Performance" },
  { id: "networking", label: "Networking" },
  { id: "security", label: "Security" },
  { id: "ai-ml", label: "AI & ML" },
  { id: "llms", label: "LLMs & Agents" },
  { id: "frontend", label: "Frontend & Web" },
  { id: "mobile", label: "Mobile" },
  { id: "algorithms", label: "Algorithms" },
  { id: "systems-programming", label: "Systems Programming" },
  { id: "languages", label: "Programming Languages" },
  { id: "testing", label: "Testing & Correctness" },
  { id: "tooling", label: "Tools & Workflow" },
  { id: "interviews", label: "Interviews" },
  { id: "career", label: "Career" },
  { id: "leadership", label: "Leadership & Culture" },
  { id: "growth", label: "Habits & Growth" },
  { id: "news", label: "News & Trends" },
];

/** Price tags shown on books, courses, and practice platforms. */
export const COSTS = {
  free: "Free",
  freemium: "Free tier",
  paid: "Paid",
};

export const CATEGORY_BY_ID = new Map(CATEGORIES.map((c) => [c.id, c]));
export const TYPE_BY_ID = new Map(TYPES.map((t) => [t.id, t]));
export const TOPIC_BY_ID = new Map(TOPICS.map((t) => [t.id, t]));
