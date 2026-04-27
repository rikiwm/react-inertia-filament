import React from 'react';
import { motion } from 'motion/react';
import { Hash, ExternalLink, Clock, Newspaper, MessageSquare } from 'lucide-react';

interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    source: string;
    description: string;
    image: string;
    time_ago: string;
}

interface HashtagNewsProps {
    news: NewsItem[];
    title?: string;
}

export const HashtagNews = ({ news, title }: HashtagNewsProps) => {
    if (!news || news.length === 0) return null;

    const highlightText = (text: string, query: string | undefined) => {
        if (!query) return text;
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return (
            <>
                {parts.map((part, i) => 
                    part.toLowerCase() === query.toLowerCase() 
                        ? <span key={i} className="text-teal-600 font-bold">{part}</span> 
                        : part
                )}
            </>
        );
    };

    return (
        <div className="mt-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 bg-teal-500/10 rounded-lg">
                            <Hash className="w-5 h-5 text-teal-600" />
                        </div>
                        <div className='flex flex-col'>

                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white uppercase tracking-tighter">
                                {title ? (
                                    <> <span className="text-teal-600/50">{title}</span></>
                                ) : (
                                    <>Aktivitas <span className="text-teal-600/50">Program Unggulan</span></>
                                )}
                            </h2>
                            <p className="text-neutral-500  max-w-xl text-xs">
                                Publikasi dan aktivitas masyarakat melalui hashtag #{title} di berbagai media.
                            </p>
                        </div>

                    </div>


                </div>
                <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-neutral-900 bg-neutral-200 overflow-hidden">
                                <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                            </div>
                        ))}
                    </div>
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Trending in {title ? '#' + title : 'Program Unggulan'}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {news.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="group relative bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 hover:border-teal-500/50 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-300"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600">
                                    <Newspaper className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">{item.source}</span>
                            </div>
                            <div className="text-[10px] font-bold text-neutral-400">{item.time_ago}</div>
                        </div>

                        <div className="relative aspect-video rounded-2xl overflow-hidden mb-4">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-teal-900/10 group-hover:bg-transparent transition-colors" />
                        </div>

                        <h3 className="text-sm font-bold text-neutral-800 dark:text-white line-clamp-2 mb-3 leading-snug group-hover:text-teal-600 transition-colors">
                            {highlightText(item.title, title)}
                        </h3>

                        <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-3 mb-2 leading-relaxed">
                            {highlightText(item.description, title)}
                        </p>

                        <div className="flex items-end justify-between pt-2 border-t border-neutral-50 dark:border-neutral-800">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-[10px] font-bold text-neutral-400">
                                    <MessageSquare className="w-3 h-3" />
                                    <span>Read more...</span>
                                </div>
                            </div>
                            <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-400 group-hover:bg-teal-600 group-hover:text-white transition-all"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
