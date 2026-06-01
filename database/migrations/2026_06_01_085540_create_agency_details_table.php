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
        Schema::create('agency_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->unique();
            $table->string('firstName');
            $table->string('lastName');
            $table->string('phone');
            $table->string('invoiceName')->nullable();
            $table->string('invoiceNip')->nullable();
            $table->string('invoiceRegon')->nullable();
            $table->string('invoiceAddressStreet')->nullable();
            $table->string('invoiceAddressPostalCode')->nullable();
            $table->string('invoiceAddressPlace')->nullable();
            $table->string('invoiceAddressCountry')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agency_details');
    }
};
