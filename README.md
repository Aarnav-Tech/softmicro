# Microsoft Store Downloader

A clean, unofficial Microsoft Store downloader that lets you fetch **official app packages directly from Microsoft servers** — without using the Microsoft Store app.

---

## ✨ Features

- Paste **any Microsoft Store link or Product ID**
- Extracts **official download links** from Microsoft
- Supports **MSIX / APPX / bundle** packages
- Groups files by **architecture** (x64 / arm64 / x86 / neutral)
- Displays **file sizes** (when available)
- Hides advanced files (blockmaps, metadata) behind a toggle
- **Shareable result URLs** (`?id=PRODUCTID`)
- Clean, minimal **light / dark UI** _(theme toggle WIP)_

---

## 🧠 How it works

1. You paste a Microsoft Store app link or Product ID  
2. The app extracts the **Product ID**  
3. It queries Microsoft’s delivery endpoints  
4. Downloadable package links are parsed and displayed  

All downloads happen **directly from Microsoft servers** — no files are proxied or hosted.

---

## 🛠 Tech Stack

- **Next.js** (App Router)
- **React**
- **Tailwind CSS**
- Server-side API routes (Node.js)

---

## 🔗 Supported Inputs

Examples of valid input:

- `https://apps.microsoft.com/detail/9NBLGGH4NNS1`
- `https://apps.microsoft.com/store/detail/spotify/9NBLGGH4NNS1`
- `https://www.microsoft.com/store/productId/9NBLGGH4NNS1`
- `9NBLGGH4NNS1` (Product ID only)

---

## ⚠️ Disclaimer

This project is **unofficial** and **not affiliated with Microsoft**.

- No files are hosted by this project
- All downloads come directly from Microsoft-owned domains
- Some Microsoft Store apps **do not expose downloadable installers**
- This tool is provided for **convenience and educational purposes**

Inspired by / alternative to: https://store.rg-adguard.net/

---

## 📌 Notes & Limitations

- File sizes may take a moment to load
- Some files may not report size due to CDN limitations
- Not all Store apps provide downloadable packages
- Advanced files are hidden by default to avoid clutter

---

## 📄 License

MIT
