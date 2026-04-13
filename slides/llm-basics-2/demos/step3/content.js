(() => {
  const candidates = [
    { selector: 'article .it-MdContent',   name: 'Qiita' },
    { selector: '.znc',                    name: 'Zenn' },
    { selector: '#article-body',           name: 'dev.to' },
    { selector: 'article.markdown-body',   name: 'GitHub README' },
    { selector: 'main article',            name: 'main > article' },
    { selector: 'article',                 name: 'article' },
    { selector: '[role="main"]',           name: '[role=main]' },
    { selector: 'main',                    name: 'main' }
  ];

  for (const { selector, name } of candidates) {
    const el = document.querySelector(selector);
    if (el) {
      const text = el.innerText.trim();
      if (text.length > 100) {
        return { text, selector: name, title: document.title };
      }
    }
  }

  return {
    text: document.body.innerText.trim(),
    selector: 'document.body (フォールバック)',
    title: document.title
  };
})();
