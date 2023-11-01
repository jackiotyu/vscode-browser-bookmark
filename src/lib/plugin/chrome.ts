import * as vscode from 'vscode';
import { ChromiumBrowserPlugin } from '@/lib/plugin/chromium';
import { PathConfig } from '@/constants'
import os from 'os';
import path from 'path';

export class ChromePlugin extends ChromiumBrowserPlugin implements ChromiumBrowserPlugin {
    type: 'chrome' = 'chrome';
    defaultPath = (() => {
        switch (os.type()) {
            case 'Darwin':
                return `${os.homedir()}/Library/Application Support/Google/Chrome/Default/Bookmarks`;
            case 'Windows_NT':
                return path.join(
                    os.homedir(),
                    'AppData',
                    'Local',
                    'Google',
                    'Chrome',
                    'User Data',
                    'Default',
                    'Bookmarks',
                );
            case 'Linux':
                return path.join(os.homedir(), '.config', 'google-chrome', 'Default', 'Bookmarks');
        }
        return ''
    })()
    get configPath() {
        let config = '';
        switch (os.type()) {
            case 'Darwin':
                config = PathConfig.Chrome.mac;
                break;
            case 'Windows_NT':
                config = PathConfig.Chrome.win;
                break;
            case 'Linux':
                config = PathConfig.Chrome.linux;
                break;
        }
        return vscode.workspace.getConfiguration('browser-bookmark').get<string>(config, '');
    }
    getBookmarkLocation() {
        return this.configPath || this.defaultPath;
    }
}
