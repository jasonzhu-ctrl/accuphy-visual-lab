// Auto-discovers every experiment: src/experiments/<yyyy-mm-dd>-<slug>/index.jsx
// Each index.jsx must `export default` a React component and may
// `export const meta = { title, description }`.
const modules = import.meta.glob('./experiments/*/index.jsx', { eager: true })

export const experiments = Object.entries(modules)
  .map(([path, mod]) => {
    const slug = path.split('/')[2]
    return {
      slug,
      Component: mod.default,
      title: mod.meta?.title ?? slug,
      description: mod.meta?.description ?? '',
    }
  })
  .sort((a, b) => b.slug.localeCompare(a.slug)) // newest first
