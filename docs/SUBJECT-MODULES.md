# 資源班教學網站科目模組維護

保留單頁式網站及原有 `#` 導覽，由 `js/subject-loader.js` 載入科目 HTML 後才啟動 `js/app.js`。各科的原本元素 ID、頁面順序、JavaScript 邏輯都不變。

| 科目 | 教材畫面 | 程式 | 樣式 |
|---|---|---|---|
| 國語 | `subjects/chinese/page.html` | `js/reading.js`、`js/reading-quiz.js`、課文資料檔 | `css/chinese.css` |
| 注音 | `subjects/bopomofo/entry.html`、`subjects/bopomofo/activities.html` | `js/bopomofo.js`、`js/challenge.js`、筆順／詞彙與教學順序程式 | `css/bopomofo.css`、`css/bopomofo-layout.css`、`css/challenge.css` |
| 數學 | `subjects/math/page.html`、`sock-laundry.html` | `js/math.js` | `css/math.css`、`css/math-count30.css` |

共用檔：`index.html`（網站外框、首頁及幫助）、`js/app.js`（路由及功能載入）、`js/subject-loader.js`（插入科目畫面）、`css/site-base.css`、`css/site-portal.css`、`css/site-navigation.css`（共同樣式）、`js/teacher-tools.js`（共用工具）。

**維護原則：** 後續請優先更動目標科目的 HTML、JS、CSS，避免修改其他科目或共用檔。科目 HTML 只是片段，不要包含 `html`、`head` 或 `body` 標籤；保留 JavaScript 依賴的元素 ID。CSS 保留原來的覆寫順序，避免影響學生實際操作。

**測試：** `node tests/subject-modules.cjs`、`node --check js/subject-loader.js`；原有 `tests/performance.cjs` 需要 Playwright 與 Chromium。更新 `main` 會觸發 GitHub Pages 正式部署。
