// Share build of the tour prototype (scripts/build-share.mjs with VITE_LAB=tour): the lake page with the tour over it,
// as one self-contained page for the test link. The normal share page (share/main.jsx) is untouched.
import ReactDOM from 'react-dom/client'
import TourProtoPage from '../index'
import '../../../index.css'

ReactDOM.createRoot(document.getElementById('root')).render(<TourProtoPage />)
