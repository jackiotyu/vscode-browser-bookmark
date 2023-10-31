import * as vscode from 'vscode';
import os from 'os';

export const checkUseExternal = () => {
    let defaultOpenWith = vscode.workspace
        .getConfiguration('browser-bookmark')
        .get<'external' | 'internal'>('defaultOpenWith', 'external');
    return defaultOpenWith === 'external';
};

export const openInternal = (url: string) => {
    const openCmd = vscode.workspace
        .getConfiguration('browser-bookmark')
        .get<string>('internalBrowserOpenCommand', 'simpleBrowser.api.open');
    vscode.commands.executeCommand(openCmd, vscode.Uri.parse(url));
};

export const openSetting = () => {
    void vscode.commands.executeCommand('workbench.action.openSettings', `@ext:jackiotyu.browser-bookmark`);
};

export const getPlatform = () => {
    if (os.type() === 'Darwin') {
        return 'mac';
    } else if (os.type() === 'Windows_NT') {
        return 'win';
    } else if (os.type() === 'Linux') {
        return 'linux';
    }
    return 'unknown';
};
