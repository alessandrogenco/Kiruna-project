import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carica le variabili di ambiente dal file .env
  const env = loadEnv(mode, process.cwd(), 'REACT_APP_');

  return {
    define: {
      // Definisci le variabili di ambiente per l'uso nel codice
      'process.env.REACT_APP_MAPBOX_TOKEN': JSON.stringify(env.REACT_APP_MAPBOX_TOKEN),
      'process.env.REACT_APP_MAPBOX_TOKEN1': JSON.stringify(env.REACT_APP_MAPBOX_TOKEN1),
    },
    plugins: [react()],
  }
});