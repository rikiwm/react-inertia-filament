import { createInertiaApp } from "@inertiajs/react";
import createServer from "@inertiajs/react/server";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import ReactDOMServer from "react-dom/server";
import { type RouteName, route } from "ziggy-js";

export const appName = import.meta.env.VITE_APP_NAME || "PDG Kit";

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: (title) => (title ? `${title} - ${appName}` : appName),
        resolve: (name) => resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob("./Pages/**/*.tsx")),
        setup: ({ App, props }) => {
            const ziggy = props.initialPage.props.ziggy;

            // Set global Ziggy for imported route() calls to work
            // @ts-expect-error
            global.Ziggy = ziggy;

            // eslint-disable
            // @ts-expect-error - Define global route helper
            global.route = (name: RouteName, params?: any, absolute?: boolean) =>
                route(name, params, absolute, {
                    ...ziggy as any,
                    location: new URL(ziggy.location),
                });
            // eslint-enable

            return <App {...props} />;
        },
    }),
);
