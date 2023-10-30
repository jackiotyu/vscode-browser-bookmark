import * as vscode from 'vscode';
import {
    BookmarkTree,
    BookmarkItem,
    refreshBookmarkEvent,
} from './lib/treeDataProvider';
import { Commands } from './constants';
import { checkUseExternal, openInternal, openSetting } from './lib/utils';
import { pickBookmark } from './lib/quickPick';
import open from 'open';

export function activate(context: vscode.ExtensionContext) {
    const bookmarkTree = new BookmarkTree(context);

    const openExternal = (url: string) => {
        // FIXME use vscode.env.openExternal ?
        open(url);
    };
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
            vscode.window.showInformationMessage(vscode.l10n.t('Copy Success, link is {0}', item.url));
        }),
        vscode.commands.registerCommand(Commands.refresh, () => {
            refreshBookmarkEvent.fire();
        }),
        vscode.commands.registerCommand(Commands.search, async () => {
            const item = await pickBookmark(
                [
                    ...bookmarkTree.chromePlugin.getBookmarks(),
                    ...bookmarkTree.edgePlugin.getBookmarks(),
                ]
            );
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
    );
}

export function deactivate() {}
