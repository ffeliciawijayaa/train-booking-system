<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth; 

class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        //cek apakah pengguna sudah login
        //cek apakah role  nya adalah admin
        if (Auth::check() && Auth::user()->role === 'admin') {
            return $next($request); 
        }

        abort(403, 'Anda tidak memiliki akses ke halaman ini.');
    }  
}
