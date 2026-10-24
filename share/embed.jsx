// Embed build (scripts/build-embed.mjs, decision #142): the 3D sonar lake as a module the store page mounts into its own
// <div id="accuphy-lab"> — no iframe (docs/embed-options.md, Option 3). The stable loader embed/lab.js imports this
// build and calls mount(); the page's data-* attributes stay on the element for later use (market, shop URL).
import ReactDOM from 'react-dom/client'
import SonarLake3D from '../src/experiments/2026-09-23-sonar-lake-3d'
import '../src/index.css'

export function mount(el) {
  const root = ReactDOM.createRoot(el)
  root.render(<SonarLake3D />)
  return { unmount: () => root.unmount() }
}
