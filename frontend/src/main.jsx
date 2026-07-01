import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import './index.css'

const resolveApiBaseUrl = () => {
  const { protocol, hostname } = window.location

  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
    return `${protocol}//localhost:8000`
  }

  return `${protocol}//${hostname}:8000`
}

axios.interceptors.request.use((config) => {
  if (config.url?.startsWith('http://localhost:8000')) {
    config.url = config.url.replace('http://localhost:8000', resolveApiBaseUrl())
  }

  return config
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
