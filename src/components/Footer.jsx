import { RESOURCES } from "../data/resources/index.js";
import { formatDate } from "../lib/format.js";
import { SITE, suggestUrl } from "../site.config.js";
import AppLink from "./AppLink.jsx";
import Icon from "./Icon.jsx";

export default function Footer() {
  const suggest = suggestUrl(SITE.repoUrl);
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <span className="brand">
            <span className="brand__mark">
              <Icon name="bolt" size={16} filled />
            </span>
            <span className="brand__name">{SITE.name}</span>
          </span>
          <p>
            A free, hand-curated library for engineers who want to keep getting better. No ads, no trackers, no sign-up.
          </p>
        </div>

        <nav className="footer__nav" aria-label="Footer">
          <div>
            <p className="footer__heading">Explore</p>
            <ul>
              <li>
                <AppLink to={{ view: "explore", category: "essentials" }} scroll="directory">
                  Essentials
                </AppLink>
              </li>
              <li>
                <AppLink to={{ view: "explore", category: "system-design" }} scroll="directory">
                  System design
                </AppLink>
              </li>
              <li>
                <AppLink to={{ view: "paths" }}>Learning paths</AppLink>
              </li>
              <li>
                <AppLink to={{ view: "saved" }}>Your saved list</AppLink>
              </li>
            </ul>
          </div>
          {SITE.repoUrl && (
            <div>
              <p className="footer__heading">Contribute</p>
              <ul>
                <li>
                  <a href={suggest} target="_blank" rel="noopener noreferrer">
                    Suggest a resource
                  </a>
                </li>
                <li>
                  <a href={`${SITE.repoUrl}/issues/new?labels=broken-link&title=Broken+link%3A+`} target="_blank" rel="noopener noreferrer">
                    Report a broken link
                  </a>
                </li>
                <li>
                  <a href={SITE.repoUrl} target="_blank" rel="noopener noreferrer">
                    Source on GitHub
                  </a>
                </li>
              </ul>
            </div>
          )}
        </nav>
      </div>
      <div className="container footer__legal">
        <p>
          Curated by {SITE.owner} · {RESOURCES.length} resources · Updated {formatDate(__BUILD_DATE__)}
        </p>
        <p>Logos and trademarks belong to their respective owners. Links go to the original publishers.</p>
      </div>
    </footer>
  );
}
