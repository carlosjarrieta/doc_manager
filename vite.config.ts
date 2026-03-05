import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    define: {
      'process.env': env,
      // Provide fallback for the VITE_ prefixed ones used in the code
      'import.meta.env.VITE_KV_REST_API_URL': JSON.stringify(env.VITE_KV_REST_API_URL || env.KV_REST_API_URL),
      'import.meta.env.VITE_KV_REST_API_TOKEN': JSON.stringify(env.VITE_KV_REST_API_TOKEN || env.KV_REST_API_TOKEN),
      'import.meta.env.VITE_DO_ACCESS_KEY': JSON.stringify(env.VITE_DO_ACCESS_KEY || env.DO_ACCESS_KEY),
      'import.meta.env.VITE_DO_SECRET': JSON.stringify(env.VITE_DO_SECRET || env.DO_SECRET),
      'import.meta.env.VITE_DO_ENDPOINT': JSON.stringify(env.VITE_DO_ENDPOINT || env.DO_ENDPOINT),
      'import.meta.env.VITE_DO_REGION': JSON.stringify(env.VITE_DO_REGION || env.DO_REGION),
      'import.meta.env.VITE_DO_BUCKET': JSON.stringify(env.VITE_DO_BUCKET || env.DO_BUCKET),
      'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(env.VITE_OPENAI_API_KEY || env.OPENAI_API_KEY),
    },
  };
})
