import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Home, LayoutDashboard, BarChart3, Package, Zap } from 'lucide-react';
import { cn } from '@/Lib/utils';
import { motion } from 'motion/react';
import { route } from 'ziggy-js';

const BottomNavigation = () => {
    const { url } = usePage();

    const navItems = [
        {
            label: 'Home',
            icon: Home,
            href: route('landing-page'),
            isActive: url === '/'
        },
        {
            label: 'Dashboard',
            icon: LayoutDashboard,
            href: route('dashboard'),
            isActive: url.startsWith('/dashboard') && !url.includes('/pbj')
        },
        {
            label: 'Progul',
            icon: Zap,
            href: route('progul'),
            isActive: url.startsWith('/progul')
        },
        {
            label: 'PBJ',
            icon: Package,
            href: route('pbj.list'),
            isActive: url.startsWith('/dashboard/pbj')
        },
        {
            label: 'Wako',
            icon: BarChart3,
            href: route('pk-wako'),
            isActive: url.startsWith('/pk-wako')
        }
    ];

    return (
        <div className="lg:hidden w-full fixed bottom-2 left-0 right-0 z-50 flex justify-center px-3 pointer-events-none">
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={cn(
                    "pointer-events-auto w-full mx-3",
                    "flex items-center gap-1.5 p-1.5 flex-row justify-between rounded-2xl border",
                    "bg-white/20 dark:bg-black/70 backdrop-blur-xl",
                    "border-neutral-200/50 dark:border-neutral-800/50",
                    "shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
                )}
            >
                {navItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={index}
                            href={item.href}
                            className={cn(
                                "relative flex flex-col items-center justify-center px-3.5 py-2 rounded-lg transition-all duration-300",
                                item.isActive
                                    ? "text-teal-600 dark:text-teal-400"
                                    : "text-neutral-500 dark:text-neutral-500 hover:text-teal-500 dark:hover:text-teal-500"
                            )}
                        >
                            {item.isActive && (
                                <motion.div
                                    layoutId="bottom-nav-active"
                                    className="absolute inset-0 bg-teal-500/10 dark:bg-teal-400/10  rounded-lg"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <Icon className={cn(
                                "w-5 h-5 transition-transform duration-300",
                                item.isActive && "scale-110"
                            )} />
                            <span className={cn(
                                "text-[8px] font-semibold mt-1 uppercase tracking-tighter transition-all duration-300",
                                item.isActive ? "opacity-100 h-auto" : "opacity-0 h-0 scale-90"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </motion.div>
        </div>
    );
};

export default BottomNavigation;
