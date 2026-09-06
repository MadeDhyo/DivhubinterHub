<?php

namespace App\Http\Controllers;

use App\Models\DpoPerson;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DpoPersonController extends Controller
{
    /**
     * Tampilkan halaman Daftar Pencarian Orang (DPO).
     * Semua user yang terautentikasi bisa mengakses.
     */
    public function index()
    {
        $dpoPersons = DpoPerson::with(['createdBy', 'operations'])
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('DpoList/Index', [
            'dpoPersons' => $dpoPersons,
            'canManage'  => Gate::allows('admin-access'),
        ]);
    }

    /**
     * Simpan data DPO baru (admin only).
     */
    public function store(Request $request)
    {
        Gate::authorize('admin-access');

        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'alias'           => 'nullable|string|max:255',
            'date_of_birth'   => 'nullable|date',
            'nationality'     => 'nullable|string|max:100',
            'passport_number' => 'nullable|string|max:100',
            'red_notice_ref'  => 'nullable|string|max:100',
            'case_info'       => 'nullable|string|max:2000',
            'crime_type'      => 'nullable|string|max:255',
            'photo'           => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'status'          => 'required|in:Active,Captured,Deceased,Withdrawn',
        ]);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('dpo_photos', 'public');
        }

        $dpo = DpoPerson::create([
            'name'            => $validated['name'],
            'alias'           => $validated['alias'] ?? null,
            'date_of_birth'   => $validated['date_of_birth'] ?? null,
            'nationality'     => $validated['nationality'] ?? null,
            'passport_number' => $validated['passport_number'] ?? null,
            'red_notice_ref'  => $validated['red_notice_ref'] ?? null,
            'case_info'       => $validated['case_info'] ?? null,
            'crime_type'      => $validated['crime_type'] ?? null,
            'photo_path'      => $photoPath,
            'status'          => $validated['status'],
            'created_by'      => auth()->id(),
        ]);

        ActivityLog::record(
            'DPO_CREATED',
            "Menambahkan data DPO baru: {$dpo->name}",
            null,
            ['id' => $dpo->id, 'name' => $dpo->name, 'status' => $dpo->status]
        );

        return redirect()->back()->with('success', 'Data DPO berhasil ditambahkan.');
    }

    /**
     * Update data DPO (admin only).
     */
    public function update(Request $request, $id)
    {
        Gate::authorize('admin-access');

        $dpo = DpoPerson::findOrFail($id);

        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'alias'           => 'nullable|string|max:255',
            'date_of_birth'   => 'nullable|date',
            'nationality'     => 'nullable|string|max:100',
            'passport_number' => 'nullable|string|max:100',
            'red_notice_ref'  => 'nullable|string|max:100',
            'case_info'       => 'nullable|string|max:2000',
            'crime_type'      => 'nullable|string|max:255',
            'photo'           => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'status'          => 'required|in:Active,Captured,Deceased,Withdrawn',
        ]);

        $oldData = $dpo->only(['name', 'alias', 'nationality', 'status']);

        if ($request->hasFile('photo')) {
            // Hapus foto lama jika ada
            if ($dpo->photo_path) {
                Storage::disk('public')->delete($dpo->photo_path);
            }
            $validated['photo_path'] = $request->file('photo')->store('dpo_photos', 'public');
        }

        $dpo->update([
            'name'            => $validated['name'],
            'alias'           => $validated['alias'] ?? null,
            'date_of_birth'   => $validated['date_of_birth'] ?? null,
            'nationality'     => $validated['nationality'] ?? null,
            'passport_number' => $validated['passport_number'] ?? null,
            'red_notice_ref'  => $validated['red_notice_ref'] ?? null,
            'case_info'       => $validated['case_info'] ?? null,
            'crime_type'      => $validated['crime_type'] ?? null,
            'photo_path'      => $validated['photo_path'] ?? $dpo->photo_path,
            'status'          => $validated['status'],
        ]);

        ActivityLog::record(
            'DPO_UPDATED',
            "Memperbarui data DPO: {$dpo->name}",
            $oldData,
            $dpo->only(['name', 'alias', 'nationality', 'status'])
        );

        return redirect()->back()->with('success', 'Data DPO berhasil diperbarui.');
    }

    /**
     * Hapus data DPO (admin only).
     */
    public function destroy($id)
    {
        Gate::authorize('admin-access');

        $dpo = DpoPerson::findOrFail($id);
        $dpoName = $dpo->name;

        // Hapus foto jika ada
        if ($dpo->photo_path) {
            Storage::disk('public')->delete($dpo->photo_path);
        }

        $dpo->delete();

        ActivityLog::record(
            'DPO_DELETED',
            "Menghapus data DPO: {$dpoName}"
        );

        return redirect()->back()->with('success', 'Data DPO berhasil dihapus.');
    }
}
