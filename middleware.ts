import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession()

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Protect admin and developer routes — single tier lookup shared by both checks
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin')
  const isDeveloperPath = request.nextUrl.pathname.startsWith('/developer')
  const isDevToolPath =
    request.nextUrl.pathname.startsWith('/benchmarks') ||
    request.nextUrl.pathname.startsWith('/experiments') ||
    request.nextUrl.pathname.startsWith('/tuning') ||
    request.nextUrl.pathname.startsWith('/agents')

  if (isAdminPath || isDeveloperPath || isDevToolPath) {
    if (!session) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    const { data: user, error: tierQueryError } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', session.user.id)
      .single()

    if (tierQueryError) {
      console.error('[middleware] tier lookup failed:', tierQueryError.message)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    const tier = user?.subscription_tier

    if (isAdminPath && tier !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if ((isDeveloperPath || isDevToolPath) && tier !== 'admin' && tier !== 'developer') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Redirect authenticated users away from login page
  if (request.nextUrl.pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/developer/:path*',
    '/benchmarks/:path*',
    '/experiments/:path*',
    '/tuning/:path*',
    '/agents/:path*',
    '/login',
  ],
}
