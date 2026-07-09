import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ConfirmProvider } from './hooks/useConfirm.jsx'
import { AlertProvider } from './hooks/useAlert.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AlertProvider>
        <ConfirmProvider>
          <App />
        </ConfirmProvider>
      </AlertProvider>
    </BrowserRouter>
  </StrictMode>,
)
