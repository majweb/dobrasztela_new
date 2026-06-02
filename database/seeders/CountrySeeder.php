<?php

namespace Database\Seeders;

use Illuminate\Support\Str;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CountrySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('countries')->delete();
        $countries = [
            [
                'id' => 1,
                'name'=>'Anglia',
                'slug'=>Str::slug('Anglia','-'),
                'flag' => 'gb-eng',
                'created_at'=>date('Y-m-d H:i:s'),
                'updated_at'=>date('Y-m-d H:i:s')
            ],
            [
                'id' => 2,
                'name'=>'Austria',
                'slug'=>Str::slug('Austria','-'),
                'flag' => 'at',
                'created_at'=>date('Y-m-d H:i:s'),
                'updated_at'=>date('Y-m-d H:i:s')
            ],
            [
                'id' => 3,
                'name'=>'Belgia',
                'slug'=>Str::slug('Belgia','-'),
                'flag' => 'be',
                'created_at'=>date('Y-m-d H:i:s'),
                'updated_at'=>date('Y-m-d H:i:s')
            ],
            [
                'id' => 4,
                'name'=>'Francja',
                'slug'=>Str::slug('Francja','-'),
                'flag' => 'fr',
                'created_at'=>date('Y-m-d H:i:s'),
                'updated_at'=>date('Y-m-d H:i:s')
            ],
            [
                'id' => 5,
                'name'=>'Hiszpania',
                'slug'=>Str::slug('Hiszpania','-'),
                'flag' => 'es',
                'created_at'=>date('Y-m-d H:i:s'),
                'updated_at'=>date('Y-m-d H:i:s')
            ],
            [
                'id' => 6,
                'name'=>'Holandia',
                'slug'=>Str::slug('Holandia','-'),
                'flag' => 'nl',
                'created_at'=>date('Y-m-d H:i:s'),
                'updated_at'=>date('Y-m-d H:i:s')
            ],
            [
                'id' => 7,
                'name'=>'Irlandia',
                'slug'=>Str::slug('Irlandia','-'),
                'flag' => 'ie',
                'created_at'=>date('Y-m-d H:i:s'),
                'updated_at'=>date('Y-m-d H:i:s')
            ],
            [
                'id' => 8,
                'name'=>'Irlandia Północna',
                'slug'=>Str::slug('Irlandia Północna','-'),
                'flag' => 'gb-nir',
                'created_at'=>date('Y-m-d H:i:s'),
                'updated_at'=>date('Y-m-d H:i:s')
            ],
            [
                'id' => 9,
                'name'=>'Luksemburg',
                'slug'=>Str::slug('Luksemburg','-'),
                'flag' => 'lu',
                'created_at'=>date('Y-m-d H:i:s'),
                'updated_at'=>date('Y-m-d H:i:s')
            ],
            [
                'id' => 10,
                'name'=>'Niemcy',
                'slug'=>Str::slug('Niemcy','-'),
                'flag' => 'de',
                'created_at'=>date('Y-m-d H:i:s'),
                'updated_at'=>date('Y-m-d H:i:s')
            ],
            [
                'id' => 11,
                'name'=>'Polska',
                'slug'=>Str::slug('Polska','-'),
                'flag' => 'pl',
                'created_at'=>date('Y-m-d H:i:s'),
                'updated_at'=>date('Y-m-d H:i:s')
            ],
            [
                'id' => 12,
                'name'=>'Szkocja',
                'slug'=>Str::slug('Szkocja','-'),
                'flag' => 'gb-sct',
                'created_at'=>date('Y-m-d H:i:s'),
                'updated_at'=>date('Y-m-d H:i:s')
            ],
            [
                'id' => 13,
                'name'=>'Szwajcaria',
                'slug'=>Str::slug('Szwajcaria','-'),
                'flag' => 'ch',
                'created_at'=>date('Y-m-d H:i:s'),
                'updated_at'=>date('Y-m-d H:i:s')
            ],
            [
                'id' => 14,
                'name'=>'USA',
                'slug'=>Str::slug('USA','-'),
                'flag' => 'us',
                'created_at'=>date('Y-m-d H:i:s'),
                'updated_at'=>date('Y-m-d H:i:s')
            ],
            [
                'id' => 15,
                'name'=>'Walia',
                'slug'=>Str::slug('Walia','-'),
                'flag' => 'gb-wls',
                'created_at'=>date('Y-m-d H:i:s'),
                'updated_at'=>date('Y-m-d H:i:s')
            ],
            [
                'id' => 16,
                'name'=>'Włochy',
                'slug'=>Str::slug('Włochy','-'),
                'flag' => 'it',
                'created_at'=>date('Y-m-d H:i:s'),
                'updated_at'=>date('Y-m-d H:i:s')
            ],
            [
                'id' => 17,
                'name'=>'-',
                'slug'=>"-",
                'flag' => '-',
                'created_at'=>date('Y-m-d H:i:s'),
                'updated_at'=>date('Y-m-d H:i:s')
            ],
        ];

        DB::table('countries')->insert($countries);
    }
}
