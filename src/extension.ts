import * as vscode from 'vscode';
import { ChromeBookmarkTree, BookmarkItem, refreshChromeEvent } from './lib/treeDataProvider';
import { Commands } from './constants';

export function activate(context: vscode.ExtensionContext) {
    const chromeBookmarkTree = new ChromeBookmarkTree(context);

    const openExternal = (url: string) => chromeBookmarkTree.chromePlugin.open(url);
    const openInternal = (url: string) => {
        const openCmd = vscode.workspace
        .getConfiguration('browser-bookmark')
        .get<string>('internalBrowserOpenCommand', 'simpleBrowser.api.open');
        vscode.commands.executeCommand(openCmd, vscode.Uri.parse(url));
    };

    const autoOpenUrl = (url: string) => {
        let defaultOpenWith = vscode.workspace
            .getConfiguration('browser-bookmark')
            .get<'external' | 'internal'>('defaultOpenWith', 'external');
        if (defaultOpenWith === 'external') openExternal(url);
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
            interface BookmarkPickItem extends vscode.QuickPickItem {
                url: string;
            }

            let items: BookmarkPickItem[] = chromeBookmarkTree.chromePlugin.getBookmarks().map((item) => {
                return {
                    label: item.name || item.value,
                    detail: item.value,
                    description: '$(link)',
                    url: item.value,
                };
            });

            let item = await vscode.window.showQuickPick(items, {
                matchOnDescription: true,
                matchOnDetail: true,
                placeHolder: 'Please input keyword to filter bookmark',
                canPickMany: false,
                ignoreFocusOut: false,
                title: 'Search Bookmark',
            });
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
        })
    );
}

export function deactivate() {}
