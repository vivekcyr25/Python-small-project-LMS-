import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@syncfusion/ej2-tailwind3-theme/styles/tailwind3-lite.css'
import './styles/syncfusion-ios.css'
import './index.css'
import App from './App.tsx'
import { registerLicense } from '@syncfusion/ej2-base'
import { enableRipple } from '@syncfusion/ej2-base'

enableRipple(true)

const syncfusionLicense = import.meta.env.VITE_SYNCFUSION_LICENSE
if (syncfusionLicense) {
  registerLicense(syncfusionLicense)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
