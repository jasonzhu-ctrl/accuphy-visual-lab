// Share build of the website-embed version (#233; scripts/build-share.mjs with LAB_ENTRY=web): this folder's lake, a copy of the base
// taken from live 96fdc22, served at lab.accuphy.ca /, /mini/, /ice/ and framed by every store /pages/lab. The base share page
// (share/main.jsx at the repo root) is untouched.
import ReactDOM from 'react-dom/client'
import SonarLakeWeb from '..'
import '../../../index.css'

ReactDOM.createRoot(document.getElementById('root')).render(<SonarLakeWeb lab={import.meta.env.VITE_LAB || undefined} />)
