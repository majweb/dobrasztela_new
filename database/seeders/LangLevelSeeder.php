<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LangLevelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('lang_levels')->delete();

        $data = [
            ['id' => 1, 'level' => 'Bez języka', 'slug' => 'bez-jezyka', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'level' => 'Podstawowy', 'slug' => 'podstawowy', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'level' => 'Komunikatywny', 'slug' => 'komunikatywny', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'level' => 'Dobry', 'slug' => 'dobry', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'level' => 'Bardzo dobry', 'slug' => 'bardzo-dobry', 'created_at' => now(), 'updated_at' => now()],
        ];

        DB::table('lang_levels')->insert($data);
    }
}
