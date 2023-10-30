import * as vscode from 'vscode';
import ChromePlugin, { NestChildren } from './chromePlugin';
import { Commands } from '../constants';

export const chromeTreeEvent = new vscode.EventEmitter<void | BookmarkItem>();
export const refreshChromeEvent = new vscode.EventEmitter<void>();

export class BookmarkItem extends vscode.TreeItem {
    url: string;
    readonly type = 'url';
    constructor(label: string, collapsible: vscode.TreeItemCollapsibleState, url: string) {
        super(label || url, collapsible);
        this.url = url;
        // const faviconUrl = `chrome://favicon/http://${new URL(url).hostname}`;
        const faviconUrl = `https://favicon.yandex.net/favicon/${new URL(url).hostname}`;
        this.iconPath = vscode.Uri.parse(faviconUrl);
        this.tooltip = new vscode.MarkdownString(``, true);
        this.tooltip.appendMarkdown(`$(tag) ${label || url}\n\n`);
        this.tooltip.appendMarkdown(`$(link) ${url}\n\n`);
        this.description = `${url}`;
        this.contextValue = 'browser-bookmark.url';
        this.command = {
            command: Commands.openLink,
            arguments: [url, 'chrome'],
            title: vscode.l10n.t('Open Link'),
            tooltip: url,
        };
    }
}

class BookmarkFolder extends vscode.TreeItem {
    children: NestChildren;
    readonly type = 'folder';
    constructor(label: string, collapsible: vscode.TreeItemCollapsibleState, children: NestChildren) {
        super(label, collapsible);
        this.children = children || [];
        this.iconPath = vscode.ThemeIcon.Folder;
    }
}

type ChromeBookmarkTreeItem = BookmarkFolder | BookmarkItem;

export class ChromeBookmarkTree implements vscode.TreeDataProvider<ChromeBookmarkTreeItem> {
    static readonly id = 'BrowserBookmark.chrome';
    chromePlugin = ChromePlugin;
    _onDidChangeTreeData = chromeTreeEvent;
    onDidChangeTreeData: vscode.Event<void | ChromeBookmarkTreeItem> = chromeTreeEvent.event;
    list: NestChildren[] = [];
    constructor(context: vscode.ExtensionContext) {
        this.refresh();
        context.subscriptions.push(refreshChromeEvent.event(this.refresh.bind(this)));
    }
    refresh() {
        this.list = this.chromePlugin.getBookmarkTree('Default');
        this._onDidChangeTreeData.fire();
    }
    getChildren(element?: ChromeBookmarkTreeItem | undefined): vscode.ProviderResult<ChromeBookmarkTreeItem[]> {
        if (!element) {
            return this.list.map(
                (item) =>
                    new BookmarkFolder(
                        `${item.name} (${item.children.length})`,
                        vscode.TreeItemCollapsibleState.Collapsed,
                        item.children,
                    ),
            );
        }

        if (element.type === 'folder') {
            return element.children.map((item) => {
                if (item.type === 'folder') {
                    return new BookmarkFolder(
                        `${item.name} (${item.children.length})`,
                        vscode.TreeItemCollapsibleState.Collapsed,
                        item.children,
                    );
                }
                return new BookmarkItem(item.name, vscode.TreeItemCollapsibleState.None, item.url);
            });
        }

        return [];
    }
    getTreeItem(element: ChromeBookmarkTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
}
