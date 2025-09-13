import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.AIzaSyBqaswnE2ISDonSOw4U79afumqnIn28Iz4),
        'process.env.AIzaSyBqaswnE2ISDonSOw4U79afumqnIn28Iz4': JSON.stringify(env.AIzaSyBqaswnE2ISDonSOw4U79afumqnIn28Iz4)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
