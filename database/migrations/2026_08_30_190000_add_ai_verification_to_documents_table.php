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
        Schema::table('documents', function (Blueprint $table) {
            $table->enum('ai_verification_status', ['PENDING', 'VERIFIED', 'REJECTED', 'SKIPPED'])
                  ->nullable()
                  ->default(null)
                  ->after('retention_until');

            $table->text('ai_verification_result')
                  ->nullable()
                  ->after('ai_verification_status');

            $table->timestamp('ai_verified_at')
                  ->nullable()
                  ->after('ai_verification_result');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn(['ai_verification_status', 'ai_verification_result', 'ai_verified_at']);
        });
    }
};
