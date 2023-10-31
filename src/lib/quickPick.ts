import * as vscode from 'vscode';
import { checkUseExternal, openSetting, openInternal, openExternal } from './utils';
import { BrowserType } from '../type';

interface BookmarkButton extends vscode.QuickInputButton {
    type: 'internal' | 'external';
}

interface BookmarkPickItem extends vscode.QuickPickItem {
    url: string;
    browser: BrowserType;
    buttons: BookmarkButton[],
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
        const isOpenExternal = checkUseExternal();
        const innerOpenExternal = !isOpenExternal;
        const openExternalTips = vscode.l10n.t('Click to open in {0} browser', vscode.l10n.t('external'));
        const openInternalTips = vscode.l10n.t('Click to open in {0} browser', vscode.l10n.t('internal'));
        const linkExternalIcon = new vscode.ThemeIcon('link-external');
        const arrowRightIcon = new vscode.ThemeIcon('arrow-right');

        const items: BookmarkPickItem[] = distinctBookmark(bookmarkList).map((item) => {
            return {
                label: `${item.name || new URL(item.value).hostname}`,
                detail: '$(circle-small-filled) ' + item.value,
                description: '',
                url: item.value,
                browser: item.type,
                iconPath: vscode.Uri.parse(`https://favicon.yandex.net/favicon/${new URL(item.value).hostname}`),
                buttons: [
                    {
                        iconPath: innerOpenExternal ? linkExternalIcon : arrowRightIcon,
                        tooltip: innerOpenExternal ?  openExternalTips : openInternalTips,
                        type: innerOpenExternal ? 'external' : 'internal',
                    },
                ],
            };
        });

        quickPick.title = vscode.l10n.t('Search Bookmark');
        quickPick.placeholder = isOpenExternal ? openExternalTips : openInternalTips;
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
        quickPick.onDidTriggerItemButton((event) => {
            const item = event.item;
            const btn = event.button as BookmarkButton;
            if(!item.browser || !item.url || !btn) return;
            if(btn.type === 'external') {
                openExternal(item.url);
            } else {
                openInternal(item.url);
            }
            resolve();
        });
        quickPick.onDidAccept(() => {
            resolve(quickPick.selectedItems[0]);
        });
        quickPick.show();
    });
};
