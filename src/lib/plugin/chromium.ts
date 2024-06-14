import { BookmarkData, Bookmark, IBookmarkFolder, BookmarkItem, BrowserType, IBrowserPlugin } from '@/type';
import fs from 'fs';

function isFolder(a: { [x: string | number]: any; children?: Array<any> }): a is IBookmarkFolder {
    return !!a.children;
}

// 统一插件配置
export abstract class ChromiumBrowserPlugin implements IBrowserPlugin {
    abstract type: BrowserType;
    abstract defaultPath: string;
    abstract get configPath(): string;
    abstract getBookmarkLocation(): string;
    public async getBookmarkTree(): Promise<BookmarkData> {
        try {
            const location = this.getBookmarkLocation();
            let data = fs.readFileSync(location, 'utf8');
            const obj = JSON.parse(data);
            const roots = obj.roots;
            return Object.keys(roots).map((key) => roots[key]) as BookmarkData;
        } catch {
            return [];
        }
    }
    public async getBookmarks(): Promise<Array<Bookmark>> {
        try {
            const location = this.getBookmarkLocation();
            let data = fs.readFileSync(location, 'utf8');
            const obj = JSON.parse(data);
            return ChromiumBrowserPlugin.flattenBookmarkTree(obj.roots, this.type);
        } catch {
            return [];
        }
    }
    protected static flattenBookmarkTree(data: Record<string, IBookmarkFolder>, type: BrowserType): Array<Bookmark> {
        let it: IterableIterator<BookmarkItem>;
        let res;
        let bookmarkItems: Bookmark[] = [];

        // Traverse all roots keys
        for (let key in data) {
            it = ChromiumBrowserPlugin.traverseTree(data[key]);
            res = it.next();
            while (!res.done) {
                if (res.value.type === 'url') {
                    bookmarkItems.push({ name: res.value.name, value: res.value.url, type });
                }
                res = it.next();
            }
        }
        return bookmarkItems;
    }
    protected static *traverseTree(data: BookmarkData | IBookmarkFolder): IterableIterator<BookmarkItem> {
        if (!data) return;
        if (isFolder(data)) {
            yield* ChromiumBrowserPlugin.traverseTree(data.children);
        } else {
            for (var i = 0; i < data.length; i++) {
                var val = data[i];
                yield val;
                if (isFolder(val) && val.children) {
                    yield* ChromiumBrowserPlugin.traverseTree(val.children);
                }
            }
        }
    }
}
