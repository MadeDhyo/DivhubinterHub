<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        $users = User::orderBy('created_at', 'desc')->get();
        return inertia('UserManagement/Index', [
            'users' => $users
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'role' => 'required|string|in:admin,pimpinan,staf',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'password' => Hash::make($validated['password']),
        ]);

        ActivityLog::record(
            'USER_CREATED',
            "Membuat akun baru: {$user->name} ({$user->email}) dengan role '{$user->role}'"
        );

        return redirect()->back()->with('success', 'Akun pengguna berhasil ditambahkan.');
    }

    public function destroy($id)
    {
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
