# Codex を使ってみよう（第4回）— 設計スペック

- 作成日: 2026-07-01
- 対象シリーズ: SERIES 05 / AI研修 第4回
- 成果物: `slides/codex/index.html`（デッキ17枚）＋ `slides/codex/handbook.html`（作業ガイド）＋ ポータル `index.html` にカード追加
- 言語: 日本語のみ（ネパール語併記版は今回は作らない。Read Only実習で「ネパール語で説明させる」体験のみ含む）

---

## 1. 目的・対象・制約

### 目的
新人エンジニア＋事務職＋ネパール語話者の混成チームが、**OpenAI Codex（コーディングエージェント）を"安全に・正しく"使い始められる**ようにする。1時間で、(1) Codex＝「自分のPCを操作するAI」だと理解し、(2) 安全の2層（壁＝サンドボックス／チャイム＝承認）を**自分の手で確かめ**、(3) 「飲食店の売上Excel → 集計 → HTMLレポートをブラウザ表示」という一気通貫のハンズオンを安全に完走する。

### 対象
- 新人エンジニア（コードに抵抗少）／事務職（非開発者・Excelが日常）／ネパール語話者（日本語＋ネパール語の補助が効く）
- 全員、**研修用に用意した端末**で実施。各自は**無料 ChatGPT アカウント**でサインインしてハンズオン。

### 講師
- 講師（資料作成者）は **ChatGPT 最上位プラン（Pro / いわゆる「MAX」相当）**。ハンズオン外の上級機能（クラウド委任・自動コードレビュー・並列エージェント・音声/画像入力・xhigh推論）をデモ可能。
- ⚠️ **「MAX」という名前のプランはOpenAIには存在しない**（MAXはAnthropic/Claudeの用語）。デッキ・handbookでは「講師＝最上位プラン(Pro)」と表記し混同を避ける。

### 方向性（確定）
- **B：安全・正しさ先行。** ただし「密度過多を避け、具体的・実用的に」を守るため、安全は**講義でなく"手で確かめて"教える**（承認 y/n の瞬間＝安全の授業）。理論を前に積み上げすぎない。
- 「困難そのものが学び」：正解HTML等は配らない。エラーは**読む・Codexに聞く・直す**。スターターで補助しすぎない（ただしCLIインストールは"学びの本体ではない配管"なので、handbookで正確な手順を渡す）。

### フレームワーク／デザイン制約
- 既存の `css/base.css` + `css/pres.css` + `css/tech-grid.css` を使用。`<div class="slide tech-grid">` ベース。
- 100vh固定スライド＋フッター進捗バー（`js/slide.js`）。`chatgpt-api/index.html` を構造の手本にする。
- 色セマンティクス：`bad`（赤＝注意/安全）/ `accent`（青＝実習・概念）/ `ok`（緑＝上級・まとめ）。
- 使用コンポーネント：`tg-corner` / `tg-tag` / `headline` / `num-list` / `body-text` / `callout` / `vs-wrap` / `tg-code-block` / `tg-rule-list` / `split` / `note-line` / `tg-meta`。
- `<meta name="robots" content="noindex, nofollow">` を付ける（chatgpt-api同様の非公開扱い）。

---

## 2. 調査に基づく確定事実（2026-06-30 ライブ取得）

> 出典は研究ブリーフ（`tasks/wj9e1hrv5.output`）。✅=高確度 / ⚠️=当日朝に要ライブ確認。

- ✅ Codex＝OpenAIのコーディングエージェント製品ファミリー。CLI / IDE拡張 / クラウド(Web) / デスクトップアプリの**4入口、同じChatGPTログイン**。2021年の旧Codex（補完）とは別物。
- ✅ 既定モデル **GPT-5.5**（初心者は既定のまま）。高推論は別SKUでなく `model_reasoning_effort`（最大 `xhigh`）。
- ✅ Windowsネイティブ（**WSL不要**）。インストール（いずれか1つ）:
  - PowerShellワンライナー（推奨・Node不要）: `powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"`
  - npm（Node.js LTS 22+ が必要・**スコープ名**）: `npm install -g @openai/codex`（`npm i -g codex` は無関係の別物 ← 罠）
  - winget（CLI用）: `winget install --id OpenAI.Codex`（`winget install Codex -s msstore` はGUI**アプリ**＝別物）
- ✅ 起動 `codex` → 初回サインイン。**「Sign in with ChatGPT」推奨**（ブラウザOAuth、追加課金なし）。**APIキーは使わない**（従量課金）。`codex login` / `codex login status` / `codex login --device-auth`。認証は `%USERPROFILE%\.codex\auth.json`（パスワード扱い）。
- ✅ 安全2層：**サンドボックス**（`read-only` / `workspace-write`＝既定 / `danger-full-access`）＝壁、**承認ポリシー**（`untrusted` / `on-request`＝既定 / `never`）＝チャイム。プリセット **Read Only / Auto / Full Access**、`/approvals` で切替。**ネットは既定オフ**。編集は **diff提示→y/n承認→適用**。`/diff` `/review`、行頭 `!` でワンショットshell。
- ✅ 主要スラッシュ：`/init` `/model` `/approvals` `/review` `/diff` `/status` `/compact` `/resume` `/quit`。⚠️ ラベルはバージョン依存 → `/` ピッカーを信頼。
- ✅ AGENTS.md＝「AIが実際に読んで従うREADME」。`/init` で雛形。
- ✅ 課金直感：トークン従量・**出力≈入力の6倍**・5時間ローリング枠＋週次キャップを **CLI/Web/IDEで共有**。無料枠は小さい→**1人1パイプライン（数ターン）に絞る**。
- ✅ 落とし穴：存在しないAPI/**npmパッケージを"それらしく"捏造**、頼んでいないファイルを編集、diff盲信。→ 触ったファイル・テストの実在を**人間がレビュー**。
- ✅ プライバシー：**消費者プラン(Free/Plus/Pro)は既定で学習に使われ得る**（設定でオプトアウト）。Business/Enterprise/Eduは既定で不使用。→ **本物の社内リポ・秘密・認証情報は渡さない**。
- ✅ 他ツール正直な棲み分け：Copilot＝安価/手軽・IDE網羅 / Cursor＝AIネイティブIDE / Claude Code＝プランニング＋巨大context / Codex＝OpenAIエコシステムの非同期エージェント、大規模refactorとハンドオフに強い。多くは併用。

### ⚠️ 当日朝にライブ確認する項目（数値はスライドに焼かない）
1. **無料アカウントの `codex` サインインが実機で通るか**（資料が割れている。最大リスク）
2. `/status` の無料枠の残量表示
3. 既定モデル名（命名が高速変動。`/model` で確認）
4. 価格/上限（`chatgpt.com/pricing`・`chatgpt.com/codex/pricing` の日本円表示）
5. ロックダウン/企業ポリシーでサンドボックス実行が通るか（**ネット不要のスクリプト実行すら**）
6. **`import openpyxl` / `import pandas` が通るか**（事前導入の検証）

---

## 3. 端末・教材の事前準備

### 研修用端末（事前セットアップ）
- Windows 11 推奨。
- **Codex CLI を事前インストール**（当日は配管に時間を使わない）。handbookにフル手順は収録（自宅再現・障害復旧用）。
- **Python（LTS）＋ `openpyxl` ＋ `pandas` を事前導入**。`python -c "import openpyxl, pandas"` が通ることを確認。
  - 理由：ネット既定オフでも、**事前導入済みパッケージは `import` できる**（インストールが要らないため成功）。これにより「本物の.xlsx生成・集計」をハンズオンで実現する。
- 各端末に**使い捨ての作業フォルダ**（例 `C:\codex-lab\`）を用意。空でよい（売上データはハンズオンで生成する）。
- 各自の無料アカウントでサインインできることを当日朝に1台で実機確認。

### 配布物
- handbook.html（Slack等で配布、ブラウザで開く）。
- サンプルの売上データは**配らない**（PRACTICE 03 ① で各自生成する）。

### フォールバック（無料サインイン不可・枠切れ時）
- 隣とペアで1台を共有 / 講師の投影画面に合わせて読む。
- 保険：各自 Go($8)/Plus($20)、または少額APIキー（$0.5–2/セッション）を事前に検討（handbookに明記、当日の必須ではない）。

---

## 4. スライド設計（17枚 / 約60分）

各スライドは `tech-grid`。`tg-tag` のラベルは英大文字＋日本語。色は下表。`PRACTICE` スライドは `accent`。

| # | id | tg-tag（ラベル） | 見出し（headline） | 主内容・コンポーネント | 色 | 時間 |
|---|---|---|---|---|---|---|
| 1 | s1 | `G-HOLDINGS AI 研修 / 第4回 / 2026` | **Codex を<br>使ってみよう** | カバー。`tg-divider-text`＝「実践 / 操作するAI / 60分」。`tg-meta`＝FILE / CODEX_HANDSON・17 SLIDES / 60 MIN | gray | つかみ |
| 2 | s2 | `PURPOSE / 今日のゴール` | 今日の**ゴール** | `num-list` 3項目：①Codex＝"操作する"AIを理解 ②安全の2層を**自分の手で**確かめる ③売上Excel→**レポートHTML**を安全に一気通貫で作る | gray | 1分 |
| 3 | s3 | `HOOK / まず一度、見る` | 「作って」で**物が生まれる** | 講師1分デモの台本。`callout accent`＝見るのは「**diffが出て y/n を押す瞬間**」。本文：強力＝だから今日はまず"安全に持つ"を学ぶ | accent | 4分 |
| 4 | s4 | `BASICS / Codexとは` | チャットの**"次"** | `split`＋図。話す(LLM)→コードから呼ぶ(API)→**操作する(Codex)**。4入口・同じログイン・旧Codexと別物・既定GPT-5.5。`note-line`＝きょう触るのはCLI（≠デスクトップアプリ） | accent | 段1 |
| 5 | s5 | `MINDSET / なぜ心構えが先か` | 速く強い＝**間違いも速い** | `body-text`＋`vs-wrap` か `num-list`：落とし穴予告（存在しないパッケージ捏造／diff盲信／頼んでないファイル編集）。だから先に安全のしくみ | bad | 段1 |
| 6 | s6 | `SAFETY / 安全の2層` | **壁**と**チャイム** | 2カラム：**壁＝サンドボックス**(Read Only/Auto/Full)／**チャイム＝承認**(y/n)。`callout bad`＝既定はフォルダ内書込可・**ネットは既定オフ**。比喩を明示 | bad | 段2 |
| 7 | s7 | `PRACTICE / 01 / サインイン＆確認 / 8 MIN` | まず**サインイン**して状態を見る | `num-list`：①作業フォルダで `codex` 起動 ②「Sign in with ChatGPT」→ブラウザ ③`/status` で枠と状態 ④APIキーは使わない。`note-line`＝詰まったら隣とペア/講師画面 | accent | 8分 |
| 8 | s8 | `PRACTICE / 02 / Read Onlyで説明 / 6 MIN` | 一番安全な**読むだけ** | `num-list`：①Read Onlyを確認 ②「このフォルダは何をする?」 ③「このファイルを1行ずつ日本語で」 ④「このエラーを**日本語とネパール語で**」。`callout accent`＝書き込まないので安心 | accent | 6分 |
| 9 | s9 | `APPLY / 差分→承認→適用` | 勝手に書かない。**diffを見てy/n** | `tg-code-block` 風に承認プロンプトを再現（`codex wants to edit report.html [y/n]`）。`/approvals` でAutoへ・`/diff`・`/review`。`note-line`＝承認して初めてファイルになる | bad | 段2 |
| 10 | s10 | `RULE / なぜ"その場インストール"は失敗するか` | ネット既定オフ＝**入れ直しは無理** | `vs-wrap`：❌その場でpip/npmが要るもの ／ ✅単一HTML（不要）・**事前に入れてある道具(openpyxl等)**。`callout accent`＝制限でなく安全設計。きょうの素材＝**飲食店の売上** | accent | 段3 |
| 11 | s11 | `PRACTICE / 03 / 売上Excelを作る・集計 / 9 MIN` | 売上**.xlsx**を生成→集計 | `num-list`：①「架空の飲食店の売上を3か月・日別・メニュー名/単価/数量入りで openpyxl で `sales.xlsx` に」 ②「`sales.xlsx`を読み、メニュー別・日別売上と売れ筋トップ5を新シート"集計"に（**コピーに**、openpyxlで）」。`callout accent`＝Autoに切替・diffを読む | accent | 9分 |
| 12 | s12 | `PRACTICE / 04 / レポートHTML化 / 9 MIN` | 集計を**ブラウザに出す** | `num-list`：③「集計を**棒グラフ（インラインSVG/canvas・外部CDN禁止）**とサマリー付きの単一HTML `report.html` にしてブラウザで開いて」。`callout ok`＝完成＝今日のゴール。余力で改造 | accent | 9分 |
| 13 | s13 | `COST / お金の直感` | 枠は**小さい・共有** | `token-layout` 風 or `num-list`：出力≈入力6倍・5時間枠はCLI/Web共有・無料枠は小さい→`/status`で残量、**無駄に回さない**。`note-line`＝具体値は当日公式で確認 | bad | 段3 |
| 14 | s14 | `RULES / 会社で正しく使う` | 渡してよい物・**だめな物** | `vs-wrap`：❌本物の社内リポ/秘密/認証情報 ／ ✅使い捨ての練習用。消費者プランは**既定で学習され得る→オプトアウト**。`callout bad`＝AGENTS.md＝AIが従うREADME（`/init`で恒久ルール） | bad | 段4 |
| 15 | s15 | `SHOWCASE / 講師デモ・伸びしろ` | 各自の枠の**先にある世界** | 講師(Pro)デモ台本：バグ入りPR→`@codex review`→`fix`／クラウド委任でPR自動作成／並列・音声・画像・`xhigh`。`note-line`＝無料枠では不可・これが伸びしろ | ok | 6分 |
| 16 | s16 | `COMPARE / 他ツールとの棲み分け` | 正直な**棲み分け** | `num-list` or カード：Copilot（安価/IDE）・Cursor（AIネイティブIDE）・Claude Code（巨大context）・Codex（OpenAI非同期・大規模refactor）。`note-line`＝多くは併用 | ok | 段5 |
| 17 | s17 | `SUMMARY / 持ち帰る3つ` | 今日**持ち帰る3つ** | `tg-rule-list`：①Codexは"操作する"AI ②安全＝**壁(サンドボックス)＋チャイム(承認)**・ネット既定オフ ③小さく頼んで**差分を読む**／秘密は渡さない。`note-line`＝次の一歩：IDE拡張 / AGENTS.md / クラウド | ok | 段5 |

時間配分の目安：つかみ5＋段1約8＋段2約16（実習01:8/02:6＋概念）＋段3約20（実習03:9/04:9＋コスト）＋段4約8（会社の約束＋講師デモ6）＋段5約5 ≒ 60分。ハンズオン計≈32分。各実習の直前に最小限の概念を置く。

### PRACTICE パイプライン（中心）— 確定プロンプト
1. **生成**：「架空の飲食店の売上データを作って。3か月分・日別で、メニュー名・単価・数量の列を入れて、`openpyxl` で `sales.xlsx` として使い捨てフォルダに保存して。」
2. **操作・集計**：「`sales.xlsx` を読んで、メニュー別売上・日別売上・売れ筋トップ5を集計し、新しいシート『集計』に書き出して。元データは壊さずコピーに対して、`openpyxl` で。」
3. **レポート化**：「『集計』の内容を、棒グラフ（**インラインSVGかcanvasで描画・外部CDNやライブラリは使わない**）とサマリー付きの単一HTML `report.html` にして、ブラウザで開いて。」

net-off前提の要点：①②は事前導入の openpyxl/pandas を使う（ネット不要）。③は**外部CDN禁止**＝グラフはインラインSVG/canvas（net-offの教えと一致）。すべてコピー/使い捨てフォルダ＋Autoで実行。

---

## 5. handbook.html（作業ガイド）

`llm-basics-2/handbook.html` の形式に倣う。セクション：
1. **フルインストール手順**：PowerShellワンライナー（推奨）＋npm/winget代替。**CLI≠デスクトップアプリ**の注意、`@openai/codex`スコープ名の罠。
2. **サインイン**：「Sign in with ChatGPT」手順、`codex login` / `--device-auth`、APIキーを使わない理由。
3. **コピペ用プロンプト集**：
   - Read Only：フォルダ説明／1行ずつ日本語コメント／エラーを日本語＋ネパール語で。
   - 売上→集計→レポートの**3呪文**（§4の確定文）。
   - （任意）事務自動化：使い捨てフォルダでファイル一括リネーム/整理（標準ライブラリのみ）。
   - 全プロンプトに **net-off配慮**（外部インストール不要・CDN禁止）を明記。
4. **詰まった時の対処**：サインイン不可／枠切れ（`/status`）／サンドボックスでコマンドが弾かれる／パッケージ捏造に気づいたら／CLIとアプリの取り違え。フォールバック（ペア/講師画面）。
5. **スラッシュ早見表**：`/status` `/approvals` `/model` `/review` `/diff` `/init` `/compact` `/resume` `/quit`（`/`ピッカーを信頼の注記）。
6. **安全チェックリスト**：使い捨てフォルダ・秘密を渡さない・消費者プランの学習オプトアウト手順・ネット無効のまま。
7. **当日朝の講師チェックリスト**：§2の⚠️6項目＋`import openpyxl, pandas`確認＋1台で無料サインイン実機確認。

---

## 6. ポータル統合

`index.html` に **SERIES 05** を追加（色は `accent`）：
- `series-title`＝「Codex を使ってみよう」、`series-meta`＝「1 DECK + HANDBOOK / 60 MIN」。
- カード2枚：`slides/codex/`（DECK / 第4回 / JP・「操作するAI / 17スライド / 60分」）と `slides/codex/handbook.html`（HANDBOOK / 第4回 / JP・「導入手順・プロンプト集・講師チェックリスト」）。
- ヘッダーの `portal-divider`（現「3 SERIES / 9 DECKS」）と `portal-subtitle` のカウントを更新。

---

## 7. スコープ外（やらないこと）

- 生きたExcel.exe操作（COM/pywin32）：サンドボックス制約で不安定・基本mac限定。今回は扱わない。
- ネパール語併記版デッキ（-ne）：今回は作らない（Read Only実習でネパール語説明体験のみ）。
- ネット/外部パッケージのインストールを伴うデモ（matplotlibのPNG、qrcode等）：ハンズオンに含めない（必要なら講師投影）。
- APIキー運用・function calling・MCP詳細：紹介のみ、深掘りしない。

---

## 8. 成功基準

- 参加者全員が、安全の2層を口頭で説明でき、Read Onlyで1回・Autoで承認を1回以上体験している。
- 大多数が `sales.xlsx` → 集計 → `report.html` をブラウザ表示まで到達（または講師画面で同等を確認）。
- 「秘密情報は渡さない」「ネットは既定オフ」「差分を読む」を持ち帰る3つとして言える。
- デッキは100vh内に収まりオーバーフローしない（tech-grid既知の調整点を踏襲）。

---

## 9. 出典

研究ブリーフ（`tasks/wj9e1hrv5.output`, 2026-06-30 ライブ取得）。主要一次情報：developers.openai.com/codex/{quickstart,cli,auth,windows,models,pricing,agent-approvals-security,prompting,config-reference} ・ github.com/openai/codex ・ help.openai.com（rate-card等）。価格/上限・無料枠・モデル名は変動が速く**当日要確認**。
