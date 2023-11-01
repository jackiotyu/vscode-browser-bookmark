import * as vscode from 'vscode';
import { Commands, CTX_URL, CTX_BROWSER, VIEW_BOOKMARK, browsers } from '@/constants';
import { BrowserType, BookmarkData, IPluginService } from '@/type';

export const bookmarkTreeEvent = new vscode.EventEmitter<void | BookmarkItem>();
export const refreshBookmarkEvent = new vscode.EventEmitter<void>();

export class BookmarkItem extends vscode.TreeItem {
    url: string;
    readonly type = 'url';
    browser: BrowserType;
    constructor(label: string, collapsible: vscode.TreeItemCollapsibleState, url: string, browser: 'chrome' | 'edge') {
        super(label || url, collapsible);
        this.url = url;
        // const faviconUrl = `chrome://favicon/http://${new URL(url).hostname}`;
        const faviconUrl = `https://favicon.yandex.net/favicon/${new URL(url).hostname}`;
        this.iconPath = vscode.Uri.parse(faviconUrl);
        this.tooltip = new vscode.MarkdownString(``, true);
        this.tooltip.appendMarkdown(`$(tag) ${label || url}\n\n`);
        this.tooltip.appendMarkdown(`$(link) ${url}\n\n`);
        this.description = `${url}`;
        this.contextValue = CTX_URL;
        this.browser = browser;
        this.command = {
            command: Commands.openLink,
            arguments: [url, browser],
            title: vscode.l10n.t('Open Link'),
            tooltip: url,
        };
    }
}

class BookmarkFolder extends vscode.TreeItem {
    children: BookmarkData;
    readonly type = 'folder';
    browser: BrowserType;
    constructor(
        label: string,
        collapsible: vscode.TreeItemCollapsibleState,
        children: BookmarkData,
        browser: BrowserType,
    ) {
        super(label, collapsible);
        this.children = children || [];
        this.iconPath = vscode.ThemeIcon.Folder;
        this.browser = browser;
    }
}

export class BrowserFolder extends vscode.TreeItem {
    browser: BrowserType;
    readonly type = 'browser';
    constructor(label: BrowserType, collapsible: vscode.TreeItemCollapsibleState, public children: BookmarkData) {
        super(label, collapsible);
        this.browser = label;
        this.contextValue = CTX_BROWSER;
    }
}

type AllBookmarkTreeItem = BrowserFolder | BookmarkFolder | BookmarkItem;

export class BookmarkTree implements vscode.TreeDataProvider<AllBookmarkTreeItem> {
    static readonly id = VIEW_BOOKMARK;
    _onDidChangeTreeData = bookmarkTreeEvent;
    onDidChangeTreeData: vscode.Event<void | AllBookmarkTreeItem> = bookmarkTreeEvent.event;
    constructor(context: vscode.ExtensionContext, private pluginService: IPluginService) {
        this.refresh();
        context.subscriptions.push(refreshBookmarkEvent.event(this.refresh.bind(this)));
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getChildren(element?: AllBookmarkTreeItem | undefined): vscode.ProviderResult<AllBookmarkTreeItem[]> {
        if (!element) {
            return browsers.map((browser: BrowserType) => {
                let list: BookmarkData = this.pluginService.getBookmarkTree(browser);
                return new BrowserFolder(browser, vscode.TreeItemCollapsibleState.Expanded, list);
            });
        }

        if (element.type === 'browser') {
            return element.children.map((item) => {
                if (item.type === 'folder') {
                    return new BookmarkFolder(
                        `${item.name} (${item.children.length})`,
                        vscode.TreeItemCollapsibleState.Collapsed,
                        item.children,
                        element.browser,
                    );
                }
                return new BookmarkItem(item.name, vscode.TreeItemCollapsibleState.None, item.url, element.browser);
            });
        }

        if (element.type === 'folder') {
            return element.children.map((item) => {
                if (item.type === 'folder') {
                    return new BookmarkFolder(
                        `${item.name} (${item.children.length})`,
                        vscode.TreeItemCollapsibleState.Collapsed,
                        item.children,
                        element.browser,
                    );
                }
                return new BookmarkItem(item.name, vscode.TreeItemCollapsibleState.None, item.url, element.browser);
            });
        }

        return [];
    }
    getTreeItem(element: AllBookmarkTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
}
