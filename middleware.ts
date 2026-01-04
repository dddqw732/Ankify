import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()

    try {
        // Create a Supabase client configured to use cookies
        const supabase = createMiddlewareClient({ req, res })

        // Refresh session if expired - required for Server Components
        await supabase.auth.getSession()
    } catch (e) {
        // In case of Supabase connection error (e.g. missing env vars), 
        // we suppress the crash so the app can still serve static pages or public routes.
        console.error("Middleware Auth Error:", e)
    }

    return res
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
