<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;

class SalesAccess
{
    public function handle(Request $request, Closure $next)
    {
        $user = auth('sanctum')->user();
        if (! $user) {
            // Shared ERP access without a login; never impersonate a real employee.
            $user = new User(['name' => 'Bán hàng']);
            $user->sales_role = 'manager';
            $request->setUserResolver(fn () => $user);

            return $next($request);
        }
        $request->setUserResolver(fn () => $user);
        abort_unless(in_array($request->user()?->sales_role, ['manager', 'staff'], true), 403, 'Bạn chưa được phân quyền Bán hàng.');
        abort_unless($request->user()->maNhanVien, 403, 'Tài khoản chưa liên kết nhân viên.');

        return $next($request);
    }
}
