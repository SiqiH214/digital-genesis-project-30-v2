import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Debug logging
console.log('🚀 Main.tsx loaded');
console.log('📍 Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('🔑 Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('❌ Root element not found!');
} else {
  console.log('✅ Root element found, rendering app...');
  createRoot(rootElement).render(<App />);
}
