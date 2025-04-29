import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { WalletProvider } from './contexts/WalletContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <WalletProvider>
    <App />
  </WalletProvider>
)
