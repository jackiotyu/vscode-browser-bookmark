import * as vscode from 'vscode';
import os from 'os';
import { APP_NAME, PathConfig } from '@/constants';

export const checkUseExternal = () => {
    let defaultOpenWith = vscode.workspace
        .getConfiguration(APP_NAME)
        .get<'external' | 'internal'>('defaultOpenWith', 'external');
    return defaultOpenWith === 'external';
};

export const openInternal = (url: string) => {
    const openCmd = vscode.workspace
        .getConfiguration(APP_NAME)
        .get<string>('internalBrowserOpenCommand')?.trim() || 'simpleBrowser.api.open';
    return vscode.commands.executeCommand(openCmd, vscode.Uri.parse(url));
};

export const openExternal = (url: string) => {
    return vscode.env.openExternal(vscode.Uri.parse(url));
};

export const openSetting = () => {
    void vscode.commands.executeCommand('workbench.action.openSettings', `@ext:jackiotyu.browser-bookmark`);
};

export const platform = (() => {
    if (os.type() === 'Darwin') {
        return 'mac';
    } else if (os.type() === 'Windows_NT') {
        return 'win';
    } else if (os.type() === 'Linux') {
        return 'linux';
    }
    return 'unknown';
})();
