# Browser Bookmark
*Quick open url through browser's bookmark*

![Preview](https://cdn.jsdelivr.net/gh/jackiotyu/vscode-browser-bookmark@0.1.1/images/preview.png)

### Usage

1. Open search.
- Open `Browser Bookmark` panel to search.
- Click `Cmd + Shift + v` in macOS to open `Browser Bookmark` search quickly.
- Click `Ctrl + Shift + v` in windows/linux to open `Browser Bookmark` search quickly.

2. Click the link to open in Chrome or internal browser.

### Setting
```json
{
    // Set "external" to open bookmark in external browser,
    // or "internal" to open in internal browser
    // while click the "Browser Bookmark" tree item
    // and the quick item in "Search Bookmark".
    "browser-bookmark.defaultOpenWith": "external", // or "internal"

    // Configure command for open internal browser
    // If you prefer other extension, such as "Browse Lite",
    // Set it to "browse-lite.open" to open through "Browse Lite".
    "browser-bookmark.internalBrowserOpenCommand": "simpleBrowser.api.open",

    // Configuration for special bookmark file path.
    // Chrome's bookmark file path.
    "browser-bookmark.path.chrome": "",
    // Microsoft Edge's bookmark file path.
    "browser-bookmark.path.edge": ""
}
```

## Roadmap

- [x] Edge bookmark.
- [x] Chrome bookmark.
- [ ] Firefox bookmark.
- [ ] Safari bookmark.
- [ ] Multi-language Support.
    - [x] Chinese.