# Authentication & Subscription System Documentation

## Overview
This system implements a subscription-based access model for the Medical Study Atlas. Users create an account and redeem a pre-generated unique access code to gain 30 days of access to protected resources.

## Technical Stack
- **Framework**: Next.js (App Router)
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Deployment**: Vercel

## Core Components

### 1. Database Schema
- **`profiles` table**:
  - `id`: UUID (references `auth.users`)
  - `access_until`: Timestamp (indicates when the user's current subscription expires)
- **`access_codes` table**:
  - `code`: String (Unique 12-character code)
  - `is_used`: Boolean (Default: `false`)
  - `used_by`: UUID (References `profiles.id`)
  - `used_at`: Timestamp

### 2. Access Control Flow
The system uses a multi-layered approach to protect content:

1.  **Middleware (`middleware.ts`)**:
    - Intercepts requests to protected routes.
    - Validates the Supabase session.
    - Checks the `profiles` table to ensure `access_until` is in the future.
    - Redirects unauthorized or expired users to the `/login` or `/redeem` page.

2.  **Redemption API (`app/api/redeem/route.ts`)**:
    - Validates the provided access code.
    - Marks the code as used to prevent reuse.
    - Extends the user's `access_until` timestamp by 30 days.
    - Uses the `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS for administrative updates.

### 3. User Interface
- **Signup Page (`app/signup/page.tsx`)**: Combined account creation and initial code redemption.
- **Login Page (`app/login/page.tsx`)**: Standard email/password authentication.
- **Redeem Page (`app/redeem/page.tsx`)**: Allows existing users to extend their access using a new code.

## Setup & Environment Variables
The following variables are required in the Vercel environment:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key.
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (keep secret!).

## Maintenance
To generate new access codes, insert them into the `access_codes` table via the Supabase dashboard or a custom admin script.
