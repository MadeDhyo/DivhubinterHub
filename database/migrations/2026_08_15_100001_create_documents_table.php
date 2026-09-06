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
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('operation_id')->constrained('operations')->onDelete('cascade');
            $table->string('document_number')->unique();
            $table->string('title');
            $table->string('document_type'); // e.g., RED_NOTICE, DIFFUSION, WARRANT, PASSPORT, EXTRADITION
            $table->string('classification_level')->default('RAHASIA'); // SANGAT_RAHASIA, RAHASIA, TERBATAS, BIASA
            $table->string('source_agency'); // e.g., NCB Jakarta, Interpol Lyon, Polda Metro
            $table->integer('current_version')->default(1);
            $table->boolean('is_active')->default(true);
            $table->foreignId('uploaded_by')->constrained('users');
            $table->foreignId('verified_by')->nullable()->constrained('users');
            $table->date('retention_until')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
