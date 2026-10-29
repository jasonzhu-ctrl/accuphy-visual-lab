import ReactDOM from 'react-dom/client'
import BlueHourLake from '../src/experiments/2026-10-29-blue-hour-lake'
import '../src/index.css'

export function mount(el) {
  const root=ReactDOM.createRoot(el)
  const config={title:el.dataset.title,subtitle:el.dataset.subtitle,cta:el.dataset.cta,productUrl:el.dataset.productUrl,poster:el.dataset.poster}
  root.render(<BlueHourLake config={config}/>);
  return {unmount:()=>root.unmount()}
}
