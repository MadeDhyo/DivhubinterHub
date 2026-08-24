<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ActivityLog;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Gate;

class UserController extends Controller
{
    public function index()
    {
        Gate::authorize('manage-users');

        $users = User::orderBy('created_at', 'desc')->get();
        return inertia('UserManagement/Index', [
            'users' => $users
        ]);
    }

    public function store(StoreUserRequest $request)
    {
        Gate::authorize('manage-users');

        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'password' => Hash::make($validated['password']),
        ]);

        ActivityLog::record(
            'USER_CREATED',
            "Membuat akun personel baru: {$user->name} ({$user->email}) dengan role '{$user->role}'",
            null,
            ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'role' => $user->role]
        );

        return redirect()->back()->with('success', 'Akun pengguna berhasil ditambahkan.');
    }

    public function update(UpdateUserRequest $request, $id)
    {
        Gate::authorize('manage-users');

        $user = User::findOrFail($id);
        $validated = $request->validated();

        $oldData = [
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ];

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->role = $validated['role'];

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        $newData = [
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ];

        ActivityLog::record(
            'USER_UPDATED',
            "Memperbarui data personel: {$user->name} ({$user->email})",
            $oldData,
            $newData
        );

        return redirect()->back()->with('success', 'Data pengguna berhasil diperbarui.');
    }

    public function resetPassword(Request $request, $id)
    {
        Gate::authorize('manage-users');

        $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ], [
            'password.required' => 'Password baru wajib diisi.',
            'password.min' => 'Password minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
        ]);

        $user = User::findOrFail($id);
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        ActivityLog::record(
            'USER_PASSWORD_RESET',
            "Mereset password untuk akun: {$user->name} ({$user->email})"
        );

        return redirect()->back()->with('success', 'Password pengguna berhasil direset.');
    }

    public function destroy($id)
    {
        Gate::authorize('manage-users');

        $user = User::findOrFail($id);

        if ($user->id === auth()->id()) {
            return redirect()->back()->withErrors([
                'error' => 'Anda dilarang menghapus akun Anda sendiri yang sedang aktif!'
            ]);
        }

        $userName = $user->name;
        $userEmail = $user->email;

        // Lepaskan relasi ke operasi & checklist item terlebih dahulu
        \App\Models\Operation::where('pic_id', $user->id)->update(['pic_id' => null]);
        \App\Models\OperationChecklistItem::where('pic_id', $user->id)->update(['pic_id' => null]);
        \App\Models\OperationChecklistItem::where('reviewer_id', $user->id)->update(['reviewer_id' => null]);

        $user->delete();

        ActivityLog::record(
            'USER_DELETED',
            "Menghapus akun pengguna secara permanen: {$userName} ({$userEmail})"
        );

        return redirect()->back()->with('success', 'Akun pengguna berhasil dihapus secara permanen.');
    }
}
