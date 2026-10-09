import { RESOURCE_BY_ID } from "../data/resources/index.js";
import { SPOTLIGHT } from "../data/spotlight.js";
import { TYPE_BY_ID } from "../data/taxonomy.js";
import AppLink from "./AppLink.jsx";
import Icon from "./Icon.jsx";

const platform = RESOURCE_BY_ID.get(SPOTLIGHT.platform);
const books = SPOTLIGHT.books.map((book) => ({ ...book, resource: RESOURCE_BY_ID.get(book.id) }));
const freeResources = SPOTLIGHT.free.map((id) => RESOURCE_BY_ID.get(id));

function Book({ book }) {
  const { resource } = book;
  const readOnline = resource.links?.find((link) => link.label === "Read online");
  return (
    <li className={`book book--${book.tone}`}>
      <a className="book__cover" href={resource.url} target="_blank" rel="noopener noreferrer">
        <span className="book__kicker">{book.kicker}</span>
        <span className="book__title">{book.title}</span>
        <span className="book__author">{resource.author}</span>
        <span className="sr-only">: {resource.name} on Amazon (opens in a new tab)</span>
      </a>
      <div className="book__links">
        <a href={resource.url} target="_blank" rel="noopener noreferrer" aria-label={`Buy ${resource.name} on Amazon`}>
          Amazon
        </a>
        {readOnline && (
          <a href={readOnline.url} target="_blank" rel="noopener noreferrer" aria-label={`Read ${resource.name} online at ByteByteGo`}>
            Read online
          </a>
        )}
      </div>
    </li>
  );
}

export default function Spotlight() {
  return (
    <section className="spotlight" aria-labelledby="spotlight-title">
      <div className="container">
        <div className="spotlight__panel">
          <div className="spotlight__intro">
            <p className="eyebrow eyebrow--inverse">
              <Icon name="star" filled size={13} /> {SPOTLIGHT.eyebrow}
            </p>
            <h2 id="spotlight-title" className="spotlight__title">
              {SPOTLIGHT.title}
            </h2>
            <p className="spotlight__body">{SPOTLIGHT.body}</p>
            <div className="spotlight__actions">
              <AppLink className="btn btn--primary" to={{ view: "paths", path: SPOTLIGHT.path }}>
                Follow the learning path
              </AppLink>
              <a className="btn btn--text-link" href={platform.url} target="_blank" rel="noopener noreferrer">
                Visit ByteByteGo <Icon name="chevron-right" size={16} />
              </a>
            </div>
          </div>

          <ul className="shelf" aria-label="Books in the series">
            {books.map((book) => (
              <Book key={book.id} book={book} />
            ))}
          </ul>

          <div className="spotlight__free">
            <span className="spotlight__free-label">Free from ByteByteGo</span>
            <ul>
              {freeResources.map((resource) => (
                <li key={resource.id}>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="free-pill">
                    <Icon name={resource.type} size={15} />
                    {resource.name}
                    <span className="free-pill__type">{TYPE_BY_ID.get(resource.type).label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
