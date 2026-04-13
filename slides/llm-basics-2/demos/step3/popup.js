const input = document.getElementById('input');
const analyzeBtn = document.getElementById('analyze');
const clearBtn = document.getElementById('clear');
const extractBtn = document.getElementById('extract');
const summarizeBtn = document.getElementById('summarize');
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveKeyBtn = document.getElementById('saveKey');
const clearKeyBtn = document.getElementById('clearKey');
const settingsStatus = document.getElementById('settingsStatus');
const results = document.getElementById('results');
const keywords = document.getElementById('keywords');
const sourceInfo = document.getElementById('sourceInfo');
const summary = document.getElementById('summary');

// ──────────── analyze (Step 1 / 2 features) ────────────

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

// ──────────── extract from page (Step 2 feature) ────────────

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

// ──────────── API key management (Step 3 feature) ────────────

const STORAGE_KEY = 'anthropic_api_key';

async function loadApiKey() {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  return data[STORAGE_KEY] || '';
}

async function saveApiKey(key) {
  await chrome.storage.local.set({ [STORAGE_KEY]: key });
}

async function clearApiKey() {
  await chrome.storage.local.remove(STORAGE_KEY);
}

settingsBtn.addEventListener('click', async () => {
  settingsPanel.classList.toggle('show');
  if (settingsPanel.classList.contains('show')) {
    apiKeyInput.value = await loadApiKey();
  }
});

saveKeyBtn.addEventListener('click', async () => {
  const key = apiKeyInput.value.trim();
  if (!key) return;
  await saveApiKey(key);
  settingsStatus.textContent = '✓ 保存しました';
  settingsStatus.classList.add('show');
  setTimeout(() => settingsStatus.classList.remove('show'), 2000);
});

clearKeyBtn.addEventListener('click', async () => {
  await clearApiKey();
  apiKeyInput.value = '';
  settingsStatus.textContent = '✓ 削除しました';
  settingsStatus.classList.add('show');
  setTimeout(() => settingsStatus.classList.remove('show'), 2000);
});

// ──────────── AI summarization (Step 3 feature) ────────────

const SYSTEM_PROMPT = `あなたは記事を3行で要約するエキスパートです。
以下のルールで要約してください:

- 1行目: 結論（何が言いたいか）
- 2行目: 理由（なぜそう言えるか）
- 3行目: 使い所（誰がいつ役立てられるか）
- 各行40文字以内
- 専門用語はそのまま使う
- 番号や記号なしで、改行のみで区切る`;

async function callAnthropic(apiKey, articleText) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: articleText.slice(0, 12000) }
      ]
    })
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`API ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

function renderSummary(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean).slice(0, 3);
  const html = `
    <div class="summary-card">
      <div class="summary-header">✨ 3-LINE SUMMARY</div>
      ${lines.map((line, i) => `
        <div class="summary-line">
          <span class="summary-num">${i + 1}.</span>
          <span>${line}</span>
        </div>
      `).join('')}
    </div>
  `;
  summary.innerHTML = html;
  summary.classList.add('show');
}

function renderSummaryError(message) {
  summary.innerHTML = `<div class="summary-error">❌ ${message}</div>`;
  summary.classList.add('show');
}

function renderSummaryLoading() {
  summary.innerHTML = '<div class="summary-loading">⏳ AI が要約しています...</div>';
  summary.classList.add('show');
}

summarizeBtn.addEventListener('click', async () => {
  const text = input.value.trim();
  if (!text) {
    renderSummaryError('要約する記事を入力してください');
    return;
  }

  const apiKey = await loadApiKey();
  if (!apiKey) {
    renderSummaryError('APIキーが未設定です。右上の ⚙️ から設定してください');
    settingsPanel.classList.add('show');
    return;
  }

  summarizeBtn.disabled = true;
  renderSummaryLoading();

  try {
    const result = await callAnthropic(apiKey, text);
    renderSummary(result);
  } catch (e) {
    renderSummaryError(`要約に失敗: ${e.message}`);
  } finally {
    summarizeBtn.disabled = false;
  }
});

// ──────────── event wiring ────────────

analyzeBtn.addEventListener('click', analyze);
extractBtn.addEventListener('click', extractFromPage);

clearBtn.addEventListener('click', () => {
  input.value = '';
  results.classList.remove('show');
  keywords.classList.remove('show');
  sourceInfo.classList.remove('show');
  summary.classList.remove('show');
  input.focus();
});

input.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    analyze();
  }
});
