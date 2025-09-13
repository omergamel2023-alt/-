import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify("AIzaSyBqaswnE2ISDonSOw4U79afumqnIn28Iz4"),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
