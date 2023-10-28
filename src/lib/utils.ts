import * as vscode from 'vscode';

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