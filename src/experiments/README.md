# src/experiments/

One folder per experiment:

```
src/experiments/<yyyy-mm-dd>-<slug>/index.jsx
```

- `<yyyy-mm-dd>` — the date the experiment was started.
- `<slug>` — short lowercase words joined by hyphens, e.g. `hero-dark`,
  `product-grid-v2`.
- `index.jsx` must `export default` a React component (the full page), and
  may `export const meta = { title, description }` for the gallery card.
- Put any extra components, images or CSS for that experiment inside the same
  folder.
- Experiments are auto-discovered — no registration needed. They appear on the
  gallery page (newest first) and open at `#<folder-name>`.
- Never modify an older experiment to try a new idea — copy it into a new
  dated folder so both can be compared side by side.
