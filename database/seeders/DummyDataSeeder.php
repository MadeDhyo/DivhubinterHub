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
            'name' => 'Super Admin',
            'email' => 'admin@ocms.local',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        $pimpinan = \App\Models\User::factory()->create([
            'name' => 'Kasubbag Pimpinan',
            'email' => 'pimpinan@ocms.local',
            'password' => bcrypt('password'),
            'role' => 'pimpinan',
        ]);

        $staf = \App\Models\User::factory()->create([
            'name' => 'Staff Anggota',
            'email' => 'staf@ocms.local',
            'password' => bcrypt('password'),
            'role' => 'staf',
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
            'name' => 'Operation Alpha',
            'status' => 'Verification',
            'priority' => 'High',
            'pic_id' => $pimpinan->id,
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
                'pic_id' => $staf->id,
                'reviewer_id' => $pimpinan->id,
            ]);
        }
    }
}
