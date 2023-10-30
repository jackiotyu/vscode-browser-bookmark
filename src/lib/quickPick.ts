import * as vscode from 'vscode';
import { checkUseExternal, openSetting } from './utils';
import { BrowserType } from '../type';

interface BookmarkPickItem extends vscode.QuickPickItem {
    url: string;
    browser: BrowserType;
}

interface BookmarkTitleButton extends vscode.QuickInputButton {
    type: 'setting';
}

interface Bookmark {
    name: string;
    value: string;
    type: BrowserType;
}

const distinctBookmark = (bookmarkList: Bookmark[]): Bookmark[] => {
    const set = new Set<string>();
    const result: Bookmark[] = [];
    bookmarkList.forEach((bookmark) => {
        const key = bookmark.name + ' ~~ ' + bookmark.value;
        if (!set.has(key)) {
            set.add(key);
            result.push(bookmark);
        }
    });
    return result;
};

export const pickBookmark = (bookmarkList: Bookmark[]): Promise<BookmarkPickItem | void> => {
    return new Promise((resolve) => {
        const quickPick = vscode.window.createQuickPick<BookmarkPickItem>();
        const items: BookmarkPickItem[] = distinctBookmark(bookmarkList).map((item) => {
            return {
                label: `$(tag) ` + (item.name || item.value),
                detail: item.value,
                description: '$(link)',
                url: item.value,
                browser: item.type,
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
