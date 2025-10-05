
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react-swc';
  import path from 'path';
  import tailwindcss from '@tailwindcss/vite'



  export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    },
    // build: {
    //   target: 'esnext',
    //   outDir: 'build',
    // }
  });