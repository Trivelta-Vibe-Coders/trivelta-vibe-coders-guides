const buttons = document.querySelectorAll<HTMLButtonElement>('button[data-copy-login]');

buttons.forEach((btn) => {
  const original = btn.textContent ?? 'Copy login';
  const email = btn.dataset.email ?? '';
  const password = btn.dataset.password ?? '';
  const text = `${email}\n${password}`;

  btn.addEventListener('click', () => {
    const done = (label: string) => {
      btn.textContent = label;
      btn.classList.add('copied');
      window.setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove('copied');
      }, 1400);
    };

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => done('Copied')).catch(() => done('Press ⌘C'));
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        done('Copied');
      } catch {
        done('Press ⌘C');
      }
      document.body.removeChild(ta);
    }
  });
});
