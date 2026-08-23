# EuraPay - 專案架構文件

## 📋 專案概述

EuraPay 是一個多人共享記帳應用，使用 React + Firebase 技術棧，支援使用者認證和實時資料同步。

## 🗂️ 目錄結構

```
EuraPay/
├── .github/
│   └── workflows/
│       └── deploy.yml                 # GitHub Actions 自動部署配置
│
├── public/
│   └── index.html                     # HTML 入口檔案
│
├── src/
│   ├── App.jsx                        # 主應用元件（路由：登入/儀表板）
│   ├── index.jsx                      # React 應用入口點
│   ├── index.css                      # 全域樣式
│   │
│   ├── components/                    # React 可重用元件
│   │   ├── LoginForm.jsx              # 使用者登入表單
│   │   ├── BalanceCard.jsx            # 結餘雙卡（每人一張）
│   │   ├── ExpenseForm.jsx            # 新增帳目表單
│   │   └── ExpenseList.jsx            # 帳務紀錄（結清後可收合）
│   │
│   ├── config/
│   │   └── firebase.js                # Firebase 初始化和認證 API
│   │
│   ├── pages/
│   │   └── Dashboard.jsx              # 儀表板頁面
│   │
│   ├── services/
│   │   └── sheetService.js            # Firebase Realtime Database 業務邏輯
│   │
│   └── utils/
│       └── balance.js                 # 結餘計算（全站唯一來源）
│
├── .env.local                         # 本地環境變數（Git 忽略）
├── .gitignore                         # Git 忽略檔案
├── package.json                       # 專案依賴和腳本配置
├── package-lock.json                  # 依賴版本鎖定
├── tailwind.config.js                 # Tailwind CSS 配置
└── build/                             # 生產構建輸出（自動生成）
```

## 🔧 核心技術棧

| 技術 | 用途 |
|------|------|
| **React 18** | 前端 UI 框架 |
| **Firebase** | 後端服務（Authentication + Realtime Database） |
| **Tailwind CSS** | 樣式框架 |
| **GitHub Pages** | 靜態網站託管 |
| **GitHub Actions** | CI/CD 自動部署 |

## 🔐 認證流程

### 登入流程
1. 使用者在 `LoginForm.jsx` 輸入使用者名稱和密碼
2. 使用者名稱只做本地比對（必須是 `Elmo` 或 `Eura`），**不參與認證**
3. 密碼連同 `REACT_APP_SHARED_EMAIL` 送給 Firebase Authentication 驗證
4. 驗證成功後取得 auth token，即可存取 Realtime Database
5. 畫面切換由 `App.jsx` 的 `onAuthStateChanged` 接手，不靠 callback

**重要**：兩人共用**同一個** Firebase 帳號（`REACT_APP_SHARED_EMAIL`），
密碼也只有一組。使用者名稱純粹是本地身分標記，用來顯示目前登入者與帳目的
`createdBy`，任何人都能填任一個名字 —— 它不是權限邊界。

### 「你是誰」的判定（`viewer`）
1. `LoginForm.jsx` 登入成功前，先把正規化後的名字寫入
   `localStorage.eurapay_member`
2. `App.jsx` 的 `readViewer()` 讀出來，經 `normalizeMember()` 轉回
   `'Elmo'` / `'Eura'`，找不到則為 `null`
3. 用於標題列右上角顯示目前登入者，以及新增帳目／結清時的 `createdBy`

畫面上不會用「你」稱呼登入者 —— 一律直接顯示名字。

舊 key `eurapay_username` 已停止讀取。它可能存著寫入順序修正前留下的
錯誤名字，沿用會把 `createdBy` 記到錯的人身上；改用新 key 後，既有工作
階段會被視為「未知」（`viewer` 為 `null`）而不是「錯誤」，下次登入自動
補上，使用者不需要手動登出重登。

⚠️ **寫入必須早於 `loginUser()`**。Firebase 的 `onAuthStateChanged` 會在
登入完成當下就觸發，若寫入晚於登入，`App` 會讀到上一次登入留下的名字，
造成「你」顯示在另一個人身上（已於 `2bf191f` 修正，改動時勿還原順序）。
`viewer` 為 `null` 時 UI 會退回顯示雙方名字，不會出錯。

### Firebase 規則
```json
{
  "rules": {
    "expenses": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    ".read": false,
    ".write": false
  }
}
```
- 只有認證使用者（`auth != null`）才能讀寫
- 未認證用戶無法存取任何資料

## 💾 資料結構

### Firebase Realtime Database
每筆帳目各自佔一個 push key，新增時只寫入自己那一個節點，不會動到其他帳目。

```
eurapay-{project-id}-default-rtdb/
└── expenses/
    ├── {pushKey1}: {                  # 一般帳目
    │   "type": "EXPENSE",
    │   "paidBy": "Elmo" | "Eura",     # 誰付的錢
    │   "createdBy": "Elmo" | "Eura",  # 誰記的帳（選填，見下方說明）
    │   "description": "午餐",
    │   "amount": 500,                 # 帳目全額（整數）
    │   "splitType": "full" | "split", # split 表示兩人平分
    │   "timestamp": "ISO_8601_timestamp"
    │ }
    ├── {pushKey2}: {                  # 結算紀錄
    │   "type": "CLEAR",
    │   "createdBy": "Elmo" | "Eura",  # 誰按的結清（選填）
    │   "description": "Eura 支付 Elmo $200",
    │   "amount": 200,                 # 實際轉帳金額（已取整）
    │   "timestamp": "ISO_8601_timestamp"
    │ }
    └── {pushKeyN}: { ... }
```

**相容性**：早期資料的 key 是 `Date.now()` 且帶有 `id` 欄位，讀取時
`id` 會沿用、沒有的則以 push key 補上；排序一律依 `timestamp`，不依賴
key 的排序規則。`createdBy` 是後來才加的，舊紀錄沒有這個欄位，UI 會
略過不顯示。

**關於 `createdBy`**：值來自登入時存進 `localStorage.eurapay_member`
的名字。兩人共用同一個 Firebase 帳號，所以這是**自己申報**的身分、
沒有經過驗證，僅供辨識參考，不參與任何金額計算。若 localStorage 沒有
值（例如瀏覽器清過資料），寫入時就不會帶上這個欄位。

## 🧮 結餘計算規則

1. **全額記帳（`splitType: 'full'`）**：付款人代墊全額，對方欠全額。
2. **平分（`splitType: 'split'`）**：對方只欠一半，計算時取
   `amount / 2`。25 元平分即為 12.5，**不做逐筆四捨五入**。
3. **結清（`type: 'CLEAR'`）**：只是附加一筆結算紀錄，不刪除任何帳目。
   結餘只計算**最近一次結清之後**的帳目，所以結清後餘額歸零、新帳目從
   0 重新累計，歷史則完整保留可回溯。
4. **個人淨額**：`getMemberBalances()` 由 `calculateBalance()` 推導，
   收款方為正（應收）、付款方為負（應付），兩人相加恆為 0。**不另寫
   一套計算**，避免兩處算法不一致 —— 這正是最初結清金額算錯的原因。
5. **取整時機**：畫面上顯示精確值（含 `.5`），只有在結清產生 CLEAR
   紀錄時對總額 `Math.round()` 一次，作為實際轉帳金額。逐筆取整會累積
   誤差，所以只取一次。

## 🔄 資料流

```
LoginForm (使用者輸入)
    ↓
firebase.js (loginUser 認證)
    ↓
Firebase Authentication (驗證)
    ↓
App.jsx (onAuthStateChanged 監聽登入狀態)
    ↓
sheetService.js (subscribeExpenses 訂閱 onValue)
    ↓
Firebase Realtime Database ←──┐
    ↓                          │ addExpense / addSettlement
App.jsx (expenses state)       │ 以 push() 單筆寫入
    ↓                          │
Dashboard ─→ utils/balance.js  │
    ↓        (calculateBalance) │
BalanceCard / ExpenseList      │
    ↓                          │
ExpenseForm ───────────────────┘
```

寫入後不需要手動重新載入：`onValue` 會把變動推回來，另一台裝置新增的
帳目也會即時出現。

## 🚀 部署流程

### GitHub Actions 自動部署 (deploy.yml)
1. **觸發條件**：推送到 main 分支
2. **執行步驟**：
   - 簽出代碼
   - 安裝 Node.js
   - 安裝依賴：`npm install`
   - 構建：`npm run build`（注入環境變數）
   - 上傳構建檔案到 GitHub Pages
   - 自動部署

### 必需的 GitHub Secrets
所有敏感的 Firebase 設定和應用密鑰應存放在 GitHub Secrets 中，不應硬寫在代碼：
```
REACT_APP_FIREBASE_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN
REACT_APP_FIREBASE_PROJECT_ID
REACT_APP_FIREBASE_DATABASE_URL
REACT_APP_FIREBASE_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID
REACT_APP_SHARED_EMAIL
```

## 🔑 環境變數管理

### .env.local (本地開發 - Git 忽略)
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_DATABASE_URL=your_db_url
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_SHARED_EMAIL=shared_firebase_email
```

**重要**：`.env.local` 不應提交到 Git（已在 .gitignore 中）

## 📝 核心檔案說明

### src/App.jsx
- 主應用程式入口
- 處理認證狀態管理（`onAuthStateChanged`）
- 根據認證狀態顯示登入頁面或儀表板
- 管理登入/登出邏輯

### src/components/LoginForm.jsx
- 使用者登入表單 UI
- 呼叫 firebase.js 的 `loginUser` 函數進行認證
- 錯誤訊息處理（通用訊息，不洩露詳細資訊）

### src/config/firebase.js
- Firebase 初始化配置
- 匯出的主要函數：
  - `loginUser(username, password)`：使用者認證
  - `logoutUser()`：登出
  - `auth` 和 `database` 物件：供其他模組使用

### src/services/sheetService.js
- 與 Firebase Realtime Database 互動
- 主要函數：
  - `subscribeExpenses(onChange, onError)`：以 `onValue` 訂閱帳務變動，
    回傳取消訂閱的函式；每次收到資料會同步寫入 localStorage 備份
  - `addExpense(expense)`：以 `push()` 單筆新增
  - `addSettlement(settlement)`：以 `push()` 附加一筆結算紀錄
- **不提供整包覆寫的 API**。歷史上曾用 `remove()` + `set()` 重寫整個
  `expenses` 節點，兩人同時記帳時後寫的人會蓋掉前一筆，且兩個操作之間
  有資料為空的窗口 —— 改成單筆 `push()` 後這兩個問題都不存在。

### src/utils/balance.js
- 結餘計算與成員相關邏輯的唯一來源，UI 各處共用，避免兩邊各算一套
- 常數：
  - `MEMBERS`：`['Elmo', 'Eura']`
  - `MEMBER_EMOJI`：人物識別用的 emoji 對照
  - `SETTLEMENT_TYPE`：`'CLEAR'`
- 金額計算：
  - `calculateBalance(expenses)`：回傳 `{ debtor, creditor, amount, label }`
  - `getMemberBalances(expenses)`：回傳每人的簽名淨額，正為應收、負為應付
  - `getSharedAmount(expense)`：平分帳目回傳一半金額
  - `buildSettlementRecord(expenses)`：產生 CLEAR 紀錄，金額取整
- 結清區間：
  - `getActiveExpenses(expenses)`：最近一次結清之後、仍在計算中的帳目
  - `getLastSettledAt(expenses)` / `isSettled(expense, lastSettledAt)`
  - `groupBySettlement(expenses)`：依結清紀錄把帳目切段，最後一段為當期。
    會先依 `timestamp` 排序，不依賴傳入順序
- 顯示與成員：
  - `formatAmount(amount)`：整數不補小數、`.5` 保留
  - `normalizeMember(name)`：任意大小寫轉回正式成員名，非成員回 `null`

### src/pages/Dashboard.jsx
- 儀表板主頁面：結餘雙卡、操作按鈕、帳務紀錄
- 結餘一律取自 `utils/balance.js`，不自行計算
- 「新增帳目」為唯一主要動作；「結清帳務」為次要樣式，餘額為 0 時停用

### src/components/BalanceCard.jsx
- 左右兩張卡，每人一張，顯示簽名後的淨額（`+` 應收 / `−` 應付）
- 兩張卡一律顯示成員名字，不標記「你」
- 已結清時兩張皆為 `$0` 並標示「已結清」（零沒有正負號可用，這個狀態
  必須靠文字表達）
- 並排在 400px 寬度下仍可讀，因此不做窄螢幕堆疊 —— 並排比較本身就是
  這個版面的目的

### src/components/ExpenseList.jsx
- 每筆紀錄分兩層：**帳務內容**（名目、金額、誰付款、分攤方式）與
  **建檔 log**（誰記錄、何時記錄），以分隔線區隔。log 一律顯示，不做
  條件判斷；`RecordMeta` 元件供帳目與結清紀錄共用
- 結清紀錄同時是該次結清明細的**收合開關**（預設收起），沒有明細時
  不顯示箭頭。因此畫面長度不隨歷史線性成長，暫時不需要分頁

## 🎨 設計系統

色票定義於 `tailwind.config.js`，語意色刻意選用與奶茶同色溫的暖色，
不使用 Tailwind 預設的 green / red / yellow（色相偏冷，與主題不搭）。

| 色票 | 用途 |
|------|------|
| `milktea` 50–950 | 主色。背景、卡片邊框、按鈕、文字 |
| `matcha` 50–900 | 已結清、應收、正向狀態 |
| `clay` 50–900 | 應付、錯誤、警示 |

**文字階層**（小字對比是這個主題最容易踩的坑）：

| 層級 | 色階 | 用途 |
|------|------|------|
| 主要 | `milktea-950` | 帳目名稱、金額、標題 |
| 標籤／按鈕 | `milktea-900` | 表單標籤、次要按鈕文字 |
| 次要小字 | `milktea-800` | 時間、建檔 log、說明文字 |
| 裝飾／邊框 | `milktea-100`–`600` | **不可用於文字** |

`milktea-600`（#c49060）在白底上的對比僅約 2.6:1，遠低於 4.5:1 的
可讀標準 —— 早期版本大量用它做小字，導致時間與標籤幾乎讀不到。同理，
標題列不再使用 `milktea-600` 底配白字。

**其他約定**：卡片 `rounded-2xl`、按鈕與輸入框 `rounded-lg`；陰影收斂
為 `shadow-sm` 搭配 `ring-1`；金額一律 `tabular-nums` 以對齊；emoji
只保留品牌 🍵 與人物識別 🤡 😺，不作裝飾用途。

## 🔒 安全性最佳實踐

1. **敏感資訊管理**：
   - 所有 API keys 存在環境變數（不硬寫在代碼）
   - GitHub Secrets 用於 CI/CD
   - `.env.local` 在 .gitignore 中

2. **使用者認證**：
   - Firebase Authentication 處理密碼加密和儲存
   - 不應在前端儲存密碼
   - 登入失敗訊息應為通用訊息，不洩露有效帳號資訊

3. **資料庫安全**：
   - Firebase 規則要求認證（`auth != null`）
   - 未認證用戶無法存取任何資料
   - 所有讀寫操作都需要有效的 auth token

4. **版本控制**：
   - 定期使用 `git filter-repo` 清除敏感資訊洩露
   - 檢查 git 歷史中是否有機敏資訊

## 🛠️ 本地開發

### 安裝依賴
```bash
npm install
```

### 啟動開發伺服器
```bash
npm start
```
存取 http://localhost:3000/EuraPay

### 構建生產版本
```bash
npm run build
```

## 📱 典型使用者流程

### 首次使用
1. 進入應用 → 看到登入頁面
2. 輸入有效的帳號和密碼
3. 點擊登入，Firebase 驗證
4. 驗證成功後進入儀表板

### 日常操作
- **新增帳目**：點擊「新增帳目」，填寫金額、項目、付款人與分攤方式
- **查看結餘**：左右兩張卡各自顯示該成員的應收／應付淨額
- **結清帳務**：附加一筆結算紀錄，把當期歸零，歷史帳目保留並收合起來
- **查看歷史**：點擊結清紀錄可展開該次結清的明細
- **登出**：點擊右上角登出結束工作階段

## 📊 應用特性

1. **多人協作**：多個使用者可以共享同一個記帳紀錄
2. **實時同步**：以 `onValue` 訂閱 Firebase Realtime Database，另一台
   裝置的變動會即時反映，不需重新整理
3. **自動部署**：GitHub Actions 自動構建和部署到 GitHub Pages
4. **離線備份**：每次同步都會把資料寫入 localStorage。連線失敗時會顯示
   「顯示的是本地備份資料」的警告並停止寫入，避免把過時的快取推回
   Firebase
5. **建檔紀錄**：每筆帳目與結清都記下是誰填寫的（`createdBy`），與帳務
   內容分層顯示，一律保留不做條件判斷
6. **歷史可回溯**：結清不刪除任何帳目，已結清的明細收合在結清紀錄底下
7. **響應式設計**：使用 Tailwind CSS 支援多設備

## 🔄 Git 相關

### 敏感資訊管理
- 使用 `.gitignore` 排除敏感檔案
- 定期檢查 git 歷史中是否有洩露的機敏資訊
- 如有洩露，使用 `git filter-repo` 清除

### 標準工作流程
```bash
git add .
git commit -m "descriptive message"
git push origin main
```
推送會自動觸發 GitHub Actions 部署

## 📞 維護注意事項

1. **定期更新依賴**：檢查安全漏洞和新版本
2. **監控 Firebase 配額**：確保未超過免費層限制
3. **檢查 GitHub Actions 日誌**：部署失敗時查看詳細錯誤
4. **備份重要資料**：定期導出 Firebase 資料
5. **監控成本**：Firebase 超免費層後會產生費用

