import * as vscode from 'vscode';
import { ChromeBookmarkTree, BookmarkItem, refreshChromeEvent } from './lib/treeDataProvider';
import { Commands } from './constants';
import { checkUseExternal, openInternal } from './lib/utils';
import { pickBookmark } from './lib/quickPick';

export function activate(context: vscode.ExtensionContext) {
    const chromeBookmarkTree = new ChromeBookmarkTree(context);

    const openExternal = (url: string) => chromeBookmarkTree.chromePlugin.open(url);
    const autoOpenUrl = (url: string) => {
        if (checkUseExternal()) openExternal(url);
        else openInternal(url);
    };

    const chromeTree = vscode.window.createTreeView(ChromeBookmarkTree.id, {
        treeDataProvider: chromeBookmarkTree,
        showCollapseAll: true,
    });
    context.subscriptions.push(chromeTree);
    context.subscriptions.push(refreshChromeEvent);
    context.subscriptions.push(
        vscode.commands.registerCommand(Commands.openLink, (url: string, type: 'chrome') => {
            autoOpenUrl(url);
        }),
        vscode.commands.registerCommand(Commands.copyLink, async (item: BookmarkItem) => {
            await vscode.env.clipboard.writeText(item.url);
            vscode.window.showInformationMessage('Copy Success, link is ' + item.url);
        }),
        vscode.commands.registerCommand(Commands.refresh, () => {
            refreshChromeEvent.fire();
        }),
        vscode.commands.registerCommand(Commands.search, async () => {
            const item = await pickBookmark(chromeBookmarkTree.chromePlugin.getBookmarks());
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
        vscode.commands.registerCommand(Commands.openSetting, () => {
            void vscode.commands.executeCommand('workbench.action.openSettings', `@ext:jackiotyu.browser-bookmark`);
        }),
    );
}

export function deactivate() {}
