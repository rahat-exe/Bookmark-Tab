# Bookmark Tab

A minimal Chrome/Brave extension that replaces your new tab page with a beautiful, searchable grid of all your bookmarks.

![Bookmark Tab Preview](preview.png)

---

## Features

- **Grid layout** — all bookmarks displayed as cards with favicon and title
- **Folder navigation** — filter bookmarks by folder with one click
- **Live search** — filter by title or URL as you type
- **Grouped sections** — bookmarks organized by folder when viewing all
- **Real favicons** — pulled via Chrome's internal favicon API, with a letter fallback
- **Clock** — current time displayed in the header
- Works in **Chrome** and **Brave**

---

## Installation

> No build step required. Pure HTML, CSS, and JS.

1. Clone or download this repo
   ```bash
   git clone https://github.com/your-username/bookmark-tab.git
   ```

2. Open Chrome or Brave and navigate to:
   - Chrome → `chrome://extensions/`
   - Brave → `brave://extensions/`

3. Enable **Developer mode** (toggle in the top-right corner)

4. Click **Load unpacked** and select the `bookmark-extension` folder

5. Open a **new tab** — done

---

## Updating After Changes

1. Edit any file in the `bookmark-extension` folder
2. Go back to `chrome://extensions/` (or `brave://extensions/`)
3. Click the **↻ refresh** icon on the Bookmark Tab card
4. Open a new tab to see your changes

---

## File Structure

```
bookmark-extension/
├── manifest.json     # Extension config (Manifest V3)
├── newtab.html       # New tab page markup
├── newtab.css        # Styles
├── newtab.js         # Bookmark logic, search, rendering
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## Permissions Used

| Permission | Reason |
|---|---|
| `bookmarks` | Read your bookmarks tree |
| `favicon` | Fetch favicons via Chrome's internal API |

---

## Browser Support

| Browser | Status |
|---|---|
| Chrome | ✅ Supported |
| Brave | ✅ Supported |
| Edge | ✅ Should work (Chromium-based) |
| Firefox | ❌ Not supported (different extension API) |

---

## License

MIT
