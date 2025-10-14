# Next.js Migration Guide

This project has been successfully migrated from Vite + React Router to Next.js 15 with App Router.

## Changes Made

### 1. Project Structure
- **New App Directory**: Created `app/` directory with Next.js App Router structure
- **Removed Files**:
  - `index.html` (Next.js generates this)
  - `vite.config.mts` (replaced with `next.config.js`)
  - `src/main.tsx` (no longer needed)
  - `src/App.tsx` (routing now handled by App Router)
  - `src/App.css` (consolidated into global styles)
  - `tsconfig.app.json` and `tsconfig.node.json` (consolidated into main `tsconfig.json`)

### 2. Routing Structure

#### Old Structure (React Router)
```
src/App.tsx → Router configuration
```

#### New Structure (Next.js App Router)
```
app/
├── layout.tsx              # Root layout with providers
├── providers.tsx           # Client-side providers wrapper
├── page.tsx                # Home page (/)
├── courses/
│   └── page.tsx            # Courses page (/courses)
├── login/
│   └── page.tsx            # Login page (/login)
└── dashboard/
    ├── layout.tsx          # Dashboard layout with auth protection
    ├── page.tsx            # Dashboard home (/dashboard)
    ├── trial-requests/
    │   └── page.tsx        # Trial requests (/dashboard/trial-requests)
    └── contact-messages/
        └── page.tsx        # Contact messages (/dashboard/contact-messages)
```

### 3. Component Updates

All components have been updated for Next.js compatibility:

#### React Router → Next.js Navigation
- `Link` component: `to` prop → `href` prop
- `NavLink` → `Link` with `usePathname()` for active state
- `useNavigate()` → `useRouter()` from `next/navigation`
- `navigate('/path')` → `router.push('/path')`
- `useLocation()` → `usePathname()`
- `<Outlet />` → `{children}` prop

#### Client Components
Added `"use client"` directive to all components using:
- React hooks (`useState`, `useEffect`, etc.)
- Event handlers (`onClick`, `onChange`, etc.)
- Context consumers
- Browser APIs

### 4. Configuration Files

#### package.json
- Added `next` dependency
- Updated scripts: `dev`, `build`, `start`, `lint`
- Removed Vite and React Router dependencies
- Updated Tailwind CSS to v3.4.0 (from v4)

#### tsconfig.json
- Updated for Next.js App Router
- Added Next.js TypeScript plugin
- Configured path aliases (`@/*`)

#### New Files
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `app/providers.tsx` - Client-side providers wrapper

### 5. Authentication & Protected Routes

#### Old Approach
```tsx
<ProtectedRoute>
  <DashboardLayout />
</ProtectedRoute>
```

#### New Approach
```tsx
// app/dashboard/layout.tsx
export default function DashboardLayoutWrapper({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // ... rest of the component
}
```

## Getting Started

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Build for Production
```bash
npm run build
npm start
```

## Key Next.js Features to Leverage

### 1. Server Components (Default)
Most components can remain as Server Components for better performance. Only add `"use client"` when needed.

### 2. API Routes
Consider moving API logic to Next.js API routes:
```
app/api/
├── auth/
├── trial-requests/
└── contact-messages/
```

### 3. Metadata & SEO
Each page can export metadata:
```tsx
export const metadata: Metadata = {
  title: "Page Title",
  description: "Page description",
};
```

### 4. Image Optimization
Use Next.js `Image` component for automatic optimization:
```tsx
import Image from 'next/image';
```

### 5. Middleware (Optional)
Add `middleware.ts` for route protection:
```tsx
// middleware.ts
export function middleware(request: NextRequest) {
  // Check authentication
  // Redirect if needed
}

export const config = {
  matcher: '/dashboard/:path*',
}
```

## Remaining Source Structure

The `src/` directory has been preserved with all existing components, pages, contexts, and utilities:

```
src/
├── api/                    # API utility functions
├── components/             # All components (updated for Next.js)
├── contexts/               # Context providers (with "use client")
├── hooks/                  # Custom hooks
├── pages/                  # Page components (used by app/ routes)
├── styles/                 # Global styles
└── index.css              # Global CSS imports
```

## Notes

- All interactive components now have `"use client"` directive
- Navigation links updated from React Router to Next.js
- Auth protection moved from route wrapper to layout component
- Trial request dialog integrated into root providers
- All components maintain their original functionality

## Next Steps

1. Test all routes and functionality
2. Consider implementing Next.js middleware for auth
3. Optimize images with Next.js Image component
4. Add metadata to each page for better SEO
5. Consider moving API logic to Next.js API routes
6. Set up environment variables for API endpoints
