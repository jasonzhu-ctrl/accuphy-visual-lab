// Share build of the Black Friday locked version (#213; scripts/build-share.mjs with VITE_LAB=bf): this folder's lake, lock always on,
// as one self-contained page. The base share page (share/main.jsx at the repo root) is untouched.
import ReactDOM from 'react-dom/client'
import SonarLakeBF from '..'
import '../../../index.css'

ReactDOM.createRoot(document.getElementById('root')).render(<SonarLakeBF />)
