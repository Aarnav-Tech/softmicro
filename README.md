# Microsoft Store Downloader

A clean, unofficial Microsoft Store downloader that lets you fetch official app packages directly from Microsoft servers — without using the Microsoft Store app.

---

## ✨ Features

- Extracts **official download links** for Microsoft Store apps  
- Supports **MSIX / APPX / bundle** packages  
- Groups files by **architecture** (x64 / arm64 / x86 / neutral)  
- Displays **file sizes** (when available)  
- Hides advanced files (blockmaps, metadata) behind a toggle  
- Clean, minimal **light / dark mode UI**

---

## 🧠 How it works

1. You paste a Microsoft Store app URL  
2. The app extracts the **Product ID**  
3. It queries Microsoft’s backend endpoints  
4. Downloadable package links are parsed and displayed  

All downloads happen **directly from Microsoft servers**.

---

## 🛠 Tech Stack

- **Next.js** (App Router)
- **React**
- **Tailwind CSS**
- Server-side API routes (Node.js)

---

## ⚠️ Disclaimer

This project is **unofficial** and is **not affiliated with Microsoft**.

- No files are hosted by this project  
- All downloads come directly from Microsoft-owned domains  
- This tool is provided for **convenience purposes only**
- Alternative for https://store.rg-adguard.net/

---

## 📌 Notes

- File sizes may take a moment to load  
- Some files may not report size due to CDN limitations  
- Advanced files are hidden by default to avoid clutter  

---

## 📄 License

MIT
