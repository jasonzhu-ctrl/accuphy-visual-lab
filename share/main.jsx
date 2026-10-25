// Share build (scripts/build-share.mjs): the 3D sonar lake alone, without the Lab gallery or its back link,
// for a single self-contained page friends can open (Jason 2026-09-26: 暂时把他变成在一个网页里可以使用的版本 … 给我的朋友测试).
import ReactDOM from 'react-dom/client'
import SonarLake3D from '../src/experiments/2026-09-23-sonar-lake-3d'
import '../src/index.css'

// VITE_LAB=fish: the fish-echo test page (#153), for a private preview
ReactDOM.createRoot(document.getElementById('root')).render(<SonarLake3D lab={import.meta.env.VITE_LAB || undefined} />)
