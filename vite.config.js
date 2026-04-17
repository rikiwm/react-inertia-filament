import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import laravel from "laravel-vite-plugin";
import { defineConfig } from "vite";

export default defineConfig(({ isSsrBuild }) => ({
    plugins: [
        laravel({
            input: ["resources/css/app.css", "resources/js/App.tsx"],
            ssr: "resources/js/ssr.tsx",
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    esbuild: {
        jsx: "automatic",
    },
    build: {
        chunkSizeWarningLimit: 600,
        rollupOptions: {
            output: {
                manualChunks: isSsrBuild ? undefined : {
                    // Core React runtime — cached independently of app code
                    "vendor-react": ["react", "react-dom"],
                    // Inertia adapter — changes rarely
                    "vendor-inertia": ["@inertiajs/react"],
                    // Animation library — largest single dependency
                    "vendor-motion": ["motion"],
                    // Icon packs — large but static
                    "vendor-icons": ["@icons-pack/react-simple-icons", "lucide-react"],
                    // Chart library — large, changes rarely
                    "vendor-charts": ["recharts"],
                },
            },
        },
    },
}));


