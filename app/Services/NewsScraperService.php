<?php

declare(strict_types=1);

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Log;

final class NewsScraperService
{
    /**
     * Scrape news from Google News RSS based on query.
     */
    public function scrapeByQuery(string $query, int $limit = 6): array
    {
        $cacheKey = 'news_scrape_'.md5($query);

        return Cache::remember($cacheKey, 1800, function () use ($query, $limit) {
            try {
                $url = 'https://news.google.com/rss/search?q='.urlencode($query).'&hl=id&gl=ID&ceid=ID:id';

                $response = Http::timeout(15)->get($url);

                if (! $response->successful()) {
                    return [];
                }

                $xml = simplexml_load_string($response->body());
                if (! $xml) {
                    return [];
                }

                $items = [];
                $count = 0;

                foreach ($xml->channel->item as $item) {
                    if ($count >= $limit) {
                        break;
                    }

                    // Parse image if available in description or use a relevant placeholder
                    $description = (string) $item->description;
                    $imageUrl = $this->extractImageFromDescription($description);

                    $items[] = [
                        'title' => (string) $item->title,
                        'link' => (string) $item->link,
                        'pubDate' => (string) $item->pubDate,
                        'source' => (string) $item->source,
                        'description' => strip_tags($description),
                        'image' => $imageUrl ?: $this->getPlaceholderImage($query),
                        'time_ago' => $this->formatTimeAgo((string) $item->pubDate),
                    ];

                    $count++;
                }

                return $items;
            } catch (Exception $e) {
                Log::error('Scraping Error: '.$e->getMessage());

                return [];
            }
        });
    }

    /**
     * Scrape news based on hashtags.
     */
    public function scrapeByHashtags(array $hashtags, int $limit = 6): array
    {
        $query = implode(' OR ', $hashtags);

        return $this->scrapeByQuery($query, $limit);
    }

    /**
     * Extract image URL from RSS description HTML.
     */
    private function extractImageFromDescription(string $html): ?string
    {
        if (preg_match('/<img.+src=[\'"](?P<src>.+?)[\'"].*>/i', $html, $matches)) {
            return $matches['src'];
        }

        return null;
    }

    /**
     * Get a relevant placeholder image based on query.
     */
    private function getPlaceholderImage(string $query): string
    {
        $isDisaster = Str::contains(mb_strtolower($query), ['bencana', 'banjir', 'gempa', 'longsor']);
        $color = $isDisaster ? '#ef4444' : '#0d9488'; // Red for disaster, Teal for general

        $svg = '<svg width="800" height="450" viewBox="0 0 800 450" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="800" height="450" fill="#f8fafc"/>
            <rect x="250" y="125" width="300" height="200" rx="24" fill="white" stroke="#e2e8f0" stroke-width="2"/>
            <circle cx="400" cy="225" r="60" fill="#f1f5f9"/>
            <circle cx="400" cy="225" r="45" stroke="'.$color.'" stroke-width="4" stroke-dasharray="8 4"/>
            <path d="M370 225C370 208.431 383.431 195 400 195C416.569 195 430 208.431 430 225C430 241.569 416.569 255 400 255C383.431 255 370 241.569 370 225Z" fill="'.$color.'" fill-opacity="0.1"/>
            <path d="M385 225C385 216.716 391.716 210 400 210C408.284 210 415 216.716 415 225C415 233.284 408.284 240 400 240C391.716 240 385 233.284 385 225Z" fill="'.$color.'"/>
            <rect x="330" y="105" width="60" height="20" rx="10" fill="'.$color.'" fill-opacity="0.2"/>
            <circle cx="485" cy="160" r="10" fill="'.$color.'" fill-opacity="0.1"/>
            <circle cx="485" cy="160" r="4" fill="'.$color.'"/>
            <text x="400" y="360" text-anchor="middle" fill="#94a3b8" style="font-family: sans-serif; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">Gambar Tidak Tersedia</text>
        </svg>';

        return 'data:image/svg+xml;base64,'.base64_encode($svg);
    }

    /**
     * Format date to "time ago" string.
     */
    private function formatTimeAgo(string $date): string
    {
        try {
            $time = strtotime($date);
            $diff = time() - $time;

            if ($diff < 60) {
                return 'Baru saja';
            }
            if ($diff < 3600) {
                return floor($diff / 60).' menit lalu';
            }
            if ($diff < 86400) {
                return floor($diff / 3600).' jam lalu';
            }
            if ($diff < 2592000) {
                return floor($diff / 86400).' hari lalu';
            }

            return date('d M Y', $time);
        } catch (Exception $e) {
            return $date;
        }
    }
}
