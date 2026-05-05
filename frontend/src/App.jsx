import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./router/AppRouter";
import "./styles/globals.css";

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
