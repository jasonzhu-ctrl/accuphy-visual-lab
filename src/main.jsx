import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// No StrictMode: its dev-only double mount/unmount duplicates three.js render
// targets and frame loops (SonarScreen) and trips an R3F unmount bug.
ReactDOM.createRoot(document.getElementById('root')).render(<App />)
