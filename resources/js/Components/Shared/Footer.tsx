import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    Facebook,
    Twitter,
    Instagram,
    Youtube,
    Mail,
    MapPin,
    Phone,
    ArrowUpRight,
    Sparkles,
    ShieldCheck,
    Globe2
} from 'lucide-react';
import { SharedData } from '@/Types/Types';
import { cn } from '@/Lib/Utils';

/**
 * Komponen Footer Modern Premium.
 * 
 * Mengambil data dari Inertia shared props (siteSettings & menus)
 * untuk memastikan konten selalu sinkron dengan database/CMS.
 */
const Footer = () => {
    const { siteSettings, menus } = usePage<SharedData>().props;
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative w-full overflow-hidden bg-white/30 dark:bg-black/30 backdrop-blur-xl border-t border-neutral-200/50 dark:border-neutral-800/50 pt-16 pb-32 lg:pb-12">
            {/* Background Decorative Accent */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">

                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-2 group">
                            {siteSettings?.logo ? (
                                <img src={siteSettings.logo} alt="Logo" className="h-10 w-auto" />
                            ) : (
                                <div className="p-2 rounded-xl bg-teal-600 text-white shadow-lg shadow-teal-600/20">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                            )}
                            <span className="text-xl font-black uppercase tracking-tighter text-neutral-900 dark:text-white">
                                {siteSettings?.name || "KOTA PADANG"}
                            </span>
                        </Link>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
                            Portal Informasi Terpadu Pembangunan, Pengadaan, dan Kinerja Pemerintah Kota Padang. Mewujudkan tata kelola yang transparan dan akuntabel.
                        </p>
                        <div className="flex items-center gap-3">
                            <SocialIcon icon={Facebook} href={siteSettings?.facebook_url} />
                            <SocialIcon icon={Twitter} href={siteSettings?.twitter_url} />
                            <SocialIcon icon={Instagram} href={siteSettings?.instagram_url} />
                            <SocialIcon icon={Youtube} href={siteSettings?.youtube_url} />
                        </div>
                    </div>

                    {/* Quick Navigation (from Menus) */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400 mb-6">Navigasi Utama</h4>
                        <ul className="space-y-4">
                            {menus?.slice(0, 5).map((menu) => (
                                <li key={menu.id}>
                                    <FooterLink href={menu.url || "#"} label={menu.title} />
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Important Services */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400 mb-6">Layanan Digital</h4>
                        <ul className="space-y-4">
                            <li><FooterLink href="/dashboard" label="Dashboard Terpadu" isExternal /></li>
                            <li><FooterLink href="/pk-wako" label="Kinerja Wali Kota" isExternal /></li>
                            <li><FooterLink href="/progul" label="Program Unggulan" isExternal /></li>
                            <li><FooterLink href="/dashboard/pbj" label="E-Katalog Padang" isExternal /></li>
                        </ul>
                    </div>

                    {/* Contact & Address */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400 mb-6">Kontak Kami</h4>
                        <div className="space-y-5">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium italic leading-relaxed">
                                    Jl. Bagindo Aziz Chan No. 1, Aie Pacah, Kec. Koto Tangah, Kota Padang, Sumatera Barat
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-neutral-400 shrink-0" />
                                <p className="text-sm text-neutral-900 dark:text-white font-bold tracking-tight">
                                    (0751) 463777
                                </p>
                            </div>
                            <div className="flex items-center gap-3 group">
                                <Mail className="w-4 h-4 text-neutral-400 shrink-0 group-hover:text-teal-500 transition-colors" />
                                <a href="mailto:diskominfo@padang.go.id" className="text-sm text-neutral-500 dark:text-neutral-400 font-medium hover:text-teal-600 dark:hover:text-teal-400">
                                    diskominfo@padang.go.id
                                </a>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="mt-16 pt-8 border-t border-neutral-200/50 dark:border-neutral-800/50 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                        &copy; {currentYear} <span className="text-neutral-600 dark:text-neutral-300">DISKOMINFO KOTA PADANG</span>. ALL RIGHTS RESERVED.
                    </p>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-1.5 opacity-60">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Pusat Data Padang</span>
                        </div>
                        <div className="flex items-center gap-1.5 opacity-60">
                            <Globe2 className="w-4 h-4 text-blue-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Global Accessibility</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

/** Helper: Ikon Sosial Media dengan hover effect */
const SocialIcon = ({ icon: Icon, href }: { icon: any, href?: string }) => (
    <a
        href={href || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-500 hover:text-white hover:bg-teal-600 transition-all duration-300 group shadow-sm active:scale-95"
    >
        <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
    </a>
);

/** Helper: Link Footer dengan indikator hover */
const FooterLink = ({ href, label, isExternal }: { href: string, label: string, isExternal?: boolean }) => (
    <Link
        href={href}
        className="group flex items-center gap-1 text-sm font-bold text-neutral-500 dark:text-neutral-500 hover:text-teal-600 dark:hover:text-teal-400 transition-all tracking-tight uppercase"
    >
        {label}
        {isExternal && <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -translate-y-0.5 group-hover:translate-x-0.5" />}
    </Link>
);

export default Footer;
