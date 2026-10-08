/**
 * The featured band on the home page: Alex Xu's System Design Interview series.
 * Every id must exist in the catalog (checked by the data tests).
 */
export const SPOTLIGHT = {
  eyebrow: "Featured series",
  title: "System Design Interview, by Alex Xu",
  body: "The books that turned system design interviews into a learnable skill — and the ByteByteGo platform, newsletter, and videos built around them. Start with Volume 1, then follow the learning path.",
  platform: "bytebytego",
  path: "system-design-interview",
  books: [
    { id: "sdi-vol-1", kicker: "System Design Interview", title: "Volume 1", tone: "indigo" },
    { id: "sdi-vol-2", kicker: "System Design Interview", title: "Volume 2", tone: "violet" },
    { id: "coding-interview-patterns", kicker: "Coding Interview", title: "Patterns", tone: "teal" },
    { id: "object-oriented-design-interview", kicker: "Object-Oriented", title: "Design Interview", tone: "amber" },
    { id: "ml-system-design-interview", kicker: "Machine Learning", title: "System Design", tone: "rose" },
    { id: "genai-system-design-interview", kicker: "Generative AI", title: "System Design", tone: "fuchsia" },
    { id: "mobile-system-design-interview", kicker: "Mobile", title: "System Design", tone: "sky" },
  ],
  free: ["system-design-101", "bytebytego-newsletter", "bytebytego-youtube"],
};
