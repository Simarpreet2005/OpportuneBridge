import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from './ui/sonner.jsx'
import { Provider } from 'react-redux'
import { QueryClientProvider } from '@tanstack/react-query'
import store from './store/store.js'
import queryClient from './services/queryClient.js'
import { persistStore } from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'

const persistor = persistStore(store);

const applyInitialTheme = () => {
  try {
    const stored = localStorage.getItem("theme"); // "light" | "dark" | null
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    const useDark = stored ? stored === "dark" : !!prefersDark;
    document.documentElement.classList.toggle("dark", useDark);
  } catch {
    // ignore
  }
};

applyInitialTheme();

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
        <Toaster />
      </PersistGate>
    </Provider>
  </QueryClientProvider>
)
