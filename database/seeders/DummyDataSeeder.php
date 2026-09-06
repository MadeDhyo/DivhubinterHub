<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DummyDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = \App\Models\User::factory()->create([
            'name' => 'Pimpinan Admin',
            'email' => 'admin@ocms.local',
            'nip' => '198001012005011001',
            'role' => 'admin',
            'classification_clearance' => 'SANGAT_RAHASIA',
            'password' => bcrypt('password'),
        ]);

        $user = \App\Models\User::factory()->create([
            'name' => 'Kombes Pol Ardy (Pimpinan)',
            'email' => 'pimpinan@ocms.local',
            'nip' => '198501152010121001',
            'role' => 'approver',
            'classification_clearance' => 'SANGAT_RAHASIA',
            'password' => bcrypt('password'),
        ]);

        $officer = \App\Models\User::factory()->create([
            'name' => 'Bripka Susanto (Case Officer)',
            'email' => 'officer@ocms.local',
            'nip' => '199203102015031002',
            'role' => 'case_officer',
            'classification_clearance' => 'RAHASIA',
            'password' => bcrypt('password'),
        ]);

        $template = \App\Models\ChecklistTemplate::create([
            'name' => 'Standard Fugitive Check',
            'category' => 'Verification',
        ]);

        $items = [
            \App\Models\ChecklistTemplateItem::create(['checklist_template_id' => $template->id, 'name' => 'Identifikasi Profil Target', 'is_mandatory' => true, 'is_critical' => true]),
            \App\Models\ChecklistTemplateItem::create(['checklist_template_id' => $template->id, 'name' => 'Cek Status Red Notice Interpol', 'is_mandatory' => true, 'is_critical' => true]),
            \App\Models\ChecklistTemplateItem::create(['checklist_template_id' => $template->id, 'name' => 'Koordinasi Pointers NCB Negara Asal', 'is_mandatory' => false, 'is_critical' => false])
        ];

        $operation = \App\Models\Operation::create([
            'operation_number' => 'OP-2026-001',
            'name' => 'Operation Fugitive Alpha',
            'status' => 'Verification',
            'priority' => 'High',
            'pic_id' => $user->id,
        ]);

        \App\Models\Target::create([
            'operation_id' => $operation->id,
            'name' => 'John Doe',
            'alias' => 'The Ghost',
            'nationality' => 'Unknown',
            'red_notice_ref' => 'A-1234/1-2026'
        ]);

        $opChecklist = \App\Models\OperationChecklist::create([
            'operation_id' => $operation->id,
            'checklist_template_id' => $template->id,
        ]);

        foreach ($items as $item) {
            \App\Models\OperationChecklistItem::create([
                'operation_checklist_id' => $opChecklist->id,
                'checklist_template_item_id' => $item->id,
                'status' => 'Not Started',
            ]);
        }

        // Seed Sample Encrypted Document Metadata
        $doc = \App\Models\Document::create([
            'operation_id' => $operation->id,
            'document_number' => 'DOC-NCB-20260815-RED1',
            'title' => 'Red Notice Official Interpol Control A-1234/1-2026',
            'document_type' => 'RED_NOTICE',
            'classification_level' => 'RAHASIA',
            'source_agency' => 'Interpol General Secretariat Lyon',
            'current_version' => 1,
            'uploaded_by' => $officer->id,
        ]);

        \App\Models\DocumentVersion::create([
            'document_id' => $doc->id,
            'version_number' => 1,
            'original_filename' => 'Red_Notice_Control_A1234.pdf',
            'storage_disk' => 'secure_docs',
            'file_path' => 'operation_1/2026/08/sample_red_notice.pdf',
            'file_size_bytes' => 1048576,
            'mime_type' => 'application/pdf',
            'checksum_sha256' => hash('sha256', 'SAMPLE_PDF_CONTENT_INTERPOL_RED_NOTICE'),
            'change_description' => 'Initial ingestion of official Red Notice document',
            'uploaded_by' => $officer->id,
        ]);

        // Seed Initial Audit Log with Hash Chain
        \App\Services\AuditTrailService::log(
            module: 'OPERATION',
            actionType: 'CREATE',
            entityName: 'Operation',
            entityId: $operation->id,
            afterState: ['operation_number' => $operation->operation_number, 'name' => $operation->name]
        );

        \App\Services\AuditTrailService::log(
            module: 'DOCUMENT',
            actionType: 'CREATE',
            entityName: 'Document',
            entityId: $doc->id,
            afterState: ['document_number' => $doc->document_number, 'classification' => $doc->classification_level]
        );
    }
}
