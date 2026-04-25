import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";

export const appName = import.meta.env.VITE_APP_NAME || "PDG Kit";

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: async (name) => {
        const pages = import.meta.glob("./Pages/**/*.tsx");
        try {
            return await resolvePageComponent(`./Pages/${name}.tsx`, pages);
        } catch (e) {
            console.error(`Inertia: Error resolving page component "${name}"`, e);
            // Fallback to Error page if component not found
            return await resolvePageComponent(`./Pages/Error.tsx`, pages);
        }
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        delay: 60,
        color: 'rgba(0, 183, 165, 1)',
        includeCSS: true,
        showSpinner: false, // <--- Sembunyikan spinner
    },

}).then();
