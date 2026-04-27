import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink, Clock, Newspaper, ChevronRight } from 'lucide-react';
import { cn } from '@/Lib/utils';

interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    source: string;
    description: string;
    image: string;
    time_ago: string;
}

interface DisasterNewsProps {
    news: NewsItem[];
}

export const DisasterNews = ({ news }: DisasterNewsProps) => {
    if (!news || news.length === 0) return null;

    return (
        <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Newspaper className="w-5 h-5 text-teal-600" />
                        <span className="text-xs font-bold text-teal-600 uppercase tracking-[0.2em]">Kabar Terkini</span>
                    </div>
                    <h2 className="text-3xl font-bold text-neutral-900 dark:text-white uppercase tracking-tighter">
                        Berita <span className="text-teal-600">Kebencanaan</span>
                    </h2>
                </div>
                <div className="hidden md:block">
                    <p className="text-sm text-neutral-500 font-medium">Informasi terbaru dari sumber berita terpercaya</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {news.map((item, index) => (
                    <motion.a
                        key={index}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="group flex flex-col bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-300"
                    >
                        <div className="relative h-48 overflow-hidden">
                            <img 
                                src={item.image} 
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                <span className="text-white text-xs font-bold flex items-center gap-1">
                                    Baca Selengkapnya <ExternalLink className="w-3 h-3" />
                                </span>
                            </div>
                            <div className="absolute top-3 left-3 px-3 py-1 bg-teal-600/90 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                                {item.source}
                            </div>
                        </div>
                        
                        <div className="p-5 flex-1 flex flex-col">
                            <div className="flex items-center gap-2 mb-3 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                <Clock className="w-3 h-3" />
                                {item.time_ago}
                            </div>
                            <h3 className="text-base font-bold text-neutral-800 dark:text-white line-clamp-2 group-hover:text-teal-600 transition-colors mb-3 leading-snug">
                                {item.title}
                            </h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-3 mb-4 leading-relaxed">
                                {item.description}
                            </p>
                            <div className="mt-auto pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-teal-600 uppercase">Lihat Detail</span>
                                <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </motion.a>
                ))}
            </div>
        </div>
    );
};
