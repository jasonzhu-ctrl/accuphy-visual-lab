// Embed build of the website-embed version (#233; scripts/build-embed.mjs, which picks this entry while this folder exists): this
// folder's lake as the module lab.accuphy.ca/embed/lab.js mounts (#142). The base entry (share/embed.jsx at the repo root) is untouched.
import ReactDOM from 'react-dom/client'
import SonarLakeWeb from '..'
import { setEmbedOptions } from '../embed'
import '../../../index.css'

export function mount(el) {
  setEmbedOptions({ shop: el.dataset.shop, market: el.dataset.market, lang: el.dataset.lang }) // the store page's data-shop / data-market / data-lang (website #228)
  const root = ReactDOM.createRoot(el)
  root.render(<SonarLakeWeb />)
  return { unmount: () => root.unmount() }
}
