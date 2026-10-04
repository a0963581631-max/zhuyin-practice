# GitHub Pages 上傳版本

這個資料夾已將原本 `index(1).html` 內的 Base64 圖片與音訊拆成獨立檔案，並將所有引用改為相對路徑。

## 資料夾結構

```text
index.html
.nojekyll
assets-manifest.json
assets/
  audio/
    shop-music.mp3
  images/
    home/
      home-01.jpg ... home-10.jpg
    reading/
      reading-01-elephant.png
      reading-02-hippo.png
      reading-03-tiger.png
      reading-04-butterfly.png
      reading-05-smile.png
```

## 上傳到 GitHub Pages

請把 **整個資料夾內的內容** 上傳到 repository 根目錄，不要只上傳 `index.html`。
GitHub Pages 首頁檔案必須維持名稱 `index.html`。

如果 repository 已經有舊版 `index.html`，請用這個新版取代；`assets` 資料夾需連同其中所有檔案一起上傳。
