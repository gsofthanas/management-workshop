# Codex を使ってみよう（第4回）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 「Codex を使ってみよう」（AI研修 第4回）の17枚スライドデッキ＋handbook作業ガイドを作り、ポータルに登録する。

**Architecture:** 既存 tech-grid フレームワーク（`base.css`＋`pres.css`＋`tech-grid.css`）の上に、`chatgpt-api/index.html` と同じ構造の単一HTMLデッキを作る。作業ガイドは `llm-basics-2/handbook.html` と同じ print 指向の単一HTML。自動テストは無いため、検証は「ローカル http.server 8765 ＋ ブラウザ目視/スクショ ＋ 構造grep」で行う。

**Tech Stack:** 静的HTML / CSS（既存デザインシステム）/ `js/slide.js`（ナビ）/ `js/aurora.js`（背景）/ Python `http.server`（ローカル確認）。

## Global Constraints

スペック `docs/superpowers/specs/2026-07-01-codex-handson-design.md` のプロジェクト全体要件。各タスクはこれを暗黙に含む。

- 成果物: `slides/codex/index.html`（**17枚**）／`slides/codex/handbook.html`／ルート `index.html`（ポータル）に SERIES 05 追加。
- 言語: **日本語のみ**。
- CSS読み込み（デッキ）: `../../css/base.css` → `../../css/pres.css` → `../../css/tech-grid.css`。`<div class="slide tech-grid">` ベース。
- `<head>` に `<meta name="robots" content="noindex, nofollow">`（chatgpt-api同様）。
- 色セマンティクス: `bad`=赤（注意/安全）/ `accent`=青（実習・概念）/ `ok`=緑（上級・まとめ）。**実在クラスのみ使用**（pres.css / tech-grid.css）。新規クラスは必要時のみデッキ内 `<style>` に定義。
- **ネット既定オフ前提**: ハンズオン/プロンプトは「その場でのpip/npm install」「外部CDN/ライブラリ」を**使わない**。Excelは**事前導入の openpyxl/pandas**、グラフは**インラインSVG/canvas**。
- **「MAX」表記禁止** → 「最上位プラン（Pro）」と書く（OpenAIにMAXプランは無い）。
- **価格・利用上限の具体数値をスライドに焼かない**（「当日/公式で確認」とする）。変動が速いため。
- フッタークリアランス調整（chatgpt-api の `<style>` を踏襲: `.slide{padding-bottom}` と `.tg-corner.bl/.br`、`.tg-meta` の bottom 上書き）。
- コミットメッセージは**日本語・シンプル**、Claude/Co-Authored-By 等の付与は**しない**（プロジェクト慣習）。作業は feature ブランチ `codex-handson` で行い、完了後に `main` へマージする（harness の git 衛生に従う。既存デッキは最終的に main に集約）。

---

## File Structure

| ファイル | 責務 |
|---|---|
| `slides/codex/index.html` | 17枚デッキ本体（head＋デッキ内`<style>`＋17スライド＋footer＋script） |
| `slides/codex/handbook.html` | 作業ガイド（導入手順・プロンプト集・トラブル対処・スラッシュ早見表・当日朝チェックリスト） |
| `index.html`（ルート） | ポータル。SERIES 05 カード追加とヘッダーのカウント更新 |

デッキは単一ファイル。タスクはスライド群（段）ごとに分割し、各タスク末で「ブラウザ確認→コミット」。

---

## Reference: tech-grid コンポーネント実パターン（実在クラスのみ）

実装はこのスニペットを土台に、各タスクの**逐語コピー**を流し込む。クラスは `pres.css`／`tech-grid.css` に実在（確認済み）。

**スライド枠（共通）**
```html
<div class="slide tech-grid" id="sN">
  <span class="tg-corner tl"></span>
  <span class="tg-corner br"></span>
  <span class="tg-tag">LABEL / 日本語</span>      <!-- 色: 既定=赤 / .accent=青 / .ok=緑 / .gray=灰 -->
  <h2 class="headline" style="font-size:clamp(34px,4.6vw,62px); margin:clamp(12px,2vh,20px) 0 clamp(10px,1.5vh,16px);">
    見出し<span class="hi">強調</span>            <!-- .hi=青 / .bad=赤 / .ok=緑 -->
  </h2>
  <p class="body-text">本文。<strong>強調</strong>。</p>
  <!-- 中身 -->
</div>
```
コーナーは色変種 `.tg-corner.accent / .ok / .gray` あり。`tg-tag` の色変種 `.accent / .ok / .gray`。

**番号リスト（num-list）**
```html
<div class="num-list">
  <div class="num-list-item"><div class="num">01</div><div><strong>主文</strong><div class="sub">補足</div></div></div>
  <div class="num-list-item"><div class="num">02</div><div><strong>主文</strong><div class="sub">補足</div></div></div>
</div>
```

**対比（vs-wrap）**
```html
<div class="vs-wrap">
  <div class="vs-col bad"><div class="vs-col-label">❌ ラベル</div>
    <div class="vs-item">項目</div><div class="vs-item">項目</div></div>
  <div class="vs-col ok"><div class="vs-col-label">✅ ラベル</div>
    <div class="vs-item">項目</div><div class="vs-item">項目</div></div>
</div>
```

**コールアウト（callout / .bad / .ok）**
```html
<div class="callout accent"><div class="callout-label">ラベル</div>
  <div class="callout-body"><strong>強調</strong>本文。</div></div>
```

**ターミナル風コードブロック（tg-code-block）— 承認プロンプト再現に使う**
```html
<div class="tg-code-block" data-filename="CODEX">
  <div class="tg-code-line"><span class="tg-marker">&gt;</span><span class="tg-val">codex wants to apply a change to report.html</span></div>
  <div class="tg-code-line"><span class="tg-marker">&gt;</span><span class="tg-key">+ &lt;html&gt; … 売上レポート …</span></div>
  <div class="tg-code-line"><span class="tg-marker">&gt;</span><span class="tg-val">Apply this change? [y/n]</span></div>
</div>
```

**まとめ（tg-rule-list）**
```html
<div class="tg-rule-list">
  <div class="tg-rule-item"><span class="tg-rule-num">RULE / 01</span>
    <div><p class="tg-rule-text">主文</p><p class="tg-rule-sub">// 補足</p></div></div>
</div>
```

**ノート行（デッキ内 `<style>` で定義、chatgpt-apiから流用）**
```html
<p class="note-line">補足の一文</p>
```

**カバー／フッター／script（chatgpt-api と同形）**
```html
<!-- cover: id=s1, style="justify-content:center; align-items:center; text-align:center;" -->
<!-- 4隅 tg-corner、tg-tag gray、headline 大、tg-divider-text、tg-meta -->
...
</div><!-- /deck -->
<div class="slide-footer">
  <div class="slide-footer-info">G-Holdings AI研修 — 第4回 / Codex を使ってみよう</div>
  <div class="slide-footer-nav">
    <div class="slide-footer-track"><div class="slide-footer-fill" id="bar"></div></div>
    <div class="slide-footer-counter" id="ctr">1 / 17</div>
  </div>
</div>
<script src="../../js/slide.js"></script>
```

**デッキ内 `<style>`（chatgpt-api から流用する最小セット）**
```css
.slide.tech-grid.section-center { justify-content: center; }
.slide { padding-bottom: clamp(72px,10vh,110px) !important; }
.tg-corner.bl { bottom: clamp(54px,7vh,68px) !important; }
.tg-corner.br { bottom: clamp(54px,7vh,68px) !important; }
.tg-meta { bottom: clamp(72px,10vh,90px) !important; }
.note-line { font-family:'JetBrains Mono',monospace; font-size:clamp(11px,1.2vw,14px); font-weight:600; color:var(--text-tertiary); margin-top:clamp(10px,1.5vh,16px); letter-spacing:0.05em; }
.note-line::before { content:'// '; opacity:0.6; }
/* 2層ダイアグラム（このデッキ専用） */
.duo { display:grid; grid-template-columns:1fr 1fr; gap:clamp(14px,2vw,28px); margin-top:clamp(16px,2.5vh,28px); flex:1; }
.duo-col { border-left:4px solid var(--slide-bad); background:var(--slide-bad-soft); padding:clamp(16px,2.2vh,26px) clamp(18px,2.2vw,30px); }
.duo-kicker { font-family:'JetBrains Mono',monospace; font-size:clamp(11px,1.1vw,13px); font-weight:800; letter-spacing:.12em; text-transform:uppercase; color:var(--slide-bad); margin-bottom:10px; }
.duo-title { font-size:clamp(22px,2.6vw,34px); font-weight:900; color:var(--text-primary); margin:0 0 10px; }
.duo-desc { font-size:clamp(14px,1.5vw,19px); font-weight:700; color:var(--text-secondary); line-height:1.6; margin:0; }
```

---

## Task 1: デッキ雛形＋カバー(s1)＋ゴール(s2)

**Files:**
- Create: `slides/codex/index.html`
- Reference: `slides/chatgpt-api/index.html`（構造の手本）, `js/slide.js`（カウンタ・進捗の挙動確認）

**Interfaces:**
- Produces: 17スライドを収める `<div class="deck">`、footer（`#bar` `#ctr`）、デッキ内 `<style>`（後続タスクが流用）。スライドid命名 `s1`..`s17`。

- [ ] **Step 1: `js/slide.js` を読み、`#ctr` の総数と `#bar` の算出方法を確認**（ハードコード分母か、`.slide` カウントか）。分母がハードコードなら `#ctr` を `1 / 17` にする。

- [ ] **Step 2: `slides/codex/index.html` を作成**（head＋body骨格＋`<style>`＋s1＋s2）

head: chatgpt-api と同じ font link、`../../css/{base,pres,tech-grid}.css`、`<meta name="robots" content="noindex, nofollow">`、`<title>Codex を使ってみよう — 第4回</title>`。`<style>` は Reference の「デッキ内`<style>`」セット。
body 冒頭: `<div id="frost"></div>` ＋ `<script src="../../js/aurora.js"></script>` ＋ `<div class="deck">`。

s1（カバー、4隅 tg-corner、中央寄せ）:
```html
<div class="slide active tech-grid" id="s1" style="justify-content:center; align-items:center; text-align:center;">
  <span class="tg-corner tl"></span><span class="tg-corner tr"></span>
  <span class="tg-corner bl"></span><span class="tg-corner br"></span>
  <span class="tg-tag gray" style="margin-bottom:clamp(24px,4vh,40px);display:inline-block;">G-HOLDINGS AI 研修 / 第4回 / 2026</span>
  <h1 class="headline" style="font-size:clamp(56px,8vw,112px); line-height:1.12;">
    Codex を<br><span class="hi">使ってみよう</span>
  </h1>
  <div class="tg-divider-text">実践 / 操作するAI / 60分</div>
  <div class="tg-meta"><span>FILE / CODEX_HANDSON</span><span>17 SLIDES / 60 MIN</span></div>
</div>
```

s2（ゴール、num-list）:
```html
<div class="slide tech-grid" id="s2">
  <span class="tg-corner tl"></span><span class="tg-corner br"></span>
  <span class="tg-tag">PURPOSE / 今日のゴール</span>
  <h2 class="headline" style="font-size:clamp(36px,5vw,68px); margin:clamp(12px,2vh,20px) 0 clamp(20px,3vh,32px);">今日の<span class="hi">ゴール</span></h2>
  <div class="num-list">
    <div class="num-list-item"><div class="num">01</div><div><strong>Codexは「操作する」AIだと理解する</strong><div class="sub">画面で話すAIではなく、PCのファイルを読み書きして実行する</div></div></div>
    <div class="num-list-item"><div class="num">02</div><div><strong>安全の2つのつまみを“自分の手で”確かめる</strong><div class="sub">壁（サンドボックス）とチャイム（承認）</div></div></div>
    <div class="num-list-item"><div class="num">03</div><div><strong>売上Excel→集計→レポートHTMLを安全に一気通貫で作る</strong><div class="sub">最後はブラウザに成果物が出る</div></div></div>
  </div>
</div>
```
末尾に `</div><!-- /deck -->` ＋ Reference のfooter＋`<script src="../../js/slide.js"></script>`＋`</body></html>`。

- [ ] **Step 3: ローカルサーバ起動**

Run（リポジトリ直下、バックグラウンド可）: `python -m http.server 8765`
Expected: 起動メッセージ。

- [ ] **Step 4: ブラウザで確認**

`http://localhost:8765/slides/codex/` を開く。Claude-in-Chrome でスクショ。
Expected: s1カバーが中央表示・崩れ無し。`#ctr` が `1 / 2`（全2枚なので）と表示。→ で s2 に進み、ゴール3項目が表示・縦オーバーフロー無し。

- [ ] **Step 5: 構造確認（grep）**

`class="slide"` 出現数が現時点で 2、`id="s1"`〜`id="s2"` が存在することを確認。

- [ ] **Step 6: コミット**

```bash
git add slides/codex/index.html
git commit -m "Codexデッキ: 雛形・カバー・ゴール追加"
```

---

## Task 2: 段1 — Codexとは・心構え(s3–s5)

**Files:** Modify `slides/codex/index.html`（s2 の後に挿入）

逐語コピーで以下3枚を追加（Reference のパターン使用）。

- [ ] **Step 1: s3（フック・accent）追加**
  - `tg-corner tr accent` / `tg-corner bl accent`、`tg-tag accent`＝`HOOK / まず一度、見る`
  - headline: `「作って」で<span class="hi">物が生まれる</span>`
  - body-text: 「講師が実際に『単一HTMLのツールを作って』と頼む。Codexが<strong>差分(diff)</strong>を見せ、<strong>y/n</strong>で承認すると、ファイルが生まれてすぐ動く。」
  - `callout accent`（label `見るポイント`）: 「注目するのは『<strong>差分が出て y/n を押す瞬間</strong>』。これがCodexの正体。」
  - `note-line`: 「強力だからこそ、今日はまず“安全に持つ”を学ぶ」

- [ ] **Step 2: s4（Codexとは・accent）追加**
  - `tg-corner tl gray` / `tg-corner br gray`、`tg-tag gray`＝`BASICS / Codexとは`
  - headline: `チャットの<span class="hi">"次"</span>`
  - num-list: 01「話す（LLM・チャット）」/sub「ChatGPTの画面で会話する」、02「コードから呼ぶ（API）」/sub「プログラムが入力を送る（前回）」、03「操作する（Codex）」/sub「AIがファイルを読み・書き・コマンドを実行する」
  - body-text: 「Codexは<strong>4つの入口</strong>（CLI・IDE・クラウド・アプリ）から使える1人のAIエンジニア。同じChatGPTでログイン。既定モデルは<strong>GPT-5.5</strong>。」
  - `note-line`: 「きょう触るのはCLI（ターミナル）。デスクトップ“アプリ”とは別物」

- [ ] **Step 3: s5（心構え・bad）追加**
  - `tg-corner tr` / `tg-corner bl`、`tg-tag`（赤）＝`MINDSET / なぜ“心構え”が先か`
  - headline: `速く強い＝<span class="bad">間違いも速い</span>`
  - body-text: 「Codexは数百回の操作を自分で連鎖できる。便利な反面、<strong>間違いも一気に進む</strong>。だから先に安全のしくみを知る。」
  - num-list（落とし穴予告）: 01「存在しないライブラリを“それらしく”作る」/sub「捏造。実在を確認する」、02「頼んでいないファイルまで編集する」/sub「差分を必ず読む」、03「差分を盲信する」/sub「テスト・レビューは人間が持つ」
  - `note-line`: 「次から、安全の“2つのつまみ”を手で確かめる」

- [ ] **Step 4: ブラウザ確認**：s3–s5 が崩れなく表示、`#ctr` が `/ 5` に。各スライド縦オーバーフロー無し（特に s5 の num-list＋note-line）。

- [ ] **Step 5: コミット**
```bash
git add slides/codex/index.html
git commit -m "Codexデッキ: 段1（Codexとは・心構え）追加"
```

---

## Task 3: 段2 — 安全2層を手で確かめる(s6–s9)

**Files:** Modify `slides/codex/index.html`

- [ ] **Step 1: s6（安全2層・bad、duoダイアグラム）追加**
  - `tg-corner tr` / `tg-corner bl`、`tg-tag`（赤）＝`SAFETY / 安全の2層`
  - headline（font-size やや小さめ clamp(34px,4.8vw,64px)）: `<span class="bad">壁</span>と<span class="bad">チャイム</span>`
  - `.duo`:
    - col1: kicker `壁 / サンドボックス`、title `AIが“何を触れるか”`、desc「Read Only（読むだけ）／ Auto（フォルダ内で書ける）／ Full（無制限・使わない）」
    - col2: kicker `チャイム / 承認`、title `AIが“いつ確認するか”`、desc「書く前に<strong>差分を見せて y/n</strong>。承認するまで適用しない」（descは `.duo-desc` 内に `<strong>` 可）
  - `callout bad`（label `既定の設定`）: 「フォルダ内は書ける・外部とネットは<strong>既定オフ</strong>。だから安全に試せる。」

- [ ] **Step 2: s7（PRACTICE 01・accent）追加**
  - `tg-corner tr accent` / `tg-corner bl accent`、`tg-tag accent`＝`PRACTICE / 01 / サインイン＆確認 / 8 MIN`
  - headline: `まず<span class="hi">サインイン</span>して状態を見る`
  - body-text: 「用意済み端末。作業フォルダを開いてCodexを起動し、<strong>普段のChatGPT</strong>でログインする。」
  - num-list: 01「作業フォルダで <code>codex</code> を起動」/sub「ターミナルに codex と打つ」、02「『Sign in with ChatGPT』を選ぶ」/sub「ブラウザでログイン。APIキーは使わない」、03「<code>/status</code> で残量とモデルを見る」/sub「今日の枠を確認」、04「困ったら隣とペア・講師画面」/sub「先に進めなくてOK」
    - 注: `num-list-item` 内で `<code>` 使用可。
  - `note-line`: 「APIキーは従量課金。今日は使わない」

- [ ] **Step 3: s8（PRACTICE 02・accent）追加**
  - `tg-tag accent`＝`PRACTICE / 02 / Read Onlyで説明 / 6 MIN`、コーナー accent
  - headline: `一番安全な<span class="hi">読むだけ</span>`
  - body-text: 「まずは書き込まない <strong>Read Only</strong>。壊す心配なく、AIに説明させる。」
  - num-list: 01「Read Only か確認」/sub「/approvals で選ぶ」、02「『このフォルダは何をする?』」/sub「プロジェクトを説明させる」、03「『このファイルを1行ずつ日本語で』」/sub「コードに注釈」、04「『このエラーの意味と直し方をやさしく説明して』」/sub「初心者でも読めるように」
  - `callout accent`（label `安心ポイント`）: 「書き込まないモードだから、安心して何でも聞ける。」

- [ ] **Step 4: s9（差分→承認→適用・bad、tg-code-block）追加**
  - `tg-tag`（赤）＝`APPLY / 差分 → 承認 → 適用`、コーナー赤
  - headline: `勝手に書かない。<span class="bad">diffを見て y/n</span>`
  - body-text: 「Codexは変更を<strong>差分(diff)で見せて y/n を待つ</strong>。承認して初めてファイルになる。<code>/approvals</code> で Auto にすると、安全な範囲は自動で進む。」
  - `tg-code-block`（data-filename="CODEX"）: Reference の承認プロンプト3行。
  - `note-line`: 「<code>/diff</code> で現在の差分・<code>/review</code> で変更をレビュー」

- [ ] **Step 5: ブラウザ確認**：s6 の `.duo` が2列で表示・desc が枠内（モバイル幅で1列化は許容）。s7–s9 崩れ無し。`tg-code-block` の filename タブ・3点ドットが出る。`#ctr` `/ 9`。

- [ ] **Step 6: コミット**
```bash
git add slides/codex/index.html
git commit -m "Codexデッキ: 段2（安全2層・サインイン・Read Only・承認）追加"
```

---

## Task 4: 段3 — 安全を保ったまま作る(s10–s13)

**Files:** Modify `slides/codex/index.html`

- [ ] **Step 1: s10（ネット既定オフの理由・accent、vs-wrap）追加**
  - `tg-tag accent`＝`RULE / なぜ“その場インストール”は失敗するか`、コーナー accent
  - headline: `ネット既定オフ＝<span class="hi">入れ直しは無理</span>`
  - vs-wrap: bad（label `❌ 失敗しやすい`）項目「その場で pip install が要る」「npm install が要る」「外部CDNを読む（Chart.js等）」／ ok（label `✅ 今日のやり方`）項目「単一HTML（追加不要）」「事前に入れてある道具（openpyxl・pandas）」「グラフはインラインSVG/canvas」
  - `callout accent`（label `今日の素材`）: 「これは不便ではなく<strong>安全設計</strong>。きょうの素材は『飲食店の売上』。」

- [ ] **Step 2: s11（PRACTICE 03・accent）追加**
  - `tg-tag accent`＝`PRACTICE / 03 / 売上Excelを作る・集計 / 9 MIN`、コーナー accent
  - headline: `売上<span class="hi">.xlsx</span>を生成→集計`
  - num-list（プロンプトを sub に逐語、`.sub` 内は読みやすさ優先）:
    - 01「売上データを作る」/sub「『架空の飲食店の売上を3か月・日別で、メニュー名/単価/数量の列入りの .xlsx を openpyxl で sales.xlsx に保存して』」
    - 02「読んで集計する」/sub「『sales.xlsx を読み、メニュー別・日別売上と売れ筋トップ5を新シート“集計”に。元は壊さずコピーに、openpyxl で』」
  - `callout accent`（label `進め方`）: 「<code>/approvals</code> で <strong>Auto</strong> に。出てくる<strong>差分を読んでから</strong>承認する。」

- [ ] **Step 3: s12（PRACTICE 04・accent）追加**
  - `tg-tag accent`＝`PRACTICE / 04 / レポートHTML化 / 9 MIN`、コーナー accent
  - headline: `集計を<span class="hi">ブラウザに出す</span>`
  - num-list:
    - 03「レポートを作る」/sub「『“集計”を、棒グラフ（インラインSVG/canvas・外部CDN禁止）とサマリー付きの単一HTML report.html にしてブラウザで開いて』」
    - 「（余力）改造する」/sub「『色をダークにして』『合計の行を足して』など」（num は `+` でもよいが統一して `03`の次は空番号を避け、2項目目の `.num` は「★」表示にする＝`<div class="num">★</div>`）
  - `callout ok`（label `ゴール`）: 「report.html がブラウザに出たら今日のゴール達成。」
  - `note-line`: 「エラーは読む・Codexに聞く・直す。正解は配らない」

- [ ] **Step 4: s13（お金の直感・bad）追加**
  - `tg-tag`（赤）＝`COST / お金の直感`、コーナー赤
  - headline: `枠は<span class="bad">小さい・共有</span>`
  - num-list: 01「出力は入力の約6倍」/sub「たくさん書かせるほど枠を食う」、02「5時間の枠は CLI/Web/IDE で共有」/sub「重い作業は他も圧迫」、03「無料枠は小さい」/sub「1人1パイプラインに絞る」
  - `callout bad`（label `節約`）: 「<code>/status</code> で残量を確認。<strong>無駄に回さない</strong>。」
  - `note-line`: 「具体的な価格・上限は変わる。最新は公式で確認」

- [ ] **Step 5: ブラウザ確認**：s10 vs-wrap が2列・各3項目。s11/s12 の num-list で長い sub が枠内に収まる（はみ出す場合は `headline` を一段小さく clamp(30px,4vw,52px) に）。`#ctr` `/ 13`。

- [ ] **Step 6: コミット**
```bash
git add slides/codex/index.html
git commit -m "Codexデッキ: 段3（ハンズオン: 売上Excel→集計→レポート）追加"
```

---

## Task 5: 段4–5 — 会社の約束・講師デモ・まとめ(s14–s17)

**Files:** Modify `slides/codex/index.html`

- [ ] **Step 1: s14（会社で正しく使う・bad、vs-wrap）追加**
  - `tg-tag`（赤）＝`RULES / 会社で正しく使う`、コーナー赤
  - headline: `渡してよい物・<span class="bad">だめな物</span>`
  - vs-wrap: bad（label `❌ 渡さない`）「本物の社内リポ」「顧客データ・秘密」「APIキー・パスワード」／ ok（label `✅ OK`）「使い捨ての練習用フォルダ」「公開してよいサンプル」「今日の sales.xlsx（架空）」
  - `callout bad`（label `2つの約束`）: 「消費者プラン（Free/Plus/Pro）は<strong>既定で学習に使われ得る</strong>→設定でオプトアウト。恒久ルールは <strong>AGENTS.md</strong> に（<code>/init</code>）。」

- [ ] **Step 2: s15（講師デモ・伸びしろ・ok）追加**
  - `tg-tag ok`＝`SHOWCASE / 講師デモ・伸びしろ`、コーナー `tg-corner tr ok` / `tg-corner bl ok`
  - headline: `各自の枠の<span class="ok">先にある世界</span>`
  - num-list: 01「自動コードレビュー」/sub「バグ入りPR→@codex review→fix」、02「クラウドに委任」/sub「投げておくとPRが自動で出来る」、03「並列・音声・画像・xhigh」/sub「複数同時／話す／スクショ診断／深い推論」
  - `note-line`: 「いずれも上位プラン（Pro）中心。無料枠では不可＝これが“伸びしろ”」

- [ ] **Step 3: s16（他ツールとの棲み分け・ok）追加**
  - `tg-tag ok`＝`COMPARE / 他ツールとの棲み分け`、コーナー ok
  - headline: `正直な<span class="ok">棲み分け</span>`
  - num-list: 01「GitHub Copilot」/sub「安価・手軽・IDE網羅」、02「Cursor」/sub「最もAIネイティブなエディタ」、03「Claude Code」/sub「強い計画力・巨大コンテキスト」、04「Codex（今日）」/sub「OpenAI連携・大規模refactorと非同期に強い」
  - `note-line`: 「優劣でなく用途。多くのプロは併用する」

- [ ] **Step 4: s17（まとめ・ok、tg-rule-list）追加**
  - `tg-corner tl ok` / `tg-corner br ok`、`tg-tag ok`＝`SUMMARY / 持ち帰る3つ`
  - headline（大きめ clamp(38px,5.2vw,72px)）: `今日<span class="ok">持ち帰る3つ</span>`
  - tg-rule-list:
    - RULE/01 text「Codexは“操作する”AI」 sub「// 画面で話すAIでなく、PCを操作する」
    - RULE/02 text「安全＝壁＋チャイム」 sub「// サンドボックス(壁)と承認(チャイム)・ネットは既定オフ」
    - RULE/03 text「小さく頼んで差分を読む」 sub「// 秘密は渡さない・正解は配らない」
  - `note-line`: 「次の一歩 — IDE拡張 / AGENTS.md / クラウド委任」

- [ ] **Step 5: ブラウザ確認（全17枚通し）**：→/← と数字キーで全17枚を巡回。`#ctr` 最終 `17 / 17`、`#bar` が右端まで。各スライド縦オーバーフロー無し。

- [ ] **Step 6: 構造確認（grep）**：`class="slide` の出現が **17**（cover の `slide active tech-grid` 含む）、`id="s17"` 存在。

- [ ] **Step 7: コミット**
```bash
git add slides/codex/index.html
git commit -m "Codexデッキ: 段4-5（会社の約束・講師デモ・まとめ）追加・全17枚完成"
```

---

## Task 6: handbook.html（作業ガイド）

**Files:**
- Create: `slides/codex/handbook.html`
- Reference: `slides/llm-basics-2/handbook.html`（print指向の構造・`.callout/.callout.warn/.callout.tip`・`.prompt`・`.qa`・`.principles`・TOC をそのまま流用）

**Interfaces:** Produces: ポータルからリンクされる単一HTML作業ガイド。

- [ ] **Step 1: 雛形作成**：llm-basics-2/handbook.html の `<head>`〜`<style>`〜`<header>`〜`<nav class="toc">` を流用。header の `doc-tag`＝`G-HOLDINGS AI 研修 / 第4回 / 作業ガイド`、`h1`＝`Codex を使ってみよう`、`doc-subtitle`＝`インストール・プロンプト集・困った時・講師チェックリスト`。

- [ ] **Step 2: §1 インストール（フル手順）**
  - PowerShellワンライナー（推奨・Node不要）を `.prompt` で:
    `powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"`
  - 代替: `.prompt` に `npm install -g @openai/codex`（Node.js LTS 22+ が必要・**スコープ名**）と `winget install --id OpenAI.Codex`。
  - `.callout.warn`（label ⚠️よくある間違い）: 「`npm i -g codex`（スコープ無し）は無関係の別物。`winget install Codex -s msstore` はGUI**アプリ**で今日のCLIとは別。」
  - 確認: `codex --version`。

- [ ] **Step 3: §2 サインイン**
  - 手順 ol: `codex` 起動 → 「Sign in with ChatGPT」→ ブラウザでログイン → `/status` 確認。`codex login` / `codex login --device-auth`（ブラウザ無し端末）。
  - `.callout.warn`（label ⚠️APIキー）: 「APIキーは従量課金。今日は使わない。`%USERPROFILE%\.codex\auth.json` はパスワード扱い、共有・コミット禁止。」

- [ ] **Step 4: §3 コピペ用プロンプト集**（各 `.prompt`、`prompt-label` 付き）
  - Read Only 3種: 「このフォルダは何をするか初心者向けに説明して」「このファイルを1行ずつ日本語でコメントして」「このエラーの意味と直し方をやさしい日本語で説明して」
  - 売上→集計→レポートの**3呪文**（スペック §4 確定文を逐語）。
  - （任意）事務自動化: 「（使い捨てフォルダで）.jpg を日付順に vacation-001… にリネームして実行。標準ライブラリのみ」
  - `.callout.tip`（label net-off の鉄則）: 「全プロンプトに『単一HTML・標準ライブラリのみ・外部CDN/インストール禁止』を添える。事前導入済みの openpyxl/pandas は使ってよい。」

- [ ] **Step 5: §4 困った時（トラブルシュート）** — `.qa` か `ul`:
  - サインインできない → 隣とペア／講師画面。Go/Plus/少額APIキーは保険。
  - 枠が切れた → `/status` で確認、`/compact` で履歴圧縮、軽い質問は別モデル。
  - コマンドが弾かれる → サンドボックス制約。使い捨てフォルダ＋Auto で。
  - 変なパッケージを作った → 実在を疑う、入れない。
  - Excelが作れない → `python -c "import openpyxl"` が通るか（講師に申告）。

- [ ] **Step 6: §5 スラッシュ早見表** — `ul`/表: `/status` `/approvals` `/model` `/review` `/diff` `/init` `/compact` `/resume` `/quit`。`.callout`（label ヒント）: 「ラベルは版で変わる。`/` を打って出る一覧を信頼。」

- [ ] **Step 7: §6 当日朝の講師チェックリスト** — `ul`:
  - 無料アカウントで `codex` サインインが通るか（1台で実機）
  - `/status` の枠表示
  - 既定モデル名（`/model`）
  - 価格/上限（chatgpt.com/pricing・/codex/pricing の日本円）
  - **`python -c "import openpyxl, pandas"` が通るか**
  - サンドボックスでスクリプト実行が通るか（ネット不要でも弾かれないか）
  - `footer`＝`G-Holdings AI 研修 — 第4回 — Codex を使ってみよう — 作業ガイド`、TOC を6項目に更新。

- [ ] **Step 8: ブラウザ確認**：`http://localhost:8765/slides/codex/handbook.html`。TOC・各セクション・`.prompt`/`.callout` が表示、リンクアンカーが効く。コマンド/プロンプトが**逐語正確**（特に install ワンライナーと `@openai/codex`）。

- [ ] **Step 9: コミット**
```bash
git add slides/codex/handbook.html
git commit -m "Codex: 作業ガイド(handbook)追加"
```

---

## Task 7: ポータル(index.html)に SERIES 05 追加

**Files:** Modify `index.html`（ルート）

**Interfaces:** Consumes: `slides/codex/index.html`, `slides/codex/handbook.html`。

- [ ] **Step 1: SERIES 05 セクション追加**：SERIES 04（ChatGPT API）の `</section>` 直後に、`<section class="series accent">` を追加。
```html
<section class="series accent">
  <div class="series-header">
    <span class="series-tag">SERIES / 05</span>
    <h2 class="series-title">Codex を使ってみよう</h2>
    <span class="series-meta">1 DECK + HANDBOOK / 60 MIN</span>
  </div>
  <div class="deck-grid">
    <a href="slides/codex/" class="deck-card">
      <span class="corner-mark tl"></span><span class="corner-mark br"></span>
      <p class="deck-num">DECK / 第4回 / JP</p>
      <p class="deck-title">Codex を使ってみよう</p>
      <p class="deck-desc">操作するAI / 安全に使う・売上Excel→レポート — 17スライド / 60分</p>
      <span class="deck-arrow">→</span>
    </a>
    <a href="slides/codex/handbook.html" class="deck-card">
      <span class="corner-mark tl"></span><span class="corner-mark br"></span>
      <p class="deck-num">HANDBOOK / 第4回 / JP</p>
      <p class="deck-title">Codex — handbook</p>
      <p class="deck-desc">導入手順・プロンプト集・講師チェックリスト</p>
      <span class="deck-arrow">→</span>
    </a>
  </div>
</section>
```

- [ ] **Step 2: ヘッダーのカウント更新**：`portal-divider` の `3 SERIES / 9 DECKS` を実数に更新（SERIES 05・カード2枚追加後の値。現状9→11デッキ、3→4 or 表記方針に合わせ `5 SERIES / 11 DECKS`）。`portal-subtitle` はそのままでよい。
  - 注: 既存テキストが実態とズレている場合があるため、ファイルの現値を読んで `+1 series / +2 decks` で機械的に更新する。

- [ ] **Step 3: ブラウザ確認**：`http://localhost:8765/`。SERIES 05 が青系で表示、カード2枚のリンクが各ページに飛ぶ。ホバーで矢印/枠が出る。ヘッダーのカウントが新値。

- [ ] **Step 4: コミット**
```bash
git add index.html
git commit -m "ポータル: SERIES 05（Codex）を追加"
```

---

## Task 8: 最終検証（オーバーフロー・通し・リンク）

**Files:** 必要に応じて `slides/codex/index.html` を微調整（font-size/padding のみ）

- [ ] **Step 1: プレゼン解像度で全17枚スクショ**：ブラウザを 1280×720 と 1920×1080 で、s1→s17 を順に表示しスクショ。各スライドで**フッターに被らない・縦スクロール無し**を確認。はみ出すスライドのみ `headline` を一段小さく／`num-list` の余白調整（既存デッキと同じ手当て）。

- [ ] **Step 2: 内容の事実確認**：`@openai/codex`、install ワンライナー、`/status` `/approvals`、「MAX表記が無い（最上位=Pro）」、価格の生数値が焼かれていないこと、を grep で確認。

- [ ] **Step 3: リンク確認**：ポータル→デッキ→handbook の往復、`design-system.html` フッターリンク不変。

- [ ] **Step 4: サーバ停止**（バックグラウンドのhttp.serverを終了）。

- [ ] **Step 5: 微調整があればコミット**
```bash
git add slides/codex/index.html
git commit -m "Codexデッキ: オーバーフロー微調整"
```

---

## Self-Review（spec照合）

- **17枚 / 段構成**: Task1–5 が s1–s17 を網羅（つかみ2・段1×3・段2×4・段3×4・段4×2・段5×2＝17）。✓
- **方向性B（安全先行）を“手で”**: s5→s6（安全2層）→s7/s8（実習）→s9（承認）の順で、安全概念→体験を実装。✓
- **Excelパイプライン**: s10（net-off理由）→s11（生成・集計）→s12（レポートHTML・ブラウザ表示）。プロンプトは spec §4 逐語。✓ openpyxl/pandas 事前導入・インラインSVG/CDN禁止を s10/s11/s12 と handbook §3 で一貫。✓
- **MAX→Pro**: s15 note・handbook で「最上位（Pro）」。価格生数値はスライドに無し（s13/handbook で「当日確認」）。✓
- **handbook 7セクション**＋当日朝チェックリスト（`import openpyxl,pandas` 含む）: Task6。✓
- **ポータル登録**: Task7。✓
- **検証**: 自動テスト不在のため browser＋grep に翻訳（各タスク末＋Task8）。✓
- **Placeholder scan**: 逐語コピー・実コマンドを各ステップに記載、TBD無し。✓
- **クラス整合**: 使用クラスは pres.css / tech-grid.css 実在（num-list/vs-wrap/callout/tg-code-block/tg-rule-list/tg-tag/tg-corner）＋デッキ内 `.duo`・`.note-line` のみ新規定義。✓
- スコープ外（COM Excel）は不実装。✓
