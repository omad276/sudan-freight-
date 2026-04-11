import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Skip Supabase operations if env vars not configured
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user profile to check role
  let userRole: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    userRole = profile?.role || null;
  }

  const pathname = request.nextUrl.pathname;

  // Protected routes by role
  const shipperPaths = ['/shipper'];
  const carrierPaths = ['/carrier'];
  const adminPaths = ['/admin'];
  const authPaths = ['/login', '/register'];

  const isShipperPath = shipperPaths.some((path) => pathname.startsWith(path));
  const isCarrierPath = carrierPaths.some((path) => pathname.startsWith(path));
  const isAdminPath = adminPaths.some((path) => pathname.startsWith(path));
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));
  const isProtectedPath = isShipperPath || isCarrierPath || isAdminPath;

  // Redirect to login if not authenticated and trying to access protected route
  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Role-based access control
  if (user && userRole) {
    // Redirect if accessing wrong role's pages
    if (isShipperPath && userRole !== 'shipper' && userRole !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = userRole === 'carrier' ? '/carrier/dashboard' : '/';
      return NextResponse.redirect(url);
    }

    if (isCarrierPath && userRole !== 'carrier' && userRole !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = userRole === 'shipper' ? '/shipper/dashboard' : '/';
      return NextResponse.redirect(url);
    }

    if (isAdminPath && userRole !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = userRole === 'shipper' ? '/shipper/dashboard' : '/carrier/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // Redirect logged-in users away from auth pages to their dashboard
  if (isAuthPath && user && userRole) {
    const url = request.nextUrl.clone();
    if (userRole === 'admin') {
      url.pathname = '/admin/dashboard';
    } else if (userRole === 'shipper') {
      url.pathname = '/shipper/dashboard';
    } else if (userRole === 'carrier') {
      url.pathname = '/carrier/dashboard';
    } else {
      url.pathname = '/';
    }
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
