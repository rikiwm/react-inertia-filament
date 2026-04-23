import { Link } from "@inertiajs/react";
import { motion } from "motion/react";
import React from "react";

interface Props {
    status: number;
}

export default function Error({ status }: Props) {
    const title = {
        503: "503: Service Unavailable",
        500: "500: Server Error",
        404: "404: Page Not Found",
        403: "403: Forbidden",
    }[status] || "An Error Occurred";

    const description = {
        503: "Sorry, we are doing some maintenance. Please check back soon.",
        500: "Whoops, something went wrong on our servers.",
        404: "The page you are looking for does not exist or has been moved.",
        403: "Sorry, you are forbidden from accessing this page.",
    }[status] || "Sorry, an unexpected error has occurred.";

    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-6 dark:bg-neutral-950">
            <div className="relative w-full max-w-lg text-center">
                {/* Background Decoration */}
                <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-teal-500/10 blur-3xl dark:bg-teal-400/5"></div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="mb-4 text-8xl font-black text-neutral-200 dark:text-neutral-800">
                        {status}
                    </h1>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <h2 className="mb-4 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                            {title}
                        </h2>
                        <p className="mb-8 text-lg text-neutral-600 dark:text-neutral-400">
                            {description}
                        </p>

                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center rounded-full bg-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition-all hover:bg-teal-500 hover:shadow-teal-500/40 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:bg-teal-500 dark:hover:bg-teal-400 sm:w-auto"
                            >
                                Back to Home
                            </Link>

                            <button
                                onClick={() => window.history.back()}
                                className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-8 py-3 text-sm font-semibold text-neutral-700 transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 sm:w-auto"
                            >
                                Go Back
                            </button>
                        </div>
                    </motion.div>
                </motion.div>

                <p className="mt-16 text-sm text-neutral-400 dark:text-neutral-600">
                    If you believe this is a bug, please contact our support team.
                </p>
            </div>
        </div>
    );
}
