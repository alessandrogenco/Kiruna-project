import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carica le variabili di ambiente dal file .env
  const env = loadEnv(mode, process.cwd(), 'REACT_APP_');

  return {
    define: {
      // Definisci le variabili di ambiente per l'uso nel codice
      'process.env.REACT_APP_MAPBOX_TOKEN': JSON.stringify("pk.eyJ1IjoiYWxlc3NhbmRyb2cwOCIsImEiOiJjbTNiZzFwbWEwdnU0MmxzYTdwNWhoY3dpIn0._52AcWROcPOQBr1Yz0toKw"),
      'process.env.REACT_APP_MAPBOX_TOKEN1': JSON.stringify("pk.eyJ1IjoiYWxlc3NhbmRyb2cwOCIsImEiOiJjbTNiZzFwbWEwdnU0MmxzYTdwNWhoY3dpIn0._52AcWROcPOQBr1Yz0toKw"),
    },
    plugins: [react()],
  }
});