import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Force www only in production; allow localhost during development
  if (process.env.NODE_ENV === 'production') {
    const host = request.headers.get('host') || '';
    if (host && !host.startsWith('www.kflegacyresources.com')) {
      const url = request.nextUrl.clone();
      url.hostname = 'www.kflegacyresources.com';
      url.port = '';
      return NextResponse.redirect(url, 308);
    }
  }
  if (request.nextUrl.pathname === "/contact") {
    const url = request.nextUrl.clone();
    url.pathname = "/request-quotation";
    return NextResponse.redirect(url);
  }
  const res = NextResponse.next();

  // Relaxed CSP to keep site functional while still blocking risky sources
  // - Allow Google Fonts and inline styles (Bootstrap/Swiper)
  // - Allow inline scripts (Next.js/dev overlay) and unsafe-eval for dev tooling
  // - Keep images to self/https (no blob:/data:)
  const isProd = process.env.NODE_ENV === 'production';
  const scriptPolicies = ["'self'", "'unsafe-inline'"].concat(isProd ? [] : ["'unsafe-eval'"]).join(' ');
  const csp = [
    "default-src 'self'",
    `script-src ${scriptPolicies}`,
    `script-src-elem ${scriptPolicies}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' https:",
    "connect-src 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
  ].join('; ');
  res.headers.set('Content-Security-Policy', csp);
  // Disable common download helpers
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'accelerometer=(), camera=(), microphone=()');

  return res;
}

export const config = {
  matcher: ["/contact", "/(.*)"],
};


