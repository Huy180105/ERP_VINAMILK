<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireFinanceRole
{
    /** Require an explicit finance role for state-changing endpoints. */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $role = $request->header('X-User-Role');
        if ($role === null || !in_array($role, $roles, true)) {
            return response()->json([
                'success' => false,
                'message' => 'Từ chối quyền: vai trò tài chính không được phép thực hiện thao tác này.',
            ], 403);
        }

        return $next($request);
    }
}
