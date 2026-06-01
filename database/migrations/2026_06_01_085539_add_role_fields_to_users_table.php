<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('role_id')->after('id')->nullable();
            $table->unsignedBigInteger('agency_id')->after('role_id')->nullable();
            $table->string('status')->after('email')->default('notActive');
            $table->string('phone')->after('status')->nullable();

            // Zachowujemy te same nazwy co w ds, ale dodajemy klucze obce jeśli to możliwe
            // $table->foreign('role_id')->references('id')->on('roles');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role_id', 'agency_id', 'status', 'phone']);
        });
    }
};
