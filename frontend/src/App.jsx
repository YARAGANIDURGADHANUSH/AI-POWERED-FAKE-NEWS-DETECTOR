import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./router/AppRouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { Toaster } from "react-hot-toast";
import "./styles/globals.css";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        {/* Global Toast Configuration */}
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#0a1220', // Matches your dark theme glassmorphism
              color: '#e8f0ff',
              border: '1px solid rgba(255,255,255,0.1)',
              fontFamily: 'var(--font-body)',
              fontSize: '14px'
            },
            success: { iconTheme: { primary: '#00e5a0', secondary: '#0a1220' } },
            error: { iconTheme: { primary: '#ff3355', secondary: '#0a1220' } },
          }} 
        />
        <AppRouter />
      </AuthProvider>
    </ErrorBoundary>
  );
}
