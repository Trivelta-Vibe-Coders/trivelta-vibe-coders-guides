import {
  authEnabled,
  EMAIL_DOMAIN,
  isTriveltaEmail,
  MAGIC_LINK_SENT,
  safeRedirectTo,
} from '../lib/auth';
import { getSupabase } from '../lib/supabase';

const form = document.querySelector<HTMLFormElement>('[data-login-form]');
const emailInput = document.querySelector<HTMLInputElement>('[data-login-email]');
const submitBtn = document.querySelector<HTMLButtonElement>('[data-login-submit]');
const errorEl = document.querySelector<HTMLElement>('[data-login-error]');
const statusEl = document.querySelector<HTMLElement>('[data-login-status]');

function showError(message: string) {
  if (!errorEl) return;
  errorEl.hidden = false;
  errorEl.textContent = message;
  statusEl?.setAttribute('hidden', '');
}

function showStatus(message: string) {
  if (!statusEl) return;
  statusEl.hidden = false;
  statusEl.textContent = message;
  errorEl?.setAttribute('hidden', '');
}

function clearMessages() {
  errorEl?.setAttribute('hidden', '');
  statusEl?.setAttribute('hidden', '');
}

async function init() {
  if (!authEnabled() || !form || !emailInput || !submitBtn) return;

  const params = new URLSearchParams(window.location.search);
  const redirectTo = safeRedirectTo(params.get('redirectTo'));
  const loginError = params.get('error');

  if (loginError) {
    showError('That sign-in link expired or was invalid. Request a fresh one.');
  }

  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  const hashError = hashParams.get('error_description');
  if (hashError) {
    showError(hashError);
  }

  const supabase = getSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    window.location.replace(redirectTo);
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearMessages();

    const normalizedEmail = emailInput.value.trim().toLowerCase();
    if (!isTriveltaEmail(normalizedEmail)) {
      showError(`Use your ${EMAIL_DOMAIN} email address.`);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    const emailRedirectTo = `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`;
    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: false,
        emailRedirectTo,
      },
    });

    submitBtn.disabled = false;
    submitBtn.textContent = 'Send magic link';

    if (error) {
      showStatus(MAGIC_LINK_SENT);
      return;
    }

    showStatus(MAGIC_LINK_SENT);
  });
}

init().catch((error) => {
  console.error('login init failed', error);
});
