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
│   │   ├── BalanceCard.jsx            # 帳單結餘卡片
│   │   ├── ExpenseForm.jsx            # 新增支出表單
│   │   └── ExpenseList.jsx            # 支出清單顯示
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
1. 使用者在 `LoginForm.jsx` 輸入帳號和密碼
2. 驗證邏輯：
   - 檢查帳號有效性
   - 將認證請求發送到 Firebase Authentication
3. Firebase 驗證成功後返回 auth token
4. 應用可以使用此 token 存取 Realtime Database

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

**關於 `createdBy`**：值來自登入時存進 `localStorage.eurapay_username`
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
4. **取整時機**：畫面上顯示精確值（含 `.5`），只有在結清產生 CLEAR
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
- 結餘計算的唯一來源，`Dashboard` 與結清流程共用，避免兩邊各算一套
- 主要函數：
  - `calculateBalance(expenses)`：回傳 `{ debtor, creditor, amount, label }`
  - `getActiveExpenses(expenses)`：最近一次結清之後、仍在計算中的帳目
  - `getLastSettledAt(expenses)` / `isSettled(expense, lastSettledAt)`
  - `getSharedAmount(expense)`：平分帳目回傳一半金額
  - `formatAmount(amount)`：顯示用，整數不補小數、`.5` 保留
  - `buildSettlementRecord(expenses)`：產生 CLEAR 紀錄，金額取整

### src/pages/Dashboard.jsx
- 儀表板主頁面
- 顯示收支結算、支出清單、操作按鈕
- 結餘一律取自 `utils/balance.js`，不自行計算

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
- **新增支出**：點擊「新增支出」，填寫支出表單
- **查看結餘**：BalanceCard 顯示各成員間的債務關係
- **結清帳務**：記錄清算交易
- **登出**：點擊登出按鈕結束會話

## 📊 應用特性

1. **多人協作**：多個使用者可以共享同一個記帳紀錄
2. **實時同步**：以 `onValue` 訂閱 Firebase Realtime Database，另一台
   裝置的變動會即時反映，不需重新整理
3. **自動部署**：GitHub Actions 自動構建和部署到 GitHub Pages
4. **離線備份**：每次同步都會把資料寫入 localStorage。連線失敗時會顯示
   「顯示的是本地備份資料」的警告並停止寫入，避免把過時的快取推回
   Firebase
5. **響應式設計**：使用 Tailwind CSS 支援多設備

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

