<?php

declare(strict_types=1);

namespace App\Models;

use Exception;
use Illuminate\Support\Facades\Route;
use NoteBrainsLab\FilamentMenuManager\Models\MenuItem as BaseMenuItem;

final class MenuItem extends BaseMenuItem
{
    protected $appends = ['resolved_url'];

    public function getResolvedUrlAttribute(): string
    {
        $url = $this->url;

        // If it's a model link type (from the plugin), use its internal logic
        if ($this->type === 'model' && $this->linkable) {
            return $this->linkable->getMenuUrl() ?? '#';
        }

        if (! $url || $url === '#') {
            return '#';
        }

        // If it looks like a path or external URL, return as is
        if (str_starts_with($url, '/') || str_starts_with($url, 'http')) {
            return $url;
        }

        // Handle route names dynamically
        try {
            if (Route::has($url)) {
                return route($url);
            }
        } catch (Exception $e) {
            // Silently fail and return the raw URL if route resolution fails
        }

        return $url;
    }
}
