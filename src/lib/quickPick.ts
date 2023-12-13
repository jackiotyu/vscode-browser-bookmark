import * as vscode from 'vscode';
import { checkUseExternal, openSetting, openInternal, openExternal } from '@/lib/utils';
import { BrowserType, Bookmark } from '@/type';
import { openExternalButton, openInternalButton, openSettingButton } from '@/lib/quickPick.button';

interface BookmarkPickItem extends vscode.QuickPickItem {
    url: string;
    browser: BrowserType;
    buttons: vscode.QuickInputButton[];
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
        const disposables: vscode.Disposable[] = [];
        const isOpenExternal = checkUseExternal();
        const innerOpenExternal = !isOpenExternal;
        const openExternalTips = vscode.l10n.t('Click to open in {0} browser', vscode.l10n.t('external'));
        const openInternalTips = vscode.l10n.t('Click to open in {0} browser', vscode.l10n.t('internal'));
        const itemButtons = innerOpenExternal ? [openExternalButton] : [openInternalButton];
        const items: BookmarkPickItem[] = distinctBookmark(bookmarkList).map((item) => {
            return {
                label: `${item.name || new URL(item.value).hostname}`,
                detail: '$(circle-small-filled) ' + item.value,
                description: '',
                url: item.value,
                browser: item.type,
                iconPath: vscode.Uri.parse(`https://favicon.yandex.net/favicon/${new URL(item.value).hostname}`),
                buttons: itemButtons,
            };
        });

        const quickPick = vscode.window.createQuickPick<BookmarkPickItem>();
        quickPick.title = vscode.l10n.t('Search Bookmark');
        quickPick.placeholder = isOpenExternal ? openExternalTips : openInternalTips;
        quickPick.items = items;
        quickPick.ignoreFocusOut = false;
        quickPick.canSelectMany = false;
        quickPick.matchOnDescription = true;
        quickPick.matchOnDetail = true;
        quickPick.buttons = [openSettingButton];
        disposables.push(
            quickPick.onDidTriggerButton((btn) => {
                if (btn === openSettingButton) openSetting();
                resolve();
            }),
            quickPick.onDidTriggerItemButton((event) => {
                const item = event.item;
                const btn = event.button;
                if (!item.browser || !item.url || !btn) return;
                switch (btn) {
                    case openExternalButton:
                        openExternal(item.url);
                        break;
                    case openInternalButton:
                        openInternal(item.url);
                        break;
                }
                resolve();
            }),
            quickPick.onDidAccept(() => {
                resolve(quickPick.selectedItems[0]);
            }),
            quickPick.onDidHide(() => {
                disposables.forEach(i => i.dispose());
                disposables.length = 0;
                quickPick.dispose();
            }),
        );
        quickPick.show();
    });
};
