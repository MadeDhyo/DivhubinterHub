<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Operation;
use App\Models\Document;
use App\Models\AuditLog;
use App\Services\EncryptedDocumentService;
use App\Services\AuditTrailService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class DocumentAndSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_upload_encrypted_document_and_create_audit_log()
    {
        Storage::fake('local');

        $user = User::factory()->create([
            'role' => 'case_officer',
            'classification_clearance' => 'RAHASIA',
        ]);

        $operation = Operation::create([
            'operation_number' => 'OP-2026-TEST',
            'name' => 'Test Fugitive Ops',
            'status' => 'Verification',
            'priority' => 'High',
            'pic_id' => $user->id,
        ]);

        $file = UploadedFile::fake()->create('red_notice_warrant.pdf', 500, 'application/pdf');

        $response = $this->actingAs($user)->post('/documents', [
            'operation_id' => $operation->id,
            'title' => 'Interpol Red Notice Warrant',
            'document_type' => 'RED_NOTICE',
            'classification_level' => 'RAHASIA',
            'source_agency' => 'NCB Jakarta',
            'file' => $file,
        ]);

        $response->assertStatus(302);
        $this->assertDatabaseHas('documents', [
            'operation_id' => $operation->id,
            'title' => 'Interpol Red Notice Warrant',
            'classification_level' => 'RAHASIA',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'module' => 'DOCUMENT',
            'action_type' => 'CREATE',
        ]);
    }

    public function test_audit_log_hash_chaining_integrity()
    {
        $user = User::factory()->create([
            'role' => 'admin',
        ]);

        $this->actingAs($user);

        $log1 = AuditTrailService::log('OPERATION', 'CREATE', 'Operation', 1, null, ['name' => 'Ops 1']);
        $log2 = AuditTrailService::log('DOCUMENT', 'CREATE', 'Document', 1, null, ['title' => 'Doc 1']);

        $this->assertEquals('GENESIS', $log1->previous_hash);
        $this->assertEquals($log1->record_hash, $log2->previous_hash);
        $this->assertNotEmpty($log2->record_hash);
    }

    public function test_lan_access_middleware_blocks_unauthorized_ip()
    {
        // Only allow 192.168.80.0/24
        config(['security.allowed_ip_subnets' => ['192.168.80.0/24']]);

        // Request from unauthorized external IP → must be blocked
        $response = $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.195'])->get('/');
        $response->assertStatus(403);

        // Request from allowed LAN IP → must be allowed
        $responseAllowed = $this->withServerVariables(['REMOTE_ADDR' => '192.168.80.172'])->get('/');
        $responseAllowed->assertStatus(200);
    }
}
