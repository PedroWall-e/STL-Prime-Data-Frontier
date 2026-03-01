import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import { createServerClient } from '@supabase/ssr';

// Routes that require a logged-in session
const PROTECTED_ROUTES = ['/dashboard', '/upload', '/my-collections', '/profile'];

// Routes that require admin role (checked via DB)
const ADMIN_ROUTES = ['/admin'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // First, refresh the session (standard Supabase SSR step)
    const sessionResponse = await updateSession(request);

    // Check if the path is protected
    const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
    const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));

    if (isProtected || isAdminRoute) {
        // Build a lightweight server Supabase client from cookies
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name) { return request.cookies.get(name)?.value; },
                    set() { },
                    remove() { },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            const loginUrl = request.nextUrl.clone();
            loginUrl.pathname = '/auth/login';
            loginUrl.searchParams.set('next', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Extra check for admin routes
        if (isAdminRoute) {
            const { data: profile } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile?.role !== 'admin') {
                const homeUrl = request.nextUrl.clone();
                homeUrl.pathname = '/';
                return NextResponse.redirect(homeUrl);
            }
        }
    }

    return sessionResponse;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};

