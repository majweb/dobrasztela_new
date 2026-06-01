<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RolesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            ['id' => 1, 'role' => 'admin', 'name' => 'Admin'],
            ['id' => 2, 'role' => 'agency', 'name' => 'Agency'],
            ['id' => 3, 'role' => 'sitter', 'name' => 'Sitter'],
            ['id' => 4, 'role' => 'recruit', 'name' => 'Recruit'],
            ['id' => 5, 'role' => 'carrier', 'name' => 'Carrier'],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(['id' => $role['id']], $role);
        }
    }
}
