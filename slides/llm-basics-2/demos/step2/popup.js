const input = document.getElementById('input');
const analyzeBtn = document.getElementById('analyze');
const clearBtn = document.getElementById('clear');
const extractBtn = document.getElementById('extract');
const results = document.getElementById('results');
const keywords = document.getElementById('keywords');
const sourceInfo = document.getElementById('sourceInfo');

function extractWords(text, regex) {
  const matches = text.match(regex) || [];
  const counts = new Map();
  for (const word of matches) {
    counts.set(word, (counts.get(word) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function renderTags(container, items, className) {
  container.innerHTML = '';
  if (items.length === 0) {
    container.innerHTML = '<div class="keywords-empty">該当なし</div>';
    return;
  }
  for (const [word, count] of items) {
    const tag = document.createElement('span');
    tag.className = `keyword-tag ${className}`;
    tag.innerHTML = `${word}<span class="keyword-count">${count}</span>`;
    container.appendChild(tag);
  }
}

function analyze() {
  const text = input.value.trim();
  if (!text) {
    results.classList.remove('show');
    keywords.classList.remove('show');
    return;
  }

  const chars = text.length;
  const time = Math.max(1, Math.ceil(chars / 500));
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length || 1;

  document.getElementById('chars').textContent = chars.toLocaleString();
  document.getElementById('time').textContent = time;
  document.getElementById('paragraphs').textContent = paragraphs;

  const enWords = extractWords(text, /[A-Za-z][A-Za-z0-9]*/g);
  const kanaWords = extractWords(text, /[ァ-ヴー]{2,}/g);

  document.getElementById('enCount').textContent = `${enWords.length} 件`;
  document.getElementById('kanaCount').textContent = `${kanaWords.length} 件`;
  renderTags(document.getElementById('enList'), enWords, 'en');
  renderTags(document.getElementById('kanaList'), kanaWords, 'kana');

  results.classList.add('show');
  keywords.classList.add('show');
}

async function extractFromPage() {
  extractBtn.disabled = true;
  extractBtn.textContent = '⏳ 取得中...';
  sourceInfo.classList.remove('show');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    if (result && result.text) {
      input.value = result.text;
      sourceInfo.innerHTML = `<strong>取得元:</strong> ${result.selector} <br><strong>ページ:</strong> ${result.title}`;
      sourceInfo.classList.add('show');
      analyze();
    } else {
      sourceInfo.innerHTML = '<strong>取得失敗:</strong> 本文が見つかりませんでした';
      sourceInfo.classList.add('show');
    }
  } catch (e) {
    sourceInfo.innerHTML = `<strong>エラー:</strong> ${e.message}`;
    sourceInfo.classList.add('show');
  } finally {
    extractBtn.disabled = false;
    extractBtn.textContent = '📥 このページから取得';
  }
}

analyzeBtn.addEventListener('click', analyze);
extractBtn.addEventListener('click', extractFromPage);

clearBtn.addEventListener('click', () => {
  input.value = '';
  results.classList.remove('show');
  keywords.classList.remove('show');
  sourceInfo.classList.remove('show');
  input.focus();
});

input.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    analyze();
  }
});
