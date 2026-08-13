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
        Schema::create('operation_checklist_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('operation_checklist_id')->constrained()->cascadeOnDelete();
            $table->foreignId('checklist_template_item_id')->constrained()->cascadeOnDelete();
            $table->string('status')->default('Not Started');
            $table->text('notes')->nullable();
            $table->string('attachment_path')->nullable();
            $table->foreignId('pic_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('reviewer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('deadline')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('operation_checklist_items');
    }
};
