import { PATHS } from "../data/paths.js";
import { RESOURCES } from "../data/resources/index.js";
import { CATEGORIES } from "../data/taxonomy.js";
import AppLink from "./AppLink.jsx";
import Icon from "./Icon.jsx";

const companyCategories = new Set(CATEGORIES.filter((c) => c.group === "companies").map((c) => c.id));
const STATS = [
  { label: "Hand-picked resources", value: RESOURCES.length },
  { label: "Company engineering blogs", value: RESOURCES.filter((r) => companyCategories.has(r.category)).length },
  { label: "Free books & courses", value: RESOURCES.filter((r) => r.cost === "free").length },
  { label: "Step-by-step learning paths", value: PATHS.length },
];

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__glow" aria-hidden="true" />
      <div className="container hero__inner">
        <p className="eyebrow">
          <span className="eyebrow__dot" aria-hidden="true" />
          Curated, ad-free, and verified link by link
        </p>
        <h1 id="hero-title" className="hero__title">
          Read what the best <span className="hero__accent">engineers</span> are writing.
        </h1>
        <p className="hero__lede">
          Engineering blogs from the teams behind Netflix, Stripe, and Discord, Alex Xu's System Design Interview series,
          classic papers, free courses, and learning paths that help you become a better engineer — all in one place.
        </p>
        <div className="hero__actions">
          <a className="btn btn--primary btn--lg" href="#directory">
            Browse the directory <Icon name="arrow-right" size={17} />
          </a>
          <AppLink className="btn btn--secondary btn--lg" to={{ view: "paths" }}>
            <Icon name="route" size={17} /> Start a learning path
          </AppLink>
        </div>
        <dl className="stats">
          {STATS.map((stat) => (
            <div className="stat" key={stat.label}>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
