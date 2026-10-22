# 載入與操作效能改善

本次以已部署版本 `af3f029` 為基準，保留教材、版面、作答與側邊工具操作。

## 量測方式與結果

執行環境的網路政策拒絕 GitHub Pages 正式網域（HTTP CONNECT 403），因此未取得正式網站的速度量測。以下使用同一部機器上的 Chromium，以本機 HTTP 提供各版本原始檔、文字資源 gzip 壓縮，模擬 820 × 1180 平板、150 ms 網路延遲、1.6 Mbps 下載及 CPU 四倍限速。各版本測試三個全新瀏覽器環境，每次再測一次保留 HTTP 快取的重複載入；採三次中位數。

| 項目 | 改善前 | 改善後 | 差異 |
| --- | ---: | ---: | ---: |
| 首次首圖顯示時間 | 4,228 ms | 1,416 ms | 減少約 67% |
| 首次傳輸量（至首圖顯示） | 786,309 bytes | 195,271 bytes | 減少約 75% |
| 首次內容繪製 FCP | 560 ms | 512 ms | 減少約 9% |
| 首次 DOMContentLoaded | 808 ms | 566 ms | 減少約 30% |
| 重複載入首圖顯示時間 | 498 ms | 381 ms | 減少約 23% |
| 重複載入傳輸量 | 78,145 bytes | 21,655 bytes | 減少約 72% |

「首圖顯示」是首頁背景圖片成功解碼並顯示的時間，不是 LCP，也不代表所有教學內容均已載入。快取標頭為本機量測伺服器設定，不能用來推論 GitHub Pages 的實際快取效果。這些結果不能保證每所學校或每部平板得到相同秒數。

原始量測資料見 [performance-results.json](performance-results.json)。需安裝 Playwright 並提供 `/usr/bin/chromium`，可用 `node tests/benchmark-load.cjs /path/to/version > results.json` 重現。比較版本時須使用相同程式、裝置與限速設定，並分別提供兩份完整專案。

## 做了哪些改善

1. **首頁圖片**：保留原圖，另產生 640、960、1600 像素寬的 WebP；依視窗寬度選擇適合的檔案，首圖預載與輪播共用同一個網址，避免重複下載。平板首圖由 689,982 bytes 降為 168,650 bytes。圖片只縮放與壓縮，不裁切、不更換內容。
2. **筆順同站載入**：37 個注音標準筆順保留原始檔案，固定至 g0v/zh-stroke-data 的 `16cb7fa33bfa5c1b8ff4c13a4909df0936b335b9`，放在 `assets/strokes/16cb7fa/`。`source.json` 記錄每檔 SHA-256，`SOURCE-README.md` 保留上游來源與著作權說明。資料來源包括教育部筆順資料，上游說明區分資料檔與其他程式檔；本專案為非營利資源班教學用途，未將資料檔宣稱為 CC0。
3. **筆順快取與可靠性**：記憶體共用同一個請求、版本化 localStorage 快取、檢查快取格式；不刪除舊快取與教師圖片資料。失敗可重試，過期載入結果不會覆蓋最新選擇。首次仍需從網站下載選中的筆順；這不是完整離線網站。
4. **按功能延後載入**：主 HTML 由 207,867 bytes 降為 77,879 bytes。首頁只需入口與輪播程式；側欄、注音、數學、國語課文、小測驗在進入相關頁面時初始化一次。載入期間阻止尚未準備好的教材操作，失敗顯示重試。快速換頁以目前網址為準，不會打開已離開頁面的教學對話框。
5. **課文圖片**：保留原有 `-fast.webp`；先顯示目前圖片，再低優先載入下一張，不因進入國語選單就下載整套課文。圖片與標紅座標尺寸維持一致。
6. **繪圖重用**：筆順播放第一幀建立 SVG 後，後續只改變遮罩進度，不反覆建立整棵 SVG。描寫區重用接觸層、筆跡與提示點；課文標紅快取每個音節的遮罩像素，重播不重複掃描相同區域。

## 新的實際修改位置

| 功能 | 程式位置 |
| --- | --- |
| 導覽、按需載入、失敗重試 | `js/app.js` |
| 首頁輪播 | `js/home-slideshow.js`；首圖選擇與預載在 `index.html` 頭部 |
| 注音、詞彙、筆順及書寫 | `js/bopomofo.js`；搭配 `teaching-order.js`、`compound-grid-practice.js`、`vocab-image-upload.js` |
| 共用語音與回饋 | `js/feedback.js` |
| 分與合 | `js/math.js` |
| 國語共用圖卡資料、閱讀、小測驗 | `js/reading-data.js`、`js/reading.js`、`js/reading-quiz.js` |
| 其他課文資料 | 原有 `lesson-scissors-rock-paper.js`、`lesson-tadpole-mom.js` |
| 側邊工具與畫記／框選放大 | `js/teacher-tools.js`、原有 `teacher-view-tools.js` |
| 襪子遊戲 | 原有 `sock-laundry.html`，首次進入該頁才設定 iframe 網址 |

`index.html` 仍保留各教材的 HTML 與既有樣式，避免本次同時重寫所有畫面。原有未引用檔案與歷史圖片未刪除；檔案總容量不是使用者每次開站的傳輸量。

## 驗證與限制

- `tests/performance.cjs`：37 檔來源雜湊、首頁未載入其他科目、同站筆順、壞快取、請求失敗重試、快速切頁、舊請求不覆蓋新符號、SVG 節點重用、課文目前／下一張載入與遮罩快取。
- `tests/teacher-view-tools.cjs`：既有畫記、框選放大、全螢幕、襪子遊戲、分合題、小測驗及模擬平板觸控回歸；描寫座標測試使用測試筆順資料，來源完整性另由前項檢查。
- 執行範例：`CHROMIUM_PATH=/usr/bin/chromium node tests/performance.cjs` 與 `CHROMIUM_PATH=/usr/bin/chromium node tests/teacher-view-tools.cjs`；環境需能載入 Playwright 套件。
- JavaScript 語法、資源路徑及差異範圍另行檢查。
- 尚未執行實體平板、Safari／Firefox、中文語音播放品質或學校網路的正式站測速。模擬觸控通過不等同實機通過。
- 教學功能第一次進入時會有小量按需載入；後續進入重用已初始化程式。未變更 GitHub Pages 部署流程、啟用自動合併或發布正式網站。

如需回復，可完整還原本次 PR 的提交；舊圖片與舊瀏覽器資料仍保留。
