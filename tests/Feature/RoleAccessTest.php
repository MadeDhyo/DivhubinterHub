<?php

namespace Tests\Feature;

use App\Models\ChecklistTemplate;
use App\Models\ChecklistTemplateItem;
use App\Models\Operation;
use App\Models\OperationChecklist;
use App\Models\OperationChecklistItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $pic1;
    private User $pic2;
    private User $reviewer;
    private User $otherUser;

    private Operation $operation;
    private OperationChecklist $opChecklist;
    private ChecklistTemplateItem $templateItem;
    private OperationChecklistItem $checklistItem;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Setup Users
        $this->admin = User::create([
            'name' => 'Pimpinan Hubinter',
            'email' => 'admin@ocms.local',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        $this->pic1 = User::create([
            'name' => 'PIC Satu',
            'email' => 'pic1@ocms.local',
            'password' => bcrypt('password'),
            'role' => 'staf',
        ]);

        $this->pic2 = User::create([
            'name' => 'PIC Dua',
            'email' => 'pic2@ocms.local',
            'password' => bcrypt('password'),
            'role' => 'staf',
        ]);

        $this->reviewer = User::create([
            'name' => 'Reviewer Satu',
            'email' => 'reviewer1@ocms.local',
            'password' => bcrypt('password'),
            'role' => 'pimpinan',
        ]);

        $this->otherUser = User::create([
            'name' => 'User Biasa',
            'email' => 'other@ocms.local',
            'password' => bcrypt('password'),
            'role' => 'staf',
        ]);

        // 2. Setup Operation and Checklists
        $this->operation = Operation::create([
            'operation_number' => 'OP-ROLE-001',
            'name' => 'Role Access Operation',
            'status' => 'Planning',
            'priority' => 'Medium',
            'pic_id' => $this->pic1->id,
        ]);

        $template = ChecklistTemplate::create([
            'name' => 'Role Template',
            'category' => 'Testing',
        ]);

        $this->opChecklist = OperationChecklist::create([
            'operation_id' => $this->operation->id,
            'checklist_template_id' => $template->id,
        ]);

        $this->templateItem = ChecklistTemplateItem::create([
            'checklist_template_id' => $template->id,
            'name' => 'Verify Identity Card',
            'is_mandatory' => true,
        ]);

        $this->checklistItem = OperationChecklistItem::create([
            'operation_checklist_id' => $this->opChecklist->id,
            'checklist_template_item_id' => $this->templateItem->id,
            'status' => 'Not Started',
            'pic_id' => $this->pic1->id,
            'reviewer_id' => $this->reviewer->id,
        ]);
    }

    /**
     * Test 1 — PIC dapat mengubah checklist miliknya.
     */
    public function test_pic_can_update_their_checklist_item()
    {
        $this->actingAs($this->pic1);

        $response = $this->post("/checklists/{$this->checklistItem->id}/status", [
            'status' => 'In Progress',
        ]);

        $response->assertRedirect();
        $this->assertEquals('In Progress', $this->checklistItem->refresh()->status);
    }

    /**
     * Test 2 — PIC tidak dapat mengubah checklist milik PIC lain.
     */
    public function test_pic_cannot_update_checklist_of_other_pic()
    {
        $this->actingAs($this->pic2);

        $response = $this->post("/checklists/{$this->checklistItem->id}/status", [
            'status' => 'In Progress',
        ]);

        $response->assertStatus(403);
        $this->assertEquals('Not Started', $this->checklistItem->refresh()->status);
    }

    /**
     * Test 3 — Reviewer dapat melakukan verification pada item yang ditugaskan kepadanya.
     */
    public function test_reviewer_can_verify_assigned_item()
    {
        $this->actingAs($this->reviewer);

        $response = $this->post("/checklists/{$this->checklistItem->id}/status", [
            'status' => 'Verified',
        ]);

        $response->assertRedirect();
        $this->assertEquals('Verified', $this->checklistItem->refresh()->status);
    }

    /**
     * Test 4 — PIC tidak dapat melakukan verification.
     */
    public function test_pic_cannot_verify_own_item()
    {
        $this->actingAs($this->pic1);

        $response = $this->post("/checklists/{$this->checklistItem->id}/status", [
            'status' => 'Verified',
        ]);

        $response->assertStatus(403);
        $this->assertEquals('Not Started', $this->checklistItem->refresh()->status);
    }

    /**
     * Test 5 — Pimpinan/Admin dapat melihat operation.
     */
    public function test_admin_can_view_operation()
    {
        $this->actingAs($this->admin);

        $response = $this->get("/operations/{$this->operation->id}");

        $response->assertOk();
    }

    /**
     * Test 6 — User yang tidak ditugaskan tidak dapat melihat operation.
     */
    public function test_unassigned_user_cannot_view_operation()
    {
        $this->actingAs($this->otherUser);

        $response = $this->get("/operations/{$this->operation->id}");

        $response->assertStatus(403);
    }

    /**
     * Test 7 — Pimpinan/Admin dapat approve readiness.
     */
    public function test_admin_allows_approve_readiness()
    {
        $this->assertTrue(Gate::forUser($this->admin)->allows('approve-readiness'));
    }

    /**
     * Test 8 — PIC tidak dapat approve readiness.
     */
    public function test_pic_disallows_approve_readiness()
    {
        $this->assertFalse(Gate::forUser($this->pic1)->allows('approve-readiness'));
    }

    /**
     * Test 9 — User biasa tidak dapat mengubah operation status.
     */
    public function test_normal_user_disallows_change_operation_status()
    {
        $this->assertFalse(Gate::forUser($this->otherUser)->allows('change-operation-status'));
        $this->assertFalse(Gate::forUser($this->pic1)->allows('change-operation-status'));
    }
}
