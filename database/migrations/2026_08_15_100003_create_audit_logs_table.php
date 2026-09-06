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
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->timestamp('event_time')->useCurrent();
            $table->foreignId('actor_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('actor_name');
            $table->string('actor_role');
            $table->string('ip_address', 45);
            $table->text('user_agent');
            $table->string('module'); // OPERATION, CHECKLIST, DOCUMENT, APPROVAL, RISK, USER
            $table->string('action_type'); // CREATE, UPDATE, DELETE, APPROVE, REJECT, EXPORT, DOWNLOAD, VIEW
            $table->string('entity_name');
            $table->string('entity_id');
            $table->json('before_state')->nullable();
            $table->json('after_state')->nullable();
            $table->char('previous_hash', 64)->nullable();
            $table->char('record_hash', 64);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
