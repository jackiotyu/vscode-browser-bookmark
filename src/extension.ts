import * as vscode from 'vscode';
import { ChromeBookmarkTree, BookmarkItem, refreshChromeEvent } from './lib/treeDataProvider';
import { Commands } from './constants';

export function activate(context: vscode.ExtensionContext) {
    const chromeBookmarkTree = new ChromeBookmarkTree(context);
    context.subscriptions.push(vscode.window.registerTreeDataProvider(ChromeBookmarkTree.id, chromeBookmarkTree));
    context.subscriptions.push(refreshChromeEvent);
    context.subscriptions.push(
        vscode.commands.registerCommand(Commands.openLink, (url: string, type: 'chrome') => {
            chromeBookmarkTree.chromePlugin.open(url);
        }),
        vscode.commands.registerCommand(Commands.copyLink, async (item: BookmarkItem) => {
            await vscode.env.clipboard.writeText(item.url);
            vscode.window.showInformationMessage('Copy Success, link is ' + item.url);
        }),
        vscode.commands.registerCommand(Commands.refresh, () => {
            refreshChromeEvent.fire();
        }),
        vscode.commands.registerCommand(Commands.search, async () => {
            let items: vscode.QuickPickItem[] = chromeBookmarkTree.chromePlugin.getBookmarks().map(item => {
                return {
                    label: item.name || item.value,
                    detail: item.value,
                    description: "$(link)"
                };
            });

            let item = await vscode.window.showQuickPick(items, {
                matchOnDescription: true,
                matchOnDetail: true,
                placeHolder: "Please input keyword to filter bookmark",
                canPickMany: false,
                ignoreFocusOut: true,
                title: "Search bookmark",
            });
            if(!item) {return;}
            chromeBookmarkTree.chromePlugin.open(item?.detail as string);
        })
    );
}

export function deactivate() {}
