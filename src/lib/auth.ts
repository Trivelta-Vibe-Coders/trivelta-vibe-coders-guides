export const EMAIL_DOMAIN = '@trivelta.com';

export function authDisabled(): boolean {
  return import.meta.env.PUBLIC_AUTH_DISABLED === 'true';
}

export function supabaseConfigured(): boolean {
  return Boolean(
    import.meta.env.PUBLIC_SUPABASE_URL &&
      import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function authEnabled(): boolean {
  return !authDisabled() && supabaseConfigured();
}

export function isTriveltaEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith(EMAIL_DOMAIN);
}

export function safeRedirectTo(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/';
  return value;
}

export const MAGIC_LINK_SENT =
  'If that email is approved for access, a sign-in link is on its way.';
