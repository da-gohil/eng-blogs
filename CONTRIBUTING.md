# Contributing

Thanks for helping make this a better library for engineers. You can contribute in two ways:

- **Suggest something** by opening a [“Suggest a resource” issue](../../issues/new?template=suggest-resource.yml).
- **Add it yourself** by editing a data file and opening a pull request. The steps are below.

## What belongs here

The bar is: _would you send this to a friend who wants to become a better engineer?_

- **Substantive.** Deep, original writing about how systems are built and run. Not product marketing, listicles, or
  link farms.
- **Alive or timeless.** Active blogs, or archives that are still worth reading (for example, _The Morning Paper_).
- **Accessible.** Free to read, or a paid book or course that's genuinely worth it. Mark those with `cost: "paid"`.
- **Stable links.** Use the canonical URL (`https`, no tracking parameters). Medium publications should set `logo` to the
  company's domain.

Use `featured: true` sparingly. It marks the few must-reads in each category.

## Adding a resource

1. Pick the file in [`src/data/resources/`](src/data/resources) that matches the category, and add an entry. The README
   documents every field. Keep these rules in mind:
   - `id`: kebab-case and unique. Never rename an existing id, because saved lists reference it.
   - `description`: 40–200 characters, specific, and ending with a period. Say what the reader will _learn_
     ("Vitess sharding, job queues, and incident write-ups") rather than praise it ("an amazing blog").
   - `topics`: 1–4 ids from [`taxonomy.js`](src/data/taxonomy.js). The first two appear on the card.
   - `picks`: one to three great posts to start with. They are optional, but very helpful.
2. Fetch the logo if the domain is new: `npm run icons`.
3. Verify everything:

   ```bash
   npm test                               # entry format, unique ids/URLs, valid topics, path references
   npm run check:links -- --only=<category>
   npm run dev                            # see it on the page
   ```

4. Open a pull request. CI runs lint, tests, and a full build.

## Fixing a broken link

Find the URL with `npm run check:links -- --moved`, which also lists redirects to other domains. Then update it in the
data file. If a site is gone for good, delete the entry and any learning-path step that references it; `npm test` will
point out leftovers.

## Code changes

- `src/lib/` holds pure logic with unit tests in `tests/`. Add tests when you change behavior.
- Components must render identically on the server and the client, because the HTML is prerendered and then hydrated.
  Read browser-only state (URL, `localStorage`, `window`) through the existing hooks or inside effects, never during
  render.
- Run `npm run check` before pushing.
