import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                adminLogin: resolve(__dirname, 'admin-login.html'),
                admin: resolve(__dirname, 'admin.html'),
                adminFruits: resolve(__dirname, 'admin-fruits.html'),
                adminVegetables: resolve(__dirname, 'admin-vegetables.html'),
                orderTracking: resolve(__dirname, 'order-tracking.html')
            }
        }
    }
});