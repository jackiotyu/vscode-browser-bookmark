import * as vscode from 'vscode';
import { checkUseExternal, openSetting } from './utils';
import { Bookmark } from './chromePlugin';

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
                label: `$(tag) ` + (item.name || item.value),
                detail: item.value,
                description: '$(link)',
                url: item.value,
            };
        });

        quickPick.title = vscode.l10n.t('Search Bookmark');
        quickPick.placeholder = vscode.l10n.t(
            'Click to open in {0} browser',
            checkUseExternal() ? vscode.l10n.t('external') : vscode.l10n.t('internal'),
        );
        quickPick.items = items;
        quickPick.ignoreFocusOut = false;
        quickPick.canSelectMany = false;
        quickPick.matchOnDescription = true;
        quickPick.matchOnDetail = true;
        quickPick.buttons = [
            {
                iconPath: new vscode.ThemeIcon('gear'),
                tooltip: vscode.l10n.t('Open Setting'),
                type: 'setting',
            },
        ] as BookmarkTitleButton[];
        quickPick.onDidTriggerButton((btn) => {
            if ((btn as BookmarkTitleButton).type === 'setting') {
                openSetting();
            }
            resolve();
        });
        quickPick.onDidAccept(() => {
            resolve(quickPick.selectedItems[0]);
        });
        quickPick.show();
    });
};
