<?php

namespace App\Http\Controllers\Warehouse;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class SalesAuthController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate(['email' => 'required|email', 'password' => 'required|string']);
        $user = User::where('email', $data['email'])->first();
        if (! $user || ! Hash::check($data['password'], $user->password) || ! in_array($user->sales_role, ['manager', 'staff']) || ! $user->maNhanVien) {
            throw ValidationException::withMessages(['email' => 'Thông tin đăng nhập hoặc quyền Bán hàng không hợp lệ.']);
        }

        return response()->json(['data' => ['token' => $user->createToken('sales', ['sales'], now()->addHours(8))->plainTextToken, 'user' => $user]]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['success' => true]);
    }
}
