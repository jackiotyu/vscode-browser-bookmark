import * as vscode from 'vscode';
import { ChromiumBrowserPlugin } from '@/lib/plugin/chromium';
import { APP_NAME, PathConfig, HistoryPathConfig } from '@/constants'
import os from 'os';
import path from 'path';

export class ChromePlugin extends ChromiumBrowserPlugin implements ChromiumBrowserPlugin {
    type: 'chrome' = 'chrome';
    defaultBasePath = (() => {
        switch (os.type()) {
            case 'Darwin':
                return `${os.homedir()}/Library/Application Support/Google/Chrome/Default`;
            case 'Windows_NT':
                return path.join(
                    os.homedir(),
                    'AppData',
                    'Local',
                    'Google',
                    'Chrome',
                    'User Data',
                    'Default',
                );
            case 'Linux':
                return path.join(os.homedir(), '.config', 'google-chrome', 'Default');
        }
        return ''
    })()
    get defaultPath() {
        if(!this.defaultBasePath) return this.defaultBasePath;
        return path.join(this.defaultBasePath, 'Bookmarks')
    }
    get defaultHistoryPath() {
        if(!this.defaultBasePath) return this.defaultBasePath;
        return path.join(this.defaultBasePath, 'History')
    }

    get configPath() {
        return vscode.workspace.getConfiguration(APP_NAME).get<string>(PathConfig.Chrome, '');
    }
    get configHistoryPath() {
        return vscode.workspace.getConfiguration(APP_NAME).get<string>(HistoryPathConfig.Chrome, '')
    }
    getBookmarkLocation() {
        return this.configPath || this.defaultPath;
    }
    getHistoryLocation() {
        return this.configHistoryPath || this.defaultHistoryPath;
    }
}
