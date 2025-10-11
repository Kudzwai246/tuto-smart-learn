# Tuto Security Guide

## Critical Security Configurations

### Phase 1 Implementation Status

#### ✅ 1.1 Authentication Session Management - COMPLETED
- Fixed `onAuthStateChange` callback to prevent deadlocks
- Implemented proper session state management
- Added error handling for token refresh failures
- Using `setTimeout(0)` to defer async profile fetching

#### ✅ 1.2 Secure Admin Access - COMPLETED
- Created `user_roles` table with proper enum types
- Implemented `has_role()` security definer function
- Updated `is_admin()` to use role-based checking (no more hardcoded emails!)
- Added RLS policies for role management
- Auto-assign roles via triggers on profile creation/update
- Admin dashboard now verifies roles server-side

#### ⚠️ 1.3 OTP Security - MANUAL ACTION REQUIRED
**Status**: Requires manual configuration in Supabase Dashboard

**Current Issue**: OTP expiry exceeds recommended threshold (likely 24 hours)

**How to Fix**:
1. Go to: https://supabase.com/dashboard/project/nelioyzsdyxufjlorzcm/auth/providers
2. Navigate to **Authentication** → **Providers** → **Email**
3. Find **"OTP Expiry"** setting
4. Set to **900 seconds (15 minutes)**
5. Click **Save**

**Why This Matters**: Long OTP expiry windows increase the risk of stolen codes being used.

**Documentation**: https://supabase.com/docs/guides/platform/going-into-prod#security

#### ⚠️ 1.4 Password Protection - MANUAL ACTION REQUIRED
**Status**: Requires manual configuration in Supabase Dashboard

**Current Issue**: Leaked password protection is disabled

**How to Fix**:
1. Go to: https://supabase.com/dashboard/project/nelioyzsdyxufjlorzcm/auth/providers
2. Navigate to **Authentication** → **Providers** → **Email**
3. Find **"Password Requirements"** section
4. Enable **"Check for leaked passwords"**
5. Click **Save**

**Why This Matters**: This prevents users from using passwords that have been exposed in data breaches.

**Documentation**: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

#### ⚠️ Postgres Version Update - MANUAL ACTION RECOMMENDED
**Status**: Optional but recommended

**Current Issue**: Current Postgres version has security patches available

**How to Fix**:
1. Go to: https://supabase.com/dashboard/project/nelioyzsdyxufjlorzcm/settings/infrastructure
2. Navigate to **Settings** → **Infrastructure**
3. Check for available Postgres upgrades
4. Schedule upgrade during low-traffic period
5. Test thoroughly after upgrade

**Documentation**: https://supabase.com/docs/guides/platform/upgrading

---

## Security Best Practices

### Authentication
- ✅ Never use hardcoded emails/passwords for admin checks
- ✅ Always validate roles server-side using `has_role()` function
- ✅ Use `setTimeout(0)` when calling Supabase functions inside `onAuthStateChange`
- ✅ Store complete session object, not just user
- ✅ Set `emailRedirectTo` in all sign-up flows
- ✅ Use `maybeSingle()` instead of `single()` when row might not exist

### Row-Level Security (RLS)
- ✅ All tables have RLS enabled
- ✅ Using security definer functions to prevent recursive RLS issues
- ✅ Policies check `has_role()` instead of profile columns
- ✅ User-specific data requires `auth.uid()` match
- ✅ Admin operations verify admin role via `is_admin()`

### User Roles System
- ✅ Roles stored in separate `user_roles` table (not in profiles)
- ✅ Using PostgreSQL enum for type safety
- ✅ Auto-assignment via triggers on profile changes
- ✅ Unique constraint prevents duplicate role assignments
- ✅ Cascade delete when users are removed

### Storage Security
- ✅ Buckets have proper RLS policies
- ✅ Private buckets (`teacher-docs`, `library-videos`, `library-notes`) require authentication
- ✅ Public bucket (`avatars`) has controlled upload access
- ✅ File paths include user IDs to prevent access to other users' files

### Input Validation
- ⚠️ TODO: Add Zod validation for all form inputs
- ⚠️ TODO: Sanitize user-generated content before display
- ⚠️ TODO: Validate file uploads (type, size, content)

---

## Pending Security Enhancements

### High Priority
1. **Input Validation**: Add Zod schemas for all forms
2. **Rate Limiting**: Implement on auth endpoints
3. **Content Moderation**: Add admin approval for library uploads
4. **Audit Logging**: Track admin actions and data changes

### Medium Priority
5. **Two-Factor Authentication**: Add optional 2FA for admins
6. **Session Timeout**: Implement automatic logout after inactivity
7. **CSRF Protection**: Add tokens to sensitive operations
8. **API Key Rotation**: Implement key rotation strategy

### Low Priority
9. **Encrypted Storage**: Encrypt sensitive documents at rest
10. **Penetration Testing**: Schedule regular security audits
11. **Security Headers**: Configure CSP, HSTS, etc.
12. **DDoS Protection**: Configure rate limiting at CDN level

---

## Security Incident Response

### If Admin Account is Compromised
1. Immediately revoke all sessions via Supabase Dashboard
2. Remove compromised user from `user_roles` table
3. Review audit logs for unauthorized actions
4. Reset password for affected account
5. Notify all admins of the breach
6. Review and update security policies

### If User Data is Exposed
1. Identify scope of exposure
2. Revoke affected sessions
3. Notify affected users immediately
4. Review RLS policies for gaps
5. Document incident and remediation
6. Report to relevant authorities if required

---

## Admin Security Checklist

Before granting admin access to a new user:
- [ ] Verify identity through official channels
- [ ] Check that user has completed security training
- [ ] Enable 2FA on their account (when implemented)
- [ ] Add role via SQL: `INSERT INTO user_roles (user_id, role) VALUES ('<uuid>', 'admin')`
- [ ] Test that they can access admin dashboard
- [ ] Document the grant in admin logs
- [ ] Set up monitoring alerts for their actions

---

## Contact Information

**Security Concerns**: Report to founders immediately
- CEO: luckilyimat@gmail.com
- COO: chiwandiretakunda75@gmail.com

**Emergency Response**: Contact Supabase Support
- Dashboard: https://supabase.com/dashboard/project/nelioyzsdyxufjlorzcm

---

*Last Updated: 2025-10-11*
*Document Version: 1.0*
*Reviewed By: System (Automated)*
