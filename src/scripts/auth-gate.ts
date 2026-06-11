import { authEnabled, isTriveltaEmail } from '../lib/auth';
import { getSupabase } from '../lib/supabase';

async function init() {
  if (!authEnabled()) return;

  const navAuth = document.querySelector<HTMLElement>('[data-nav-auth]');
  const navGuest = document.querySelector<HTMLElement>('[data-nav-guest]');
  const emailEl = document.querySelector<HTMLElement>('[data-nav-email]');
  const signOutBtn = document.querySelector<HTMLButtonElement>('[data-sign-out]');

  const supabase = getSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user?.email || !isTriveltaEmail(session.user.email)) {
    const redirectTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.location.replace(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
    return;
  }

  navGuest?.setAttribute('hidden', '');
  navAuth?.removeAttribute('hidden');
  if (emailEl) emailEl.textContent = session.user.email;

  signOutBtn?.addEventListener('click', async () => {
    signOutBtn.disabled = true;
    await supabase.auth.signOut();
    window.location.replace('/login');
  });
}

init().catch((error) => {
  console.error('auth gate failed', error);
});
