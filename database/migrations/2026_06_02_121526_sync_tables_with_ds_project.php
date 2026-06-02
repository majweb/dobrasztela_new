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
        // 1. Carrier Details - Upewniamy się, że są wszystkie pola faktury i dane kontaktowe
        Schema::table('carrier_details', function (Blueprint $table) {
            // Zakładam, że podstawowe pola już są, dodajemy ewentualne braki
            if (!Schema::hasColumn('carrier_details', 'invoiceName')) $table->string('invoiceName')->nullable();
            if (!Schema::hasColumn('carrier_details', 'invoiceNip')) $table->string('invoiceNip')->nullable();
            if (!Schema::hasColumn('carrier_details', 'invoiceRegon')) $table->string('invoiceRegon')->nullable();
            if (!Schema::hasColumn('carrier_details', 'invoiceAddressStreet')) $table->string('invoiceAddressStreet')->nullable();
            if (!Schema::hasColumn('carrier_details', 'invoiceAddressPostalCode')) $table->string('invoiceAddressPostalCode')->nullable();
            if (!Schema::hasColumn('carrier_details', 'invoiceAddressPlace')) $table->string('invoiceAddressPlace')->nullable();
            if (!Schema::hasColumn('carrier_details', 'invoiceAddressCountry')) $table->string('invoiceAddressCountry')->nullable();
        });

        // 2. Carrier Cards - Synchronizacja wizytówki
        Schema::table('carrier_cards', function (Blueprint $table) {
            if (!Schema::hasColumn('carrier_cards', 'active')) $table->boolean('active')->default(1);
            if (!Schema::hasColumn('carrier_cards', 'companyMobile')) $table->string('companyMobile')->nullable();
            if (!Schema::hasColumn('carrier_cards', 'teaser')) $table->text('teaser')->nullable();
            if (!Schema::hasColumn('carrier_cards', 'description')) $table->text('description')->nullable();
            if (!Schema::hasColumn('carrier_cards', 'fb_shearer_link')) $table->string('fb_shearer_link')->nullable();
            if (!Schema::hasColumn('carrier_cards', 'preferImage')) $table->string('preferImage')->comment('Zdjęcie preferowany pracodawca')->nullable();
        });

        // 3. Agency Details
        Schema::table('agency_details', function (Blueprint $table) {
            if (!Schema::hasColumn('agency_details', 'invoiceName')) $table->string('invoiceName')->nullable();
            if (!Schema::hasColumn('agency_details', 'invoiceNip')) $table->string('invoiceNip')->nullable();
            if (!Schema::hasColumn('agency_details', 'invoiceRegon')) $table->string('invoiceRegon')->nullable();
            if (!Schema::hasColumn('agency_details', 'invoiceAddressStreet')) $table->string('invoiceAddressStreet')->nullable();
            if (!Schema::hasColumn('agency_details', 'invoiceAddressPostalCode')) $table->string('invoiceAddressPostalCode')->nullable();
            if (!Schema::hasColumn('agency_details', 'invoiceAddressPlace')) $table->string('invoiceAddressPlace')->nullable();
            if (!Schema::hasColumn('agency_details', 'invoiceAddressCountry')) $table->string('invoiceAddressCountry')->nullable();
        });

        // 4. Agency Cards
        Schema::table('agency_cards', function (Blueprint $table) {
            if (!Schema::hasColumn('agency_cards', 'preferImage')) $table->string('preferImage')->comment('Zdjęcie preferowany pracodawca')->nullable();
            if (!Schema::hasColumn('agency_cards', 'accepted')) $table->boolean('accepted')->default(0);
        });

        // 5. Sitter Details - To wymaga najwięcej zmian
        Schema::table('sitter_details', function (Blueprint $table) {
            if (!Schema::hasColumn('sitter_details', 'photo')) $table->string('photo')->nullable();
            if (!Schema::hasColumn('sitter_details', 'files')) $table->json('files')->nullable();
            if (!Schema::hasColumn('sitter_details', 'experience')) $table->string('experience')->nullable();
            if (!Schema::hasColumn('sitter_details', 'driveLicense')) $table->string('driveLicense')->nullable();
            if (!Schema::hasColumn('sitter_details', 'expectations')) $table->string('expectations')->nullable();
            if (!Schema::hasColumn('sitter_details', 'otherpeople')) $table->string('otherpeople')->nullable();
            if (!Schema::hasColumn('sitter_details', 'internet')) $table->string('internet')->nullable();
            if (!Schema::hasColumn('sitter_details', 'tv')) $table->string('tv')->nullable();
            if (!Schema::hasColumn('sitter_details', 'animals')) $table->string('animals')->nullable();
            if (!Schema::hasColumn('sitter_details', 'smoking')) $table->string('smoking')->nullable();
            if (!Schema::hasColumn('sitter_details', 'agreement')) $table->string('agreement')->nullable();
            if (!Schema::hasColumn('sitter_details', 'zus')) $table->string('zus')->nullable();
            if (!Schema::hasColumn('sitter_details', 'payment')) $table->string('payment')->nullable();
            if (!Schema::hasColumn('sitter_details', 'bonus')) $table->string('bonus')->nullable();
            if (!Schema::hasColumn('sitter_details', 'daysoff')) $table->string('daysoff')->nullable();
            if (!Schema::hasColumn('sitter_details', 'time')) $table->string('time')->nullable();
            if (!Schema::hasColumn('sitter_details', 'when')) $table->string('when')->nullable();
            if (!Schema::hasColumn('sitter_details', 'drive')) $table->string('drive')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Generalnie przy synchronizacji nie usuwamy kolumn, ale dla porządku:
        Schema::table('sitter_details', function (Blueprint $table) {
            $table->dropColumn(['photo', 'files', 'experience', 'driveLicense', 'expectations', 'otherpeople', 'internet', 'tv', 'animals', 'smoking', 'agreement', 'zus', 'payment', 'bonus', 'daysoff', 'time', 'when', 'drive']);
        });

        Schema::table('agency_cards', function (Blueprint $table) {
            $table->dropColumn(['preferImage', 'accepted']);
        });

        Schema::table('carrier_cards', function (Blueprint $table) {
            $table->dropColumn(['active', 'companyMobile', 'teaser', 'description', 'fb_shearer_link', 'preferImage']);
        });
    }
};
