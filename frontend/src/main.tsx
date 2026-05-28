import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerLicense } from '@syncfusion/ej2-base'

// Register Syncfusion license
const syncfusionLicense = import.meta.env.VITE_SYNCFUSION_LICENSE
if (syncfusionLicense) {
  registerLicense(syncfusionLicense)
}


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
