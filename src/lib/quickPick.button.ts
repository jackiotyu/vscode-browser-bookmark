import * as vscode from 'vscode';

export const openExternalButton: vscode.QuickInputButton = {
    iconPath: new vscode.ThemeIcon('link-external'),
    tooltip: vscode.l10n.t('Click to open in {0} browser', vscode.l10n.t('external')),
};

export const openInternalButton: vscode.QuickInputButton = {
    iconPath: new vscode.ThemeIcon('arrow-right'),
    tooltip: vscode.l10n.t('Click to open in {0} browser', vscode.l10n.t('internal')),
};

export const openSettingButton: vscode.QuickInputButton = {
    iconPath: new vscode.ThemeIcon('gear'),
    tooltip: vscode.l10n.t('Open Setting'),
};
