<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Notifications\DatabaseNotificationCollection;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property UserRole $role
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property Carbon|null $deleted_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read DatabaseNotificationCollection<int, DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 *
 * @method static UserFactory factory($count = null, $state = [])
 * @method static Builder<static>|User newModelQuery()
 * @method static Builder<static>|User newQuery()
 * @method static Builder<static>|User onlyTrashed()
 * @method static Builder<static>|User query()
 * @method static Builder<static>|User whereCreatedAt($value)
 * @method static Builder<static>|User whereDeletedAt($value)
 * @method static Builder<static>|User whereEmail($value)
 * @method static Builder<static>|User whereEmailVerifiedAt($value)
 * @method static Builder<static>|User whereId($value)
 * @method static Builder<static>|User whereName($value)
 * @method static Builder<static>|User wherePassword($value)
 * @method static Builder<static>|User whereRememberToken($value)
 * @method static Builder<static>|User whereRole($value)
 * @method static Builder<static>|User whereUpdatedAt($value)
 * @method static Builder<static>|User withTrashed(bool $withTrashed = true)
 * @method static Builder<static>|User withoutTrashed()
 *
 * @mixin \Eloquent
 */
final class User extends Authenticatable implements FilamentUser
{
    use HasFactory;
    use Notifiable;
    use SoftDeletes;

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Menentukan apakah pengguna berhak mengakses panel admin Filament.
     *
     * Hanya pengguna dengan peran Developer atau Admin yang diizinkan
     * masuk ke panel administrasi. Semua peran lain akan ditolak.
     *
     * @param  Panel  $panel  Panel Filament yang sedang diakses
     */
    public function canAccessPanel(Panel $panel): bool
    {
        // Hanya Developer dan Admin yang dapat mengakses panel Filament.
        return in_array($this->role, [
            UserRole::Developer,
            UserRole::Admin,
        ]);
    }

    /**
     * Mengambil daftar peran yang berada di bawah peran pengguna yang sedang login.
     *
     * Developer dapat mengelola semua peran (Developer, Admin, User).
     * Admin hanya dapat mengelola User.
     * User tidak dapat mengelola siapapun.
     *
     * @return array<int, UserRole> Daftar peran yang lebih rendah dari peran saat ini
     */
    public function lowerRoles(): array
    {
        return match (auth()->user()->role) {
            UserRole::Developer => [UserRole::Developer, UserRole::Admin, UserRole::User],
            UserRole::Admin     => [UserRole::User],
            UserRole::User      => [],
        };
    }

    /**
     * Memeriksa apakah pengguna ini memiliki peran yang lebih rendah dari
     * pengguna yang sedang terautentikasi, sehingga dapat dikelola olehnya.
     *
     * Developer selalu dianggap dapat mengelola semua pengguna.
     * Admin hanya dapat mengelola pengguna dengan peran di bawahnya.
     *
     * @return bool True jika pengguna ini dapat dikelola oleh yang sedang login
     */
    public function isLowerInRole(): bool
    {
        if (auth()->user()->role === UserRole::Developer) {
            return true;
        }

        return in_array($this->role, auth()->user()->lowerRoles());
    }

    /**
     * Mendefinisikan aturan casting atribut model ke tipe data yang sesuai.
     *
     * - `email_verified_at` di-cast ke objek Carbon (datetime).
     * - `password` secara otomatis di-hash saat disimpan.
     * - `role` di-cast ke enum `UserRole` untuk keamanan tipe.
     *
     * @return array<string, string> Peta nama atribut ke tipe cast-nya
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'role'              => UserRole::class,
        ];
    }
}
