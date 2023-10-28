import * as vscode from 'vscode';
import { checkUseExternal } from './utils';
import { Bookmark } from './chromePlugin';
import { Commands } from '../constants';

interface BookmarkPickItem extends vscode.QuickPickItem {
    url: string;
}

interface BookmarkTitleButton extends vscode.QuickInputButton {
    type: 'setting';
}

export const pickBookmark = (bookmarkList: Bookmark[]): Promise<BookmarkPickItem | void> => {
    return new Promise((resolve) => {
        const quickPick = vscode.window.createQuickPick<BookmarkPickItem>();
        const items: BookmarkPickItem[] = bookmarkList.map((item) => {
            return {
                label: item.name || item.value,
                detail: item.value,
                description: '$(link)',
                url: item.value,
            };
        });

        quickPick.title = 'Search Bookmark';
        quickPick.placeholder = `Click to open in ${checkUseExternal() ? 'external' : 'internal'} browser`;
        quickPick.items = items;
        quickPick.ignoreFocusOut = false;
        quickPick.canSelectMany = false;
        quickPick.matchOnDescription = true;
        quickPick.matchOnDetail = true;
        quickPick.buttons = [
            {
                iconPath: new vscode.ThemeIcon('gear'),
                tooltip: 'Open Setting',
                type: 'setting'
            },
        ] as BookmarkTitleButton[];
        quickPick.onDidTriggerButton((btn) => {
            if((btn as BookmarkTitleButton).type === 'setting') {
                vscode.commands.executeCommand(Commands.openSetting);
            }
            resolve();
        });
        quickPick.onDidAccept(() => {
            resolve(quickPick.selectedItems[0]);
        });
        quickPick.show();
    });
};
