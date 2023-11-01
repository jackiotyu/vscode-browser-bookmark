import * as vscode from 'vscode';
import { ChromiumBrowserPlugin } from '@/lib/plugin/chromium';
import { PathConfig } from '@/constants'
import os from 'os';
import path from 'path';

export class EdgePlugin extends ChromiumBrowserPlugin implements ChromiumBrowserPlugin {
    type: 'edge' = 'edge';
    defaultPath = (() => {
        switch (os.type()) {
            case 'Darwin':
                return `${os.homedir()}/Library/Application Support/Microsoft Edge/Default/Bookmarks`;
            case 'Windows_NT':
               return path.join(
                    os.homedir(),
                    'AppData',
                    'Local',
                    'Microsoft',
                    'Edge',
                    'User Data',
                    'Default',
                    'Bookmarks',
                );
            case 'Linux':
                return path.join(os.homedir(), '.config', 'microsoft-edge', 'Default', 'Bookmarks');
        }
        return '';
    })()
    get configPath() {
        let config = '';
        switch (os.type()) {
            case 'Darwin':
                config = PathConfig.Edge.mac;
                break;
            case 'Windows_NT':
                config = PathConfig.Edge.win;
                break;
            case 'Linux':
                config = PathConfig.Edge.linux;
                break;
        }
        return vscode.workspace.getConfiguration('browser-bookmark').get<string>(config, '');
    }
    getBookmarkLocation() {
        return this.configPath || this.defaultPath;
    }
}
