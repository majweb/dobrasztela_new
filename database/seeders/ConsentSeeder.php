<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ConsentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('consents')->truncate();

        $consents = [
            ['id' => 1, 'content' =>'Wyrażam zgodę na przetwarzanie moich danych osobowych przez WORK 4 YOU GLOBAL LTD z siedzibą w Wielkiej Brytanii, dla potrzeb niezbędne w celu realizacji umowy o świadczenie usług drogą elektroniczną i korzystanie z Serwisu www.dobrasztela.pl','type'=>'Aplikacja bez logowania', 'required' => 1, 'created_at' => date('Y-m-d H:i:s'), 'updated_at' =>date('Y-m-d H:i:s')],
            ['id' => 2, 'content' =>'Wyrażam zgodę na przetwarzanie moich danych osobowych przez dynamic dla potrzeb niezbędne w celu realizacji umowy o świadczenie usług drogą elektroniczną i korzystanie z Serwisu www.dobrasztela.pl', 'type'=>'dynamiczne', 'required' => 1, 'created_at' => date('Y-m-d H:i:s'), 'updated_at' =>date('Y-m-d H:i:s')],
            ['id' => 3, 'content' =>'Wyrażam zgodę na przetwarzanie moich danych zamieszczonych w formularzu przez wybrane przeze mnie agencje pracy/firmy dla potrzeb niezbędnych do udziału w procesie rekrutacji zgodnie z zapisami Rozporządzenia o ochronie danych osobowych RODO z 25 maja 2018 roku', 'type'=>'Aplikacja bez logowania', 'required' => 1, 'created_at' => date('Y-m-d H:i:s'), 'updated_at' =>date('Y-m-d H:i:s')],
            ['id' => 4, 'content' =>'Akceptuję <a class="font-weight-bold" href="/regulamin">Regulamin</a> i <a class="font-weight-bold" href="/polityka-prywatnosci">Politykę Prywatności</a>', 'type'=>'Aplikacja bez logowania', 'required' => 1, 'created_at' => date('Y-m-d H:i:s'), 'updated_at' =>date('Y-m-d H:i:s')],
            ['id' => 5, 'content' =>'Wyrażam zgodę na przetwarzanie moich danych osobowych przez dynamic dla potrzeb niezbędne w celu realizacji umowy o świadczenie usług drogą elektroniczną i korzystanie z Serwisu www.dobrasztela.pl', 'type'=>'Aplikacja na ofertę', 'required' => 1, 'created_at' => date('Y-m-d H:i:s'), 'updated_at' =>date('Y-m-d H:i:s')],
            ['id' => 6, 'content' =>'Akceptuję <span style="color: #ffa35d;"><a class="font-weight-bold" style="color: #ffa35d;" href="/regulamin">Regulamin</a></span> i <span style="color: #ffa35d;"><a class="font-weight-bold" style="color: #ffa35d;" href="/polityka-prywatnosci">Politykę Prywatności.</a></span>','type'=>'Aplikacja na ofertę', 'required' => 1, 'created_at' => date('Y-m-d H:i:s'), 'updated_at' =>date('Y-m-d H:i:s')],
            ['id' => 7, 'content' =>'Wyrażam zgodę na przetwarzanie moich danych zamieszczonych w formularzu przez wybrane przeze mnie agencje pracy/firmy dla potrzeb niezbędnych do udziału w procesie rekrutacji zgodnie z zapisami Rozporządzenia o ochronie danych osobowych RODO z 25 maja 2018 roku','type'=>'Aplikacja do wielu', 'required' => 1, 'created_at' => date('Y-m-d H:i:s'), 'updated_at' =>date('Y-m-d H:i:s')],
            ['id' => 8, 'content' =>'Wyrażam zgodę na przetwarzanie moich danych osobowych przez WORK 4 YOU GLOBAL LTD z siedzibą w Wielkiej Brytanii, dla potrzeb niezbędne w celu realizacji umowy o świadczenie usług drogą elektroniczną i korzystanie z Serwisu www.dobrasztela.pl','type'=>'Aplikacja do wielu', 'required' => 1, 'created_at' => date('Y-m-d H:i:s'), 'updated_at'=>date('Y-m-d H:i:s')],
            ['id' => 9, 'content' =>'Akceptuję <a class="mr-1" style="color:#fffdb2;" href="/regulamin">Regulamin</a> i <a class="ml-lg-1" style="color:#fffdb2;" href="/polityka-prywatnosci">Politykę Prywatności</a>','type'=>'Aplikacja do wielu', 'required' => 1, 'created_at' => date('Y-m-d H:i:s'), 'updated_at' =>date('Y-m-d H:i:s')],
            ['id' => 10, 'content' =>'Wyrażam zgodę na przetwarzanie moich danych osobowych w powyższym formularzu kontaktowym w celu realizacji zgłoszenia w serwisie dobrasztela.pl. Podanie danych jest dobrowolne, ale niezbędne do przetworzenia zapytania.<br>Są mi znane moje prawa co do dostępu do moich danych, możliwości ich poprawiania, jak również żądania zaprzestania ich przetwarzania.','type'=>'Formularz kontaktowy', 'required' => 1, 'created_at' => date('Y-m-d H:i:s'), 'updated_at' =>date('Y-m-d H:i:s')],
            ['id' => 11, 'content' =>'Chce otrzymywać informację o nowościach.','type'=>'Newsletter', 'required' => 0, 'created_at' => date('Y-m-d H:i:s'), 'updated_at' =>date('Y-m-d H:i:s')],
            ['id' => 12, 'content' =>'<span>Akceptuje <a href="/regulamin" class="red-text">Regulamin</a> i <a href="/polityka-prywatnosci" class="red-text">Politykę Prywatności*</a></span>','type'=>'Płatność', 'required' => 1, 'created_at'=> date('Y-m-d H:i:s'), 'updated_at'=>date('Y-m-d H:i:s')],
            ['id' => 13, 'content' =>'Wyrażam zgodę na przetwarzanie moich danych osobowych przez WORK 4 YOU GLOBAL LTD z siedzibą w Wielkiej Brytanii, dla potrzeb niezbędne w celu realizacji umowy o świadczenie usług drogą elektroniczną i korzystanie z Serwisu www.dobrasztela.pl. opiekunka','type'=>'Rejestracja opiekunki', 'required' => 1, 'created_at'=> date('Y-m-d H:i:s'), 'updated_at'=>date('Y-m-d H:i:s')],
            ['id' => 14, 'content' =>'Akceptuje <a href="/regulamin" class="orange-link">Regulamin</a> i <a href="/polityka-prywatnosci" class="orange-link">Politykę Prywatności opiekunka</a>','type'=>'Rejestracja opiekunki', 'required' => 1, 'created_at'=> date('Y-m-d H:i:s'), 'updated_at'=>date('Y-m-d H:i:s')],
            ['id' => 15, 'content' =>'Wyrażam zgodę na przetwarzanie moich danych osobowych przez WORK 4 YOU GLOBAL LTD z siedzibą w Wielkiej Brytanii, dla potrzeb niezbędne w celu realizacji umowy o świadczenie usług drogą elektroniczną i korzystanie z Serwisu www.dobrasztela.pl pracodawcy','type'=>'Rejestracja pracodawcy', 'required' => 1, 'created_at'=> date('Y-m-d H:i:s'),'updated_at'=>date('Y-m-d H:i:s')],
            ['id' => 16, 'content' =>'Akceptuje <a href="/regulamin">Regulamin</a> i <a href="/polityka-prywatnosci">Politykę Prywatności pracodawcy</a>','type'=>'Rejestracja pracodawcy', 'required' => 1, 'created_at'=> date('Y-m-d H:i:s'), 'updated_at'=>date('Y-m-d H:i:s')],
        ];
        DB::table('consents')->insert($consents);
    }
}
