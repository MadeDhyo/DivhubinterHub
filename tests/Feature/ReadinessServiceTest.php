<?php

namespace Tests\Feature;

use App\Models\ChecklistTemplate;
use App\Models\ChecklistTemplateItem;
use App\Models\Operation;
use App\Models\OperationChecklist;
use App\Models\OperationChecklistItem;
use App\Models\User;
use App\Services\ReadinessService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReadinessServiceTest extends TestCase
{
    use RefreshDatabase;

    private ReadinessService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ReadinessService();
    }

    /**
     * Membuat relasi dasar pengguna, operasi, dan template checklist untuk testing.
     */
    private function createBaseOperation(): array
    {
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        $operation = Operation::create([
            'operation_number' => 'OP-TEST-001',
            'name' => 'Test Operation',
            'status' => 'Planning',
            'priority' => 'Medium',
            'pic_id' => $user->id,
        ]);

        $template = ChecklistTemplate::create([
            'name' => 'Test Template',
            'category' => 'General',
        ]);

        $opChecklist = OperationChecklist::create([
            'operation_id' => $operation->id,
            'checklist_template_id' => $template->id,
        ]);

        return [$operation, $template, $opChecklist];
    }

    /**
     * Test 1 — Semua mandatory completed
     */
    public function test_all_mandatory_completed()
    {
        [$operation, $template, $opChecklist] = $this->createBaseOperation();

        // 10 mandatory items, 10 Completed
        for ($i = 1; $i <= 10; $i++) {
            $templateItem = ChecklistTemplateItem::create([
                'checklist_template_id' => $template->id,
                'name' => "Mandatory Item $i",
                'is_mandatory' => true,
            ]);

            OperationChecklistItem::create([
                'operation_checklist_id' => $opChecklist->id,
                'checklist_template_item_id' => $templateItem->id,
                'status' => 'Completed',
            ]);
        }

        $result = $this->service->calculate($operation);

        $this->assertEquals(100, $result['score']);
        $this->assertEquals(10, $result['total_mandatory']);
        $this->assertEquals(10, $result['completed_mandatory']);
        $this->assertEquals('READY', $result['status']);
        $this->assertTrue($result['has_mandatory_items']);
    }

    /**
     * Test 2 — Sebagian mandatory completed
     */
    public function test_partial_mandatory_completed()
    {
        [$operation, $template, $opChecklist] = $this->createBaseOperation();

        // 10 mandatory items: 7 Completed, 3 Not Started
        for ($i = 1; $i <= 10; $i++) {
            $templateItem = ChecklistTemplateItem::create([
                'checklist_template_id' => $template->id,
                'name' => "Mandatory Item $i",
                'is_mandatory' => true,
            ]);

            OperationChecklistItem::create([
                'operation_checklist_id' => $opChecklist->id,
                'checklist_template_item_id' => $templateItem->id,
                'status' => $i <= 7 ? 'Completed' : 'Not Started',
            ]);
        }

        $result = $this->service->calculate($operation);

        $this->assertEquals(70, $result['score']);
        $this->assertEquals(10, $result['total_mandatory']);
        $this->assertEquals(7, $result['completed_mandatory']);
        $this->assertEquals('PARTIALLY_READY', $result['status']);
        $this->assertTrue($result['has_mandatory_items']);
    }

    /**
     * Test 3 — Tidak ada mandatory yang completed
     */
    public function test_no_mandatory_completed()
    {
        [$operation, $template, $opChecklist] = $this->createBaseOperation();

        // 10 mandatory items, 0 Completed
        for ($i = 1; $i <= 10; $i++) {
            $templateItem = ChecklistTemplateItem::create([
                'checklist_template_id' => $template->id,
                'name' => "Mandatory Item $i",
                'is_mandatory' => true,
            ]);

            OperationChecklistItem::create([
                'operation_checklist_id' => $opChecklist->id,
                'checklist_template_item_id' => $templateItem->id,
                'status' => 'In Progress',
            ]);
        }

        $result = $this->service->calculate($operation);

        $this->assertEquals(0, $result['score']);
        $this->assertEquals(10, $result['total_mandatory']);
        $this->assertEquals(0, $result['completed_mandatory']);
        $this->assertEquals('NOT_READY', $result['status']);
        $this->assertTrue($result['has_mandatory_items']);
    }

    /**
     * Test 4 — Tidak ada mandatory item
     */
    public function test_no_mandatory_items()
    {
        [$operation, $template, $opChecklist] = $this->createBaseOperation();

        // Tanpa ada checklist wajib (kosong)
        // Penanganan sementara: score = 100 dan status = READY
        // Catatan: Asumsi kelayakan bisnis ini masih perlu divalidasi dengan tim analis/pimpinan.
        $result = $this->service->calculate($operation);

        $this->assertEquals(100, $result['score']);
        $this->assertEquals(0, $result['total_mandatory']);
        $this->assertEquals(0, $result['completed_mandatory']);
        $this->assertEquals('READY', $result['status']);
        $this->assertFalse($result['has_mandatory_items']);
    }

    /**
     * Test 5 — Non-mandatory tidak dihitung
     */
    public function test_non_mandatory_ignored()
    {
        [$operation, $template, $opChecklist] = $this->createBaseOperation();

        // 5 mandatory items (belum Completed)
        for ($i = 1; $i <= 5; $i++) {
            $templateItem = ChecklistTemplateItem::create([
                'checklist_template_id' => $template->id,
                'name' => "Mandatory Item $i",
                'is_mandatory' => true,
            ]);

            OperationChecklistItem::create([
                'operation_checklist_id' => $opChecklist->id,
                'checklist_template_item_id' => $templateItem->id,
                'status' => 'Not Started',
            ]);
        }

        // 5 non-mandatory items (seluruhnya Completed)
        for ($j = 1; $j <= 5; $j++) {
            $templateItem = ChecklistTemplateItem::create([
                'checklist_template_id' => $template->id,
                'name' => "Non-Mandatory Item $j",
                'is_mandatory' => false,
            ]);

            OperationChecklistItem::create([
                'operation_checklist_id' => $opChecklist->id,
                'checklist_template_item_id' => $templateItem->id,
                'status' => 'Completed',
            ]);
        }

        $result = $this->service->calculate($operation);

        $this->assertEquals(0, $result['score']);
        $this->assertEquals(5, $result['total_mandatory']);
        $this->assertEquals(0, $result['completed_mandatory']);
        $this->assertEquals('NOT_READY', $result['status']);
    }

    /**
     * Test 6 — Status selain Completed tidak dihitung
     */
    public function test_other_statuses_not_counted_as_completed()
    {
        [$operation, $template, $opChecklist] = $this->createBaseOperation();

        // Status yang bukan Completed
        $statuses = ['Not Started', 'In Progress', 'Submitted', 'Rejected'];

        foreach ($statuses as $index => $status) {
            $templateItem = ChecklistTemplateItem::create([
                'checklist_template_id' => $template->id,
                'name' => "Mandatory Item " . ($index + 1),
                'is_mandatory' => true,
            ]);

            OperationChecklistItem::create([
                'operation_checklist_id' => $opChecklist->id,
                'checklist_template_item_id' => $templateItem->id,
                'status' => $status,
            ]);
        }

        $result = $this->service->calculate($operation);

        $this->assertEquals(0, $result['score']);
        $this->assertEquals(count($statuses), $result['total_mandatory']);
        $this->assertEquals(0, $result['completed_mandatory']);
        $this->assertEquals('NOT_READY', $result['status']);
    }

    /**
     * Test 7 — Mandatory overdue terdeteksi
     */
    public function test_mandatory_overdue_detected()
    {
        [$operation, $template, $opChecklist] = $this->createBaseOperation();

        // Buat 1 item wajib yang overdue (melewati batas waktu)
        $templateItem = ChecklistTemplateItem::create([
            'checklist_template_id' => $template->id,
            'name' => "Overdue Mandatory Item",
            'is_mandatory' => true,
        ]);

        OperationChecklistItem::create([
            'operation_checklist_id' => $opChecklist->id,
            'checklist_template_item_id' => $templateItem->id,
            'status' => 'In Progress',
            'deadline' => now()->subDays(2), // 2 hari yang lalu
        ]);

        $result = $this->service->calculate($operation);

        $this->assertTrue($result['has_overdue']);
        $this->assertCount(1, $result['overdue_items']);
        $this->assertEquals('Overdue Mandatory Item', $result['overdue_items'][0]['name']);
    }

    /**
     * Test 8 — Critical/blocking requirement yang belum selesai mencegah READY
     */
    public function test_critical_blocker_prevents_ready_status()
    {
        [$operation, $template, $opChecklist] = $this->createBaseOperation();

        // Buat item wajib yang mendefinisikan keyword critical ('Cek Status Red Notice')
        $templateItem = ChecklistTemplateItem::create([
            'checklist_template_id' => $template->id,
            'name' => "Cek Status Red Notice",
            'is_mandatory' => true,
        ]);

        OperationChecklistItem::create([
            'operation_checklist_id' => $opChecklist->id,
            'checklist_template_item_id' => $templateItem->id,
            'status' => 'In Progress', // belum selesai
        ]);

        $result = $this->service->calculate($operation);

        // Mencegah status menjadi READY
        $this->assertNotEquals('READY', $result['status']);
        $this->assertTrue($result['has_uncompleted_critical_blockers']);
        $this->assertCount(1, $result['uncompleted_critical_blockers']);
        $this->assertEquals('Cek Status Red Notice', $result['uncompleted_critical_blockers'][0]['name']);
    }
}
