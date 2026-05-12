import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Dieser Pfad ist für die Datenbank (Rest-API)
        source: '/api/supabase/rest/v1/:path*',
        destination: 'https://byhjppuajtstbszbmvnw.supabase.co/rest/v1/:path*',
      },
      {
        // Dieser Pfad ist EXAKT für den Login/Register (Auth)
        source: '/api/supabase/auth/v1/:path*',
        destination: 'https://byhjppuajtstbszbmvnw.supabase.co/auth/v1/:path*',
      },
    ]
  },
};

export default nextConfig;