import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'
import { Provider } from 'react-redux'
import store from './redux/store'
import axios from 'axios'

import { GoogleOAuthProvider } from '@react-oauth/google'

// Establish remote API resolution layer for dynamic cloud production builds
const remoteTarget = import.meta.env.VITE_API_URL;
if (remoteTarget) {
  axios.defaults.baseURL = remoteTarget.replace(/\/$/, '');
}

// You should set your Google Client ID here or via environment variable
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "168944849678-rfra0pepa5uvqltcu123le556jh6kfmo.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </Provider>
  </React.StrictMode>,
)
