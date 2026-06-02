<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LangSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('langs')->delete();

        $data = [
            ['id' => 1, 'lang' => 'niemiecki', 'slug' => 'niemiecki', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'lang' => 'angielski', 'slug' => 'angielski', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'lang' => 'włoski', 'slug' => 'wloski', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'lang' => 'hiszpański', 'slug' => 'hiszpanski', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'lang' => 'holenderski', 'slug' => 'holenderski', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 6, 'lang' => 'francuski', 'slug' => 'francuski', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 7, 'lang' => 'polski', 'slug' => 'polski', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 8, 'lang' => 'rosyjski', 'slug' => 'rosyjski', 'created_at' => now(), 'updated_at' => now()],
        ];

        DB::table('langs')->insert($data);
    }
}
