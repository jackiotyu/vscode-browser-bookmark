import * as vscode from 'vscode';
import { BookmarkTree, BookmarkItem, BrowserFolder, refreshBookmarkEvent } from './lib/treeDataProvider';
import { Commands } from './constants';
import { checkUseExternal, openInternal, openExternal, openSetting, getPlatform } from './lib/utils';
import { pickBookmark } from './lib/quickPick';
import { ChromePlugin } from './lib/chromePlugin';
import { EdgePlugin } from './lib/edgePlugin';
import path from 'path';
// import open from 'open';

export function activate(context: vscode.ExtensionContext) {
    const bookmarkTree = new BookmarkTree(context);
    const autoOpenUrl = (url: string) => {
        if (checkUseExternal()) openExternal(url);
        else openInternal(url);
    };

    const bookmarkTreeView = vscode.window.createTreeView(BookmarkTree.id, {
        treeDataProvider: bookmarkTree,
        showCollapseAll: true,
    });
    context.subscriptions.push(bookmarkTreeView);
    context.subscriptions.push(refreshBookmarkEvent);
    context.subscriptions.push(
        vscode.commands.registerCommand(Commands.openLink, (url: string) => {
            autoOpenUrl(url);
        }),
        vscode.commands.registerCommand(Commands.copyLink, async (item: BookmarkItem) => {
            await vscode.env.clipboard.writeText(item.url);
            vscode.window.showInformationMessage(vscode.l10n.t('Copy success, link is {0}', item.url));
        }),
        vscode.commands.registerCommand(Commands.refresh, () => {
            refreshBookmarkEvent.fire();
        }),
        vscode.commands.registerCommand(Commands.search, async () => {
            const item = await pickBookmark([
                ...bookmarkTree.chromePlugin.getBookmarks(),
                ...bookmarkTree.edgePlugin.getBookmarks(),
            ]);
            if (!item) {
                return;
            }
            autoOpenUrl(item.url);
        }),
        vscode.commands.registerCommand(Commands.openInternal, async (item: BookmarkItem) => {
            item && openInternal(item.url);
        }),
        vscode.commands.registerCommand(Commands.openExternal, async (item: BookmarkItem) => {
            item && openExternal(item.url);
        }),
        vscode.commands.registerCommand(Commands.openSetting, openSetting),
        vscode.commands.registerCommand(Commands.changeBookmarkFile, async (item: BrowserFolder) => {
            if (!item) return;
            let browserLabel = item.browser;
            let basePath = '';
            switch (browserLabel) {
                case 'chrome':
                    basePath = ChromePlugin.getBookmarkLocation() || '';
                    break;
                case 'edge':
                    basePath = EdgePlugin.getBookmarkLocation() || '';
                    break;
            }
            if (!basePath) return;
            const fileList = await vscode.window.showOpenDialog({
                canSelectFiles: true,
                canSelectMany: false,
                title: vscode.l10n.t('Select Bookmark File'),
                defaultUri: vscode.Uri.file(path.resolve(basePath)),
            });
            if (!fileList?.length) return;
            const file = fileList[0];
            let key = `path.${getPlatform()}.${browserLabel}`;
            vscode.workspace.getConfiguration('browser-bookmark').update(key, file.fsPath, true);
        }),
    );
}

export function deactivate() {}
