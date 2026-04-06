# google-search skill

在 Claude Code 裡直接搜尋網路，不用離開對話。輸入問題，Gemini 幫你找資料、整理來源、附上原文引用。

## 安裝

### 1. 安裝 Gemini CLI

```bash
npm install -g @google/gemini-cli
```

安裝完之後跑一次登入：

```bash
gemini
```

首次執行會跳出 Google 帳號授權，完成後 credentials 會存在本機，之後不用再登入。

### 2. 複製設定檔

把這個 repo 的以下幾個東西複製到你的環境：

| 來源                       | 放到哪裡              | 用途                             |
| -------------------------- | --------------------- | -------------------------------- |
| `GEMINI.md`（repo 根目錄） | 同樣放在 repo 根目錄  | 告訴 Gemini 這個 repo 的行為規則 |
| `.gemini/policies/`        | `~/.gemini/policies/` | 允許 Gemini 呼叫搜尋和網頁工具   |

> 少了 `GEMINI.md` 或 `.gemini/policies/`，Gemini 每次呼叫工具都會跳出確認視窗，或直接拒絕執行。

---

## 使用方式

### 手動觸發（預設）

```
/google-search "你的查詢"
```

### 讓 Claude 在對話中自動觸發

預設這個 skill 是手動觸發的（`disable-model-invocation: true`）。如果你想讓 Claude 在對話裡判斷什麼時候該搜尋網路並自動啟用，移除 `SKILL.md` frontmatter 裡的這行：

```yaml
disable-model-invocation: true
```

移除後，Claude 看到像「幫我查一下...」、「最新的...是什麼」這類需要即時資訊的問題，就會自動呼叫這個 skill，不需要手動下 `/google-search`。

---

## 設計決策與 Trade-off

### GEMINI.md 全域特化 vs. subagent 隔離

這個 skill 預設走 **GEMINI.md 全域設定**，讓 Gemini 主 agent 直接呼叫搜尋工具，而不是委派給獨立的 subagent。

| 方式                         | 平均回應時間 | 說明                                                     |
| ---------------------------- | ------------ | -------------------------------------------------------- |
| subagent（`@research-only`） | ~80 秒       | 主 agent → 委派 → subagent → tools，多一層 API roundtrip |
| GEMINI.md 直接呼叫 tools     | ~53 秒       | 主 agent 直接呼叫 tools，省掉委派開銷                    |

選擇 GEMINI.md 的原因是速度優先，省掉約 30 秒的 subagent 委派 overhead。

### 注意：GEMINI.md 會影響這個 repo 裡所有 Gemini 呼叫

`GEMINI.md` 放在專案根目錄時，**同一個 repo 下所有 Gemini session 都會吃到這份設定**，包括其他非搜尋用途的 Gemini 呼叫。這個 repo 的 `GEMINI.md` 目前把 Gemini 特化成 web search 專用。

如果你希望 Gemini 在這個 repo 裡保持通用能力、只有 `/google-search` 走受限的搜尋行為，建議改用 subagent 方式：

1. 在 `~/.gemini/agents/research-only.md` 定義 subagent
2. script 的 prompt 改成 `@research-only $QUERY`
3. 移除或清空 `GEMINI.md` 的搜尋限制

這樣 subagent 有自己獨立的 scope（temperature、max_turns、tools），不影響主 agent 的其他行為，代價是每次查詢多約 30 秒。
