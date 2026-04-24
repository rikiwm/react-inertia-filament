<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

final class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::query()->create([
            'name' => 'The Developer',
            'email' => 'xamp@example.com',
            'role' => UserRole::Developer,
            'password' => bcrypt('xample'),
        ]);
    }
}
