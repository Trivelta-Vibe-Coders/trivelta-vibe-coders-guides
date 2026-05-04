const pres = document.querySelectorAll<HTMLPreElement>('pre');

pres.forEach((pre) => {
  const btn = document.createElement('button');
  btn.className = 'copy-btn';
  btn.type = 'button';
  btn.textContent = 'Copy';
  btn.setAttribute('aria-label', 'Copy code to clipboard');

  btn.addEventListener('click', () => {
    const code = pre.querySelector('code');
    let text = (code ? code.innerText : pre.innerText)
      .replace(/^\s*\$\s/gm, '')
      .trim();

    const done = () => {
      btn.textContent = 'Copied';
      btn.classList.add('copied');
      window.setTimeout(() => {
        btn.textContent = 'Copy';
        btn.classList.remove('copied');
      }, 1400);
    };

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => {
        btn.textContent = 'Press ⌘C';
      });
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
        done();
      } catch {
        btn.textContent = 'Press ⌘C';
      }
      document.body.removeChild(ta);
    }
  });

  pre.appendChild(btn);
});
