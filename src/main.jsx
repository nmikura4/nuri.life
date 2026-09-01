import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ConfirmProvider } from './hooks/useConfirm.jsx'
import { AlertProvider } from './hooks/useAlert.jsx'
import ErrorBoundary from './components/UI/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AlertProvider>
          <ConfirmProvider>
            <App />
          </ConfirmProvider>
        </AlertProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
