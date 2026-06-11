import { authEnabled, safeRedirectTo } from '../lib/auth';
import { getSupabase } from '../lib/supabase';

async function init() {
  if (!authEnabled()) {
    window.location.replace('/');
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const redirectTo = safeRedirectTo(params.get('redirectTo'));
  const statusEl = document.querySelector<HTMLElement>('[data-callback-status]');
  const errorEl = document.querySelector<HTMLElement>('[data-callback-error]');
  const backLink = document.querySelector<HTMLAnchorElement>('[data-callback-back]');

  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  const hashError = hashParams.get('error_description');
  if (hashError && errorEl) {
    errorEl.hidden = false;
    errorEl.textContent = hashError;
    statusEl?.setAttribute('hidden', '');
    if (backLink) {
      backLink.href = `/login?redirectTo=${encodeURIComponent(redirectTo)}`;
      backLink.hidden = false;
    }
    return;
  }

  const supabase = getSupabase();

  const finish = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      window.location.replace(redirectTo);
      return;
    }

    if (statusEl) {
      statusEl.textContent =
        'No session was created. Request a fresh magic link to try again.';
    }
    if (backLink) {
      backLink.href = `/login?redirectTo=${encodeURIComponent(redirectTo)}`;
      backLink.hidden = false;
    }
  };

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      window.location.replace(redirectTo);
    }
  });

  window.setTimeout(() => {
    finish().catch((error) => console.error('callback finish failed', error));
  }, 1500);

  window.addEventListener(
    'pagehide',
    () => subscription.unsubscribe(),
    { once: true },
  );
}

init().catch((error) => {
  console.error('auth callback init failed', error);
});
